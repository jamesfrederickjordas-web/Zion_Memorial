-- =========================================================================
-- Zion Memorial Garden: Fix Client Cancel RLS & Admin Sync on maintenance_visits
-- =========================================================================
-- 1. Allow clients to cancel their own scheduled/pending maintenance requests.
-- 2. Ensure admin/staff can view & manage all maintenance requests.
-- 3. Ensure maintenance_visits is included in Supabase Realtime publication.

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

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_visits;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
