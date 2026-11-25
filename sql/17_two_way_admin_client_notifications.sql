-- =========================================================================
-- Zion Memorial Garden: Full Two-Way Admin <-> Client Realtime Notifications
-- & Maintenance RLS Fix
-- =========================================================================
-- Run this script once in the Supabase SQL Editor.

-- 1. Maintenance Visits RLS (Clients can view, request, AND cancel own requests; Staff/Admin can manage all)
ALTER TABLE public.maintenance_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view visits they requested" ON public.maintenance_visits;
CREATE POLICY "Users can view visits they requested"
ON public.maintenance_visits FOR SELECT TO authenticated
USING (requested_by = auth.uid() OR public.current_user_role() IN ('admin', 'staff'));

DROP POLICY IF EXISTS "Users can cancel own scheduled maintenance visits" ON public.maintenance_visits;
CREATE POLICY "Users can cancel own scheduled maintenance visits"
ON public.maintenance_visits FOR UPDATE TO authenticated
USING (requested_by = auth.uid() AND status IN ('scheduled', 'pending'))
WITH CHECK (requested_by = auth.uid() AND status = 'cancelled');

DROP POLICY IF EXISTS "Staff can view and update maintenance visits" ON public.maintenance_visits;
CREATE POLICY "Staff can view and update maintenance visits"
ON public.maintenance_visits FOR ALL TO authenticated
USING (public.current_user_role() IN ('admin', 'staff'))
WITH CHECK (public.current_user_role() IN ('admin', 'staff'));

-- 2. Helper function to notify all Admin & Staff users
CREATE OR REPLACE FUNCTION public.notify_all_staff_and_admins(
    p_title TEXT,
    p_message TEXT,
    p_category TEXT DEFAULT 'general',
    p_type TEXT DEFAULT 'info',
    p_link_action TEXT DEFAULT NULL,
    p_reference_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.notifications (user_id, title, message, category, type, link_action, reference_id)
    SELECT id, p_title, p_message, p_category, p_type, p_link_action, p_reference_id
    FROM public.profiles
    WHERE role IN ('admin', 'staff');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CLIENT -> ADMIN TRIGGERS
-- 3A. New Reservation submitted by client
CREATE OR REPLACE FUNCTION public.trg_notify_admin_new_reservation()
RETURNS TRIGGER AS $$
DECLARE
    v_plot TEXT;
    v_client TEXT;
BEGIN
    SELECT plot_identifier INTO v_plot FROM public.memorial_spaces WHERE id = NEW.space_id;
    SELECT COALESCE(full_name, username, 'Client') INTO v_client FROM public.profiles WHERE id = NEW.user_id;

    PERFORM public.notify_all_staff_and_admins(
        'New Plot Reservation: #' || COALESCE(NEW.reservation_number, NEW.id::text),
        COALESCE(v_client, 'A client') || ' submitted a ' || COALESCE(NEW.plan_type, 'Pre-Need') || ' reservation for plot ' || COALESCE(v_plot, 'N/A') || '.',
        'reservation',
        'info',
        'reservations',
        NEW.id::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_admin_new_reservation ON public.reservations;
CREATE TRIGGER trg_notify_admin_new_reservation
AFTER INSERT ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.trg_notify_admin_new_reservation();

-- 3B. New Payment submitted by client
CREATE OR REPLACE FUNCTION public.trg_notify_admin_new_payment()
RETURNS TRIGGER AS $$
DECLARE
    v_client TEXT;
BEGIN
    SELECT COALESCE(full_name, username, 'Client') INTO v_client FROM public.profiles WHERE id = NEW.user_id;
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

DROP TRIGGER IF EXISTS trg_notify_admin_new_payment ON public.payments;
CREATE TRIGGER trg_notify_admin_new_payment
AFTER INSERT ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.trg_notify_admin_new_payment();

-- 3C. New Maintenance / Visit request OR Client cancellation
CREATE OR REPLACE FUNCTION public.trg_notify_admin_maintenance()
RETURNS TRIGGER AS $$
DECLARE
    v_plot TEXT;
    v_client TEXT;
BEGIN
    SELECT plot_identifier INTO v_plot FROM public.memorial_spaces WHERE id = NEW.space_id;
    SELECT COALESCE(full_name, username, 'Client') INTO v_client FROM public.profiles WHERE id = NEW.requested_by;

    IF TG_OP = 'INSERT' THEN
        PERFORM public.notify_all_staff_and_admins(
            'New Maintenance Request: ' || COALESCE(NEW.visit_type, 'Grounds Care'),
            COALESCE(v_client, 'A client') || ' requested ' || COALESCE(NEW.visit_type, 'service') || ' for plot ' || COALESCE(v_plot, 'N/A') || ' on ' || COALESCE(NEW.scheduled_date::text, 'upcoming date') || '.',
            'maintenance',
            'info',
            'maintenance',
            NEW.id::text
        );
    ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'cancelled' THEN
        PERFORM public.notify_all_staff_and_admins(
            'Maintenance Request Cancelled',
            COALESCE(v_client, 'Client') || ' cancelled ' || COALESCE(NEW.visit_type, 'service') || ' (#MNT-' || NEW.id || ') for plot ' || COALESCE(v_plot, 'N/A') || '.',
            'maintenance',
            'warning',
            'maintenance',
            NEW.id::text
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_admin_maintenance ON public.maintenance_visits;
CREATE TRIGGER trg_notify_admin_maintenance
AFTER INSERT OR UPDATE ON public.maintenance_visits
FOR EACH ROW
EXECUTE FUNCTION public.trg_notify_admin_maintenance();

-- 3D. New Support Ticket submitted by client
CREATE OR REPLACE FUNCTION public.trg_notify_admin_support_ticket()
RETURNS TRIGGER AS $$
DECLARE
    v_client TEXT;
BEGIN
    SELECT COALESCE(full_name, username, 'Client') INTO v_client FROM public.profiles WHERE id = NEW.user_id;
    PERFORM public.notify_all_staff_and_admins(
        'New Support Ticket: #' || COALESCE(NEW.ticket_number, NEW.id::text),
        COALESCE(v_client, 'A client') || ' opened ticket: "' || COALESCE(NEW.subject, 'Support Inquiry') || '".',
        'support',
        'info',
        'support',
        NEW.id::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_admin_support_ticket ON public.support_tickets;
CREATE TRIGGER trg_notify_admin_support_ticket
AFTER INSERT ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.trg_notify_admin_support_ticket();

-- 4. ADMIN -> CLIENT TRIGGERS (Payment Verification + Plot Transfer)
CREATE OR REPLACE FUNCTION public.trg_notify_client_payment_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status AND NEW.user_id IS NOT NULL THEN
        IF LOWER(COALESCE(NEW.status, '')) IN ('paid', 'verified', 'approved', 'completed') THEN
            INSERT INTO public.notifications (user_id, title, message, category, type, link_action, reference_id)
            VALUES (
                NEW.user_id,
                'Payment Confirmed ✅',
                'Your payment of ₱' || TO_CHAR(COALESCE(NEW.amount, 0), 'FM999,999,990.00') || ' has been verified by admin.',
                'payment', 'success', 'myreservation', NEW.id::text
            );
        ELSIF LOWER(COALESCE(NEW.status, '')) IN ('rejected', 'failed') THEN
            INSERT INTO public.notifications (user_id, title, message, category, type, link_action, reference_id)
            VALUES (
                NEW.user_id,
                'Payment Requires Attention',
                'Your payment of ₱' || TO_CHAR(COALESCE(NEW.amount, 0), 'FM999,999,990.00') || ' was marked as ' || LOWER(NEW.status) || '.',
                'payment', 'danger', 'myreservation', NEW.id::text
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_client_payment_update ON public.payments;
CREATE TRIGGER trg_notify_client_payment_update
AFTER UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.trg_notify_client_payment_update();

-- 5. ENABLE SUPABASE REALTIME FOR ALL CORE TABLES
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY['notifications', 'reservations', 'payments', 'maintenance_visits', 'support_tickets', 'memorial_spaces'] LOOP
        BEGIN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
    END LOOP;
END $$;
