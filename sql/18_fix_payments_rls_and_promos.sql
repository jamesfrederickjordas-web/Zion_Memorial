-- =========================================================================
-- Zion Memorial Garden: Fix Client Payments INSERT/SELECT RLS, Triggers & Backfill
-- =========================================================================
-- Run this script once in the Supabase SQL Editor.

-- Fix payment triggers to resolve user_id via reservation_id (payments table has no user_id column)
CREATE OR REPLACE FUNCTION public.trg_notify_admin_new_payment()
RETURNS TRIGGER AS $$
DECLARE
    v_client TEXT;
BEGIN
    SELECT COALESCE(p.full_name, p.username, 'Client') INTO v_client
    FROM public.reservations r
    LEFT JOIN public.profiles p ON p.id = r.user_id
    WHERE r.id = NEW.reservation_id;

    PERFORM public.notify_all_staff_and_admins(
        'New Payment Submitted',
        COALESCE(v_client, 'A client') || ' submitted a payment of ₱' || TO_CHAR(COALESCE(NEW.amount, 0), 'FM999,999,990.00') || ' (' || COALESCE(NEW.payment_method, 'Payment') || ').',
        'payment',
        'info',
        'reservations',
        NEW.id::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.trg_notify_client_payment_update()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        SELECT user_id INTO v_user_id FROM public.reservations WHERE id = NEW.reservation_id;
        IF v_user_id IS NOT NULL THEN
            IF LOWER(COALESCE(NEW.status, '')) IN ('paid', 'verified', 'approved', 'completed') THEN
                INSERT INTO public.notifications (user_id, title, message, category, type, link_action, reference_id)
                VALUES (
                    v_user_id,
                    'Payment Confirmed ✅',
                    'Your payment of ₱' || TO_CHAR(COALESCE(NEW.amount, 0), 'FM999,999,990.00') || ' has been verified by admin.',
                    'payment', 'success', 'myreservation', NEW.id::text
                );
            ELSIF LOWER(COALESCE(NEW.status, '')) IN ('rejected', 'failed') THEN
                INSERT INTO public.notifications (user_id, title, message, category, type, link_action, reference_id)
                VALUES (
                    v_user_id,
                    'Payment Requires Attention',
                    'Your payment of ₱' || TO_CHAR(COALESCE(NEW.amount, 0), 'FM999,999,990.00') || ' was marked as ' || LOWER(NEW.status) || '.',
                    'payment', 'danger', 'myreservation', NEW.id::text
                );
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can view payments for their reservations" ON public.payments;
CREATE POLICY "Clients can view payments for their reservations"
ON public.payments FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.reservations r
        WHERE r.id = payments.reservation_id AND r.user_id = auth.uid()
    ) OR public.current_user_role() IN ('admin', 'staff', 'administrator')
);

DROP POLICY IF EXISTS "Clients can submit payments for own reservations" ON public.payments;
CREATE POLICY "Clients can submit payments for own reservations"
ON public.payments FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.reservations r
        WHERE r.id = payments.reservation_id AND r.user_id = auth.uid()
    ) OR public.current_user_role() IN ('admin', 'staff', 'administrator')
);

DROP POLICY IF EXISTS "Staff and Admin can manage payments" ON public.payments;
CREATE POLICY "Staff and Admin can manage payments"
ON public.payments FOR ALL TO authenticated
USING (public.current_user_role() IN ('admin', 'staff', 'administrator'))
WITH CHECK (public.current_user_role() IN ('admin', 'staff', 'administrator'));

-- Backfill missing payment records for existing reservations that already have total_paid > 0
INSERT INTO public.payments (
    reservation_id,
    payment_reference,
    amount,
    payment_type,
    payment_method,
    status,
    paid_at,
    created_at
)
SELECT
    r.id,
    COALESCE(
        substring(r.notes FROM '\[Ref:\s*([^\]]+)\]'),
        'ZMG-HIST-' || r.id::text
    ),
    r.total_paid,
    CASE WHEN r.payment_method = 'FULL_PAYMENT' THEN 'FULL_PAYMENT' ELSE 'DOWN_PAYMENT' END,
    CASE WHEN r.notes ILIKE '%Cash%' THEN 'Cash' ELSE 'GCash' END,
    'COMPLETED',
    COALESCE(r.updated_at, r.created_at, NOW()),
    COALESCE(r.created_at, NOW())
FROM public.reservations r
WHERE COALESCE(r.total_paid, 0) > 0
  AND NOT EXISTS (
      SELECT 1 FROM public.payments p WHERE p.reservation_id = r.id
  );
