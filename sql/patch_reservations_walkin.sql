-- ==============================================================================
-- ZION MEMORIAL GARDEN - PATCH FOR WALK-IN RESERVATIONS
-- Allows walk-in over-the-counter reservations to be stored without requiring an online user_id
-- ==============================================================================

-- 1. Drop NOT NULL on reservations.user_id to support in-office walk-in counter clients
ALTER TABLE public.reservations ALTER COLUMN user_id DROP NOT NULL;

-- 2. Drop NOT NULL on memorial_records.family_contact_id if present
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'memorial_records' 
          AND column_name = 'family_contact_id'
          AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.memorial_records ALTER COLUMN family_contact_id DROP NOT NULL;
    END IF;
END $$;

-- 3. Ensure Staff and Admin can manage reservations, payments, and memorial_spaces (via profiles.role OR user_metadata.role)
DROP POLICY IF EXISTS "Staff and Admin can manage all reservations" ON public.reservations;
CREATE POLICY "Staff and Admin can manage all reservations"
ON public.reservations FOR ALL TO authenticated
USING (
    public.current_user_role() IN ('admin', 'staff')
    OR LOWER(COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '')) IN ('admin', 'staff')
    OR LOWER(COALESCE(auth.jwt() ->> 'email', '')) LIKE 'admin%'
)
WITH CHECK (
    public.current_user_role() IN ('admin', 'staff')
    OR LOWER(COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '')) IN ('admin', 'staff')
    OR LOWER(COALESCE(auth.jwt() ->> 'email', '')) LIKE 'admin%'
);

DROP POLICY IF EXISTS "Staff and Admin can manage all payments" ON public.payments;
CREATE POLICY "Staff and Admin can manage all payments"
ON public.payments FOR ALL TO authenticated
USING (
    public.current_user_role() IN ('admin', 'staff')
    OR LOWER(COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '')) IN ('admin', 'staff')
    OR LOWER(COALESCE(auth.jwt() ->> 'email', '')) LIKE 'admin%'
)
WITH CHECK (
    public.current_user_role() IN ('admin', 'staff')
    OR LOWER(COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '')) IN ('admin', 'staff')
    OR LOWER(COALESCE(auth.jwt() ->> 'email', '')) LIKE 'admin%'
);

DROP POLICY IF EXISTS "Staff and Admin can manage all spaces" ON public.memorial_spaces;
CREATE POLICY "Staff and Admin can manage all spaces"
ON public.memorial_spaces FOR ALL TO authenticated
USING (
    public.current_user_role() IN ('admin', 'staff')
    OR LOWER(COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '')) IN ('admin', 'staff')
    OR LOWER(COALESCE(auth.jwt() ->> 'email', '')) LIKE 'admin%'
)
WITH CHECK (
    public.current_user_role() IN ('admin', 'staff')
    OR LOWER(COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '')) IN ('admin', 'staff')
    OR LOWER(COALESCE(auth.jwt() ->> 'email', '')) LIKE 'admin%'
);

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

