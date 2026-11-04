-- ==============================================================================
-- ZION MEMORIAL GARDEN - REAL-TIME NOTIFICATIONS & MAINTENANCE PROOFS MIGRATION
-- Run this script in the Supabase SQL Editor.
-- ==============================================================================

-- 1. ADD PROOF IMAGE COLUMN TO MAINTENANCE VISITS
ALTER TABLE public.maintenance_visits 
ADD COLUMN IF NOT EXISTS proof_image_url TEXT;

-- 2. ENSURE RESOLUTION NOTES COLUMN EXISTS ON SUPPORT TICKETS
ALTER TABLE public.support_tickets 
ADD COLUMN IF NOT EXISTS resolution_notes TEXT;

-- 3. CREATE DEDICATED NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general', -- 'reservation', 'maintenance', 'support', 'payment'
    type TEXT NOT NULL DEFAULT 'info',        -- 'info', 'success', 'warning', 'danger'
    link_action TEXT,                         -- 'myreservation', 'maintenance', 'support', 'payment'
    reference_id TEXT,                        -- e.g. reservation ID, maintenance ID, ticket ID
    proof_image_url TEXT,                     -- Image proof for completed cleaning/maintenance tasks
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES FOR NOTIFICATIONS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Staff and system can insert notifications" ON public.notifications;
CREATE POLICY "Staff and system can insert notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- 5. ENABLE SUPABASE REALTIME PUBLICATION
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

-- 6. AUTOMATIC DATABASE TRIGGERS FOR REALTIME NOTIFICATIONS

-- Trigger A: Reservation Status Changes (Approved, Rejected, Cancelled, Completed)
CREATE OR REPLACE FUNCTION public.trg_notify_reservation_action()
RETURNS TRIGGER AS $$
DECLARE
    v_plot_id TEXT := 'Memorial Plot';
    v_sec_name TEXT := 'Grounds';
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        SELECT plot_identifier, section_name INTO v_plot_id, v_sec_name
        FROM public.memorial_spaces WHERE id = NEW.space_id;

        IF NEW.status = 'APPROVED' THEN
            INSERT INTO public.notifications (
                user_id, title, message, category, type, link_action, reference_id
            ) VALUES (
                NEW.user_id,
                'Reservation Approved! 🎉',
                'Your reservation #' || NEW.reservation_number || ' for plot ' || COALESCE(v_plot_id, '') || ' (' || COALESCE(v_sec_name, 'Grounds') || ') has been approved by admin.',
                'reservation', 'success', 'myreservation', NEW.id::text
            );
        ELSIF NEW.status IN ('REJECTED', 'CANCELLED') THEN
            INSERT INTO public.notifications (
                user_id, title, message, category, type, link_action, reference_id
            ) VALUES (
                NEW.user_id,
                'Reservation ' || INITCAP(NEW.status),
                'Reservation #' || NEW.reservation_number || ' for ' || COALESCE(v_plot_id, 'plot') || ' was ' || LOWER(NEW.status) || '.' || 
                CASE WHEN NEW.notes IS NOT NULL AND NEW.notes <> '' THEN ' Note: ' || NEW.notes ELSE '' END,
                'reservation', 'danger', 'myreservation', NEW.id::text
            );
        ELSIF NEW.status = 'COMPLETED' THEN
            INSERT INTO public.notifications (
                user_id, title, message, category, type, link_action, reference_id
            ) VALUES (
                NEW.user_id,
                'Reservation Fully Paid & Completed 🌿',
                'Reservation #' || NEW.reservation_number || ' for ' || COALESCE(v_plot_id, 'plot') || ' is now marked as complete.',
                'reservation', 'success', 'myreservation', NEW.id::text
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_reservation_update ON public.reservations;
CREATE TRIGGER trg_notify_reservation_update
AFTER UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.trg_notify_reservation_action();

-- Trigger B: Maintenance Visits Updates (Cleaning / Grounds service, in-progress, completed with proof)
CREATE OR REPLACE FUNCTION public.trg_notify_maintenance_action()
RETURNS TRIGGER AS $$
DECLARE
    v_plot_id TEXT := 'Memorial Lot';
BEGIN
    IF NEW.requested_by IS NOT NULL THEN
        SELECT plot_identifier INTO v_plot_id
        FROM public.memorial_spaces WHERE id = NEW.space_id;

        IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
            IF NEW.status = 'completed' THEN
                INSERT INTO public.notifications (
                    user_id, title, message, category, type, link_action, reference_id, proof_image_url
                ) VALUES (
                    NEW.requested_by,
                    'Maintenance Completed: ' || NEW.visit_type || ' ✅',
                    'Cemetery staff has completed your ' || LOWER(NEW.visit_type) || ' request for plot ' || COALESCE(v_plot_id, '') || '.' ||
                    CASE WHEN NEW.notes IS NOT NULL AND NEW.notes <> '' THEN ' Report: ' || NEW.notes ELSE '' END ||
                    CASE WHEN NEW.proof_image_url IS NOT NULL THEN ' Proof photo attached.' ELSE '' END,
                    'maintenance', 'success', 'maintenance', NEW.id::text, NEW.proof_image_url
                );
            ELSIF NEW.status = 'in-progress' THEN
                INSERT INTO public.notifications (
                    user_id, title, message, category, type, link_action, reference_id
                ) VALUES (
                    NEW.requested_by,
                    'Maintenance In-Progress: ' || NEW.visit_type || ' 🛠️',
                    'Grounds staff is actively servicing plot ' || COALESCE(v_plot_id, '') || '.',
                    'maintenance', 'info', 'maintenance', NEW.id::text
                );
            ELSIF NEW.status = 'cancelled' THEN
                INSERT INTO public.notifications (
                    user_id, title, message, category, type, link_action, reference_id
                ) VALUES (
                    NEW.requested_by,
                    'Maintenance Request Cancelled',
                    'Your ' || LOWER(NEW.visit_type) || ' request for plot ' || COALESCE(v_plot_id, '') || ' was cancelled.' ||
                    CASE WHEN NEW.notes IS NOT NULL AND NEW.notes <> '' THEN ' Reason: ' || NEW.notes ELSE '' END,
                    'maintenance', 'warning', 'maintenance', NEW.id::text
                );
            END IF;
        ELSIF TG_OP = 'UPDATE' AND OLD.proof_image_url IS DISTINCT FROM NEW.proof_image_url AND NEW.proof_image_url IS NOT NULL THEN
            INSERT INTO public.notifications (
                user_id, title, message, category, type, link_action, reference_id, proof_image_url
            ) VALUES (
                NEW.requested_by,
                'Proof Photo Attached: ' || NEW.visit_type || ' 📷',
                'Staff uploaded a completion proof photo for plot ' || COALESCE(v_plot_id, '') || '. Click to view photo.',
                'maintenance', 'info', 'maintenance', NEW.id::text, NEW.proof_image_url
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_maintenance_update ON public.maintenance_visits;
CREATE TRIGGER trg_notify_maintenance_update
AFTER UPDATE ON public.maintenance_visits
FOR EACH ROW
EXECUTE FUNCTION public.trg_notify_maintenance_action();

-- Trigger C: Support Tickets Updates (Response, in-progress, resolved, closed)
CREATE OR REPLACE FUNCTION public.trg_notify_support_action()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) OR (OLD.resolution_notes IS DISTINCT FROM NEW.resolution_notes AND NEW.resolution_notes IS NOT NULL) THEN
        INSERT INTO public.notifications (
            user_id, title, message, category, type, link_action, reference_id
        ) VALUES (
            NEW.user_id,
            'Support Ticket ' || INITCAP(NEW.status) || ': #' || NEW.ticket_number || ' 💬',
            CASE 
                WHEN NEW.resolution_notes IS NOT NULL AND NEW.resolution_notes <> '' THEN
                    'Staff Response: "' || LEFT(NEW.resolution_notes, 120) || (CASE WHEN LENGTH(NEW.resolution_notes) > 120 THEN '...' ELSE '' END) || '"'
                ELSE
                    'Your inquiry "' || NEW.subject || '" status was updated to ' || LOWER(NEW.status) || '.'
            END,
            'support',
            CASE WHEN NEW.status = 'resolved' THEN 'success' ELSE 'info' END,
            'support',
            NEW.id::text
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_support_update ON public.support_tickets;
CREATE TRIGGER trg_notify_support_update
AFTER UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.trg_notify_support_action();

-- Trigger D: Payment Verified
CREATE OR REPLACE FUNCTION public.trg_notify_payment_action()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_res_num TEXT;
BEGIN
    IF NEW.status = 'COMPLETED' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'COMPLETED') THEN
        SELECT user_id, reservation_number INTO v_user_id, v_res_num
        FROM public.reservations WHERE id = NEW.reservation_id;

        IF v_user_id IS NOT NULL THEN
            INSERT INTO public.notifications (
                user_id, title, message, category, type, link_action, reference_id
            ) VALUES (
                v_user_id,
                'Payment Verified: ₱' || TO_CHAR(NEW.amount, 'FM999,999,990.00') || ' 💳',
                'Official payment receipt verified for reservation #' || COALESCE(v_res_num, '') || ' via ' || COALESCE(NEW.payment_method, 'Official Channel') || '. Ref: ' || COALESCE(NEW.payment_reference, '-'),
                'payment', 'success', 'payment', NEW.id::text
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_payment_update ON public.payments;
CREATE TRIGGER trg_notify_payment_update
AFTER INSERT OR UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.trg_notify_payment_action();

-- 7. STORAGE POLICY FOR MAINTENANCE PROOFS (BUCKET: 'profiles')
-- Allows staff to upload photos to 'profiles/maintenance/...'
DO $$
BEGIN
    CREATE POLICY "Public and staff can upload maintenance proof photos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'profiles' AND
        (storage.foldername(name))[1] = 'maintenance'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

