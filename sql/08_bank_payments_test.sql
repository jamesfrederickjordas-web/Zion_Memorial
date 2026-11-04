-- ==============================================================================
-- ZION MEMORIAL GARDEN - PHASE 3B: BANK PAYMENTS (TEST MODE / SANDBOX)
-- Allows bank transfer and online banking payments for reservations,
-- initial down payments, monthly installments, and full balance payoffs.
-- ==============================================================================

-- 1. Ensure 'Bank Transfer' is in the allowed payment methods for payments table
DO $$
BEGIN
    ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_payment_method_check;
    ALTER TABLE public.payments ADD CONSTRAINT payments_payment_method_check
        CHECK (payment_method IN ('Cash', 'Card', 'GCash', 'Maya', 'Bank Transfer'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 2. Allow authenticated clients to insert payments for their own reservations
DROP POLICY IF EXISTS "Clients can record payments for their reservations" ON public.payments;
CREATE POLICY "Clients can record payments for their reservations"
ON public.payments FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.reservations r
        WHERE r.id = payments.reservation_id AND r.user_id = auth.uid()
    ) OR public.current_user_role() IN ('admin', 'staff')
);

-- 3. Allow clients to update their own payment schedules when recording payments
DROP POLICY IF EXISTS "Clients can update own payment schedules on payment" ON public.payment_schedules;
CREATE POLICY "Clients can update own payment schedules on payment"
ON public.payment_schedules FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR public.current_user_role() IN ('admin', 'staff'))
WITH CHECK (user_id = auth.uid() OR public.current_user_role() IN ('admin', 'staff'));

-- 4. Atomic RPC to execute Bank Payment (Test Mode Sandbox)
CREATE OR REPLACE FUNCTION public.zmg_record_bank_payment_test(
    p_reservation_id BIGINT,
    p_schedule_id BIGINT DEFAULT NULL,
    p_amount NUMERIC DEFAULT 0,
    p_bank_name TEXT DEFAULT 'BDO Unibank',
    p_payment_ref TEXT DEFAULT NULL,
    p_payment_type TEXT DEFAULT 'INSTALLMENT'
)
RETURNS JSONB AS $$
DECLARE
    v_res public.reservations;
    v_caller UUID := auth.uid();
    v_role TEXT := public.current_user_role();
    v_ref TEXT := COALESCE(p_payment_ref, 'BNK-TEST-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)));
    v_new_paid NUMERIC(12, 2);
    v_new_balance NUMERIC(12, 2);
    v_new_status TEXT;
    v_pmt_id BIGINT;
BEGIN
    SELECT * INTO v_res FROM public.reservations WHERE id = p_reservation_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reservation % not found', p_reservation_id;
    END IF;

    -- Security check: caller must own reservation or be staff/admin
    IF v_res.user_id <> v_caller AND v_role NOT IN ('admin', 'staff') THEN
        RAISE EXCEPTION 'Permission denied to record payment for this reservation.';
    END IF;

    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Payment amount must be greater than zero.';
    END IF;

    -- 1. Insert payment into payments table
    INSERT INTO public.payments (
        reservation_id,
        schedule_id,
        payment_reference,
        amount,
        payment_type,
        payment_method,
        status,
        paid_at
    ) VALUES (
        p_reservation_id,
        p_schedule_id,
        v_ref,
        p_amount,
        COALESCE(p_payment_type, 'INSTALLMENT'),
        'Bank Transfer',
        'COMPLETED',
        NOW()
    ) RETURNING id INTO v_pmt_id;

    -- 2. Mark payment schedule as PAID if schedule_id is provided
    IF p_schedule_id IS NOT NULL THEN
        UPDATE public.payment_schedules
        SET status = 'PAID',
            payment_reference = v_ref,
            paid_at = NOW(),
            updated_at = NOW()
        WHERE id = p_schedule_id;
    END IF;

    -- 3. Atomically update reservation total_paid, balance and status
    v_new_paid := ROUND(COALESCE(v_res.total_paid, 0) + p_amount, 2);
    v_new_balance := GREATEST(ROUND(v_res.total_price - v_new_paid, 2), 0);
    v_new_status := CASE WHEN v_new_balance <= 0 THEN 'COMPLETED' ELSE v_res.status END;

    UPDATE public.reservations
    SET total_paid = v_new_paid,
        balance = v_new_balance,
        status = v_new_status,
        updated_at = NOW()
    WHERE id = p_reservation_id
    RETURNING * INTO v_res;

    RETURN jsonb_build_object(
        'success', true,
        'payment_id', v_pmt_id,
        'payment_reference', v_ref,
        'total_paid', v_new_paid,
        'balance', v_new_balance,
        'status', v_new_status,
        'bank_name', p_bank_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.zmg_record_bank_payment_test(BIGINT, BIGINT, NUMERIC, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.zmg_record_bank_payment_test(BIGINT, BIGINT, NUMERIC, TEXT, TEXT, TEXT) TO authenticated;

