-- ==============================================================================
-- ZION MEMORIAL GARDEN - PHASE 3: GCASH AUTO-DEBIT (XENDIT LINK & PAY)
-- Google Play-style flow: link GCash once -> server auto-charges due payments.
--
-- Run this whole file once in the Supabase SQL Editor AFTER 01-05.
-- Safe to re-run (idempotent).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. LINKED PAYMENT METHODS (stores Xendit TOKENS only - never MPIN / passwords)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'XENDIT',
    channel_code TEXT NOT NULL DEFAULT 'GCASH',
    xendit_customer_id TEXT,
    xendit_payment_method_id TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
        status IN ('PENDING', 'ACTIVE', 'INACTIVE', 'EXPIRED', 'FAILED')
    ),
    account_label TEXT,                 -- masked / display label returned by GCash (if any)
    auto_debit_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_status ON public.payment_methods(status);

-- ------------------------------------------------------------------------------
-- 2. MONTHLY INSTALLMENT SCHEDULE (one row per due month)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_schedules (
    id BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    installment_no INT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
        status IN ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED')
    ),
    attempts INT NOT NULL DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    last_error TEXT,
    payment_reference TEXT,
    reminder_sent_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (reservation_id, installment_no)
);

CREATE INDEX IF NOT EXISTS idx_payment_schedules_due ON public.payment_schedules(due_date, status);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_user ON public.payment_schedules(user_id);

-- ------------------------------------------------------------------------------
-- 3. WEBHOOK / GATEWAY EVENT LOG (audit trail)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_gateway_events (
    id BIGSERIAL PRIMARY KEY,
    provider TEXT NOT NULL DEFAULT 'XENDIT',
    event_type TEXT,
    reference TEXT,
    payload JSONB NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. EXTEND PAYMENTS TABLE WITH GATEWAY COLUMNS
-- ------------------------------------------------------------------------------
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS gateway TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS gateway_payment_request_id TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS gateway_payment_id TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS schedule_id BIGINT REFERENCES public.payment_schedules(id) ON DELETE SET NULL;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS failure_reason TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS receipt_emailed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_payments_gateway_pr ON public.payments(gateway_payment_request_id);

-- ------------------------------------------------------------------------------
-- 5. SCHEDULE GENERATOR (auto-runs for every new INSTALLMENT reservation)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.zmg_generate_payment_schedule(p_reservation_id BIGINT)
RETURNS INT AS $$
DECLARE
    r RECORD;
    i INT;
    v_monthly NUMERIC(12, 2);
    v_financed NUMERIC(12, 2);
    v_amount NUMERIC(12, 2);
    v_allocated NUMERIC(12, 2) := 0;
    v_created INT := 0;
BEGIN
    SELECT * INTO r FROM public.reservations WHERE id = p_reservation_id;
    IF NOT FOUND OR r.payment_method <> 'INSTALLMENT' OR COALESCE(r.installment_term_months, 0) <= 0 THEN
        RETURN 0;
    END IF;

    IF EXISTS (SELECT 1 FROM public.payment_schedules WHERE reservation_id = p_reservation_id) THEN
        RETURN 0;
    END IF;

    v_financed := GREATEST(r.total_price - r.down_payment_amount, 0);
    IF v_financed <= 0 THEN
        RETURN 0;
    END IF;
    v_monthly := ROUND(v_financed / r.installment_term_months, 2);

    FOR i IN 1..r.installment_term_months LOOP
        IF i = r.installment_term_months THEN
            v_amount := v_financed - v_allocated;   -- last month absorbs rounding
        ELSE
            v_amount := v_monthly;
        END IF;
        v_allocated := v_allocated + v_amount;

        INSERT INTO public.payment_schedules (reservation_id, user_id, installment_no, amount, due_date)
        VALUES (r.id, r.user_id, i, v_amount, (r.reservation_date + make_interval(months => i))::DATE);
        v_created := v_created + 1;
    END LOOP;

    RETURN v_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.zmg_after_reservation_insert_schedule()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.zmg_generate_payment_schedule(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_zmg_generate_schedule ON public.reservations;
CREATE TRIGGER trg_zmg_generate_schedule
    AFTER INSERT ON public.reservations
    FOR EACH ROW EXECUTE FUNCTION public.zmg_after_reservation_insert_schedule();

-- Cancel open schedules when a reservation is cancelled / rejected
CREATE OR REPLACE FUNCTION public.zmg_cancel_schedules_on_reservation_cancel()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('CANCELLED', 'REJECTED') AND OLD.status NOT IN ('CANCELLED', 'REJECTED') THEN
        UPDATE public.payment_schedules
        SET status = 'CANCELLED', updated_at = NOW()
        WHERE reservation_id = NEW.id AND status IN ('PENDING', 'FAILED');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_zmg_cancel_schedules ON public.reservations;
CREATE TRIGGER trg_zmg_cancel_schedules
    AFTER UPDATE ON public.reservations
    FOR EACH ROW EXECUTE FUNCTION public.zmg_cancel_schedules_on_reservation_cancel();

-- Backfill schedules for existing installment reservations
DO $$
DECLARE rid BIGINT;
BEGIN
    FOR rid IN
        SELECT r.id FROM public.reservations r
        WHERE r.payment_method = 'INSTALLMENT'
          AND r.status NOT IN ('CANCELLED', 'REJECTED')
          AND NOT EXISTS (SELECT 1 FROM public.payment_schedules s WHERE s.reservation_id = r.id)
    LOOP
        PERFORM public.zmg_generate_payment_schedule(rid);
    END LOOP;
END $$;

-- ------------------------------------------------------------------------------
-- 6. ATOMIC "APPLY PAYMENT" (called only by the Edge Functions / service role)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.zmg_apply_payment_to_reservation(p_reservation_id BIGINT, p_amount NUMERIC)
RETURNS public.reservations AS $$
DECLARE
    updated public.reservations;
BEGIN
    UPDATE public.reservations
    SET total_paid = ROUND(total_paid + p_amount, 2),
        balance = GREATEST(ROUND(total_price - (total_paid + p_amount), 2), 0),
        status = CASE
            WHEN GREATEST(total_price - (total_paid + p_amount), 0) <= 0 THEN 'COMPLETED'
            ELSE status
        END,
        updated_at = NOW()
    WHERE id = p_reservation_id
    RETURNING * INTO updated;
    RETURN updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.zmg_apply_payment_to_reservation(BIGINT, NUMERIC) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.zmg_apply_payment_to_reservation(BIGINT, NUMERIC) TO service_role;

REVOKE ALL ON FUNCTION public.zmg_generate_payment_schedule(BIGINT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.zmg_generate_payment_schedule(BIGINT) TO service_role;

-- ------------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY
--    Clients can only READ their own rows. All writes go through Edge Functions
--    (service role), so a client can never mark a bill as paid by themselves.
-- ------------------------------------------------------------------------------
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_gateway_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own payment methods" ON public.payment_methods;
CREATE POLICY "Users view own payment methods"
ON public.payment_methods FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.current_user_role() IN ('admin', 'staff'));

DROP POLICY IF EXISTS "Users view own payment schedules" ON public.payment_schedules;
CREATE POLICY "Users view own payment schedules"
ON public.payment_schedules FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.current_user_role() IN ('admin', 'staff'));

DROP POLICY IF EXISTS "Staff and Admin manage payment schedules" ON public.payment_schedules;
CREATE POLICY "Staff and Admin manage payment schedules"
ON public.payment_schedules FOR ALL
TO authenticated
USING (public.current_user_role() IN ('admin', 'staff'));

DROP POLICY IF EXISTS "Admins view gateway events" ON public.payment_gateway_events;
CREATE POLICY "Admins view gateway events"
ON public.payment_gateway_events FOR SELECT
TO authenticated
USING (public.current_user_role() IN ('admin', 'staff'));

-- Allow the payments table to accept the monthly type used by auto-debit
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_payment_type_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_payment_type_check
    CHECK (payment_type IN ('DOWN_PAYMENT', 'INSTALLMENT', 'FULL_PAYMENT', 'MONTHLY_AMORTIZATION', 'BALANCE_PAYOFF'));

