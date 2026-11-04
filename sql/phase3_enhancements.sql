-- ==============================================================================
-- ZION MEMORIAL GARDEN - PHASE 3: OPERATIONAL WORKFLOW ENHANCEMENTS
-- 1. Audit Logs Table & Policies
-- 2. Support Tickets Enhancements (Public Guest Inquiries + Authenticated Tickets)
-- 3. Maintenance Visits Permissions & Triggers
-- Run this in the Supabase SQL Editor.
-- ==============================================================================

-- 1. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT,
    action TEXT NOT NULL,          -- e.g. 'RESERVATION_APPROVED', 'RESERVATION_CANCELLED', 'PAYMENT_RECORDED', 'DECEASED_ADDED', etc.
    entity TEXT NOT NULL,          -- e.g. 'reservations', 'payments', 'memorial_records', 'maintenance_visits', 'support_tickets'
    entity_id TEXT,                -- Identifier or record number
    details TEXT,                  -- Human-readable details
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff and Admin can view all audit logs" ON public.audit_logs;
CREATE POLICY "Staff and Admin can view all audit logs"
ON public.audit_logs FOR SELECT TO authenticated
USING (public.current_user_role() IN ('admin', 'staff'));

DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (true);

-- Also allow anon to log public contact inquiries if needed
DROP POLICY IF EXISTS "Public can insert contact audit logs" ON public.audit_logs;
CREATE POLICY "Public can insert contact audit logs"
ON public.audit_logs FOR INSERT TO anon
WITH CHECK (true);


-- 2. ENHANCE SUPPORT TICKETS TABLE FOR GUEST INQUIRIES & RESOLUTIONS
-- Make user_id nullable so guests can submit public inquiries via Contact Us
ALTER TABLE public.support_tickets ALTER COLUMN user_id DROP NOT NULL;

-- Add contact columns if they do not already exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'contact_name') THEN
        ALTER TABLE public.support_tickets ADD COLUMN contact_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'contact_email') THEN
        ALTER TABLE public.support_tickets ADD COLUMN contact_email TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'resolution_notes') THEN
        ALTER TABLE public.support_tickets ADD COLUMN resolution_notes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'resolved_at') THEN
        ALTER TABLE public.support_tickets ADD COLUMN resolved_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'assigned_to') THEN
        ALTER TABLE public.support_tickets ADD COLUMN assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Enable RLS on support_tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own support tickets" ON public.support_tickets;
CREATE POLICY "Users can view own support tickets"
ON public.support_tickets FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.current_user_role() IN ('admin', 'staff'));

DROP POLICY IF EXISTS "Users can create support tickets" ON public.support_tickets;
CREATE POLICY "Users can create support tickets"
ON public.support_tickets FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL OR public.current_user_role() IN ('admin', 'staff'));

DROP POLICY IF EXISTS "Public can submit contact inquiries" ON public.support_tickets;
CREATE POLICY "Public can submit contact inquiries"
ON public.support_tickets FOR INSERT TO anon
WITH CHECK (user_id IS NULL);

DROP POLICY IF EXISTS "Staff and Admin manage support tickets" ON public.support_tickets;
CREATE POLICY "Staff and Admin manage support tickets"
ON public.support_tickets FOR ALL TO authenticated
USING (public.current_user_role() IN ('admin', 'staff'));


-- 3. ENHANCE MAINTENANCE VISITS TABLE & POLICIES
ALTER TABLE public.maintenance_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view visits they requested" ON public.maintenance_visits;
CREATE POLICY "Users can view visits they requested"
ON public.maintenance_visits FOR SELECT TO authenticated
USING (requested_by = auth.uid() OR public.current_user_role() IN ('admin', 'staff'));

DROP POLICY IF EXISTS "Users can request maintenance visits" ON public.maintenance_visits;
CREATE POLICY "Users can request maintenance visits"
ON public.maintenance_visits FOR INSERT TO authenticated
WITH CHECK (
    requested_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.reservations
        WHERE reservations.space_id = maintenance_visits.space_id
        AND reservations.user_id = auth.uid()
    ) OR
    public.current_user_role() IN ('admin', 'staff')
);

DROP POLICY IF EXISTS "Staff can view and update maintenance visits" ON public.maintenance_visits;
CREATE POLICY "Staff can view and update maintenance visits"
ON public.maintenance_visits FOR ALL TO authenticated
USING (public.current_user_role() IN ('admin', 'staff'));

