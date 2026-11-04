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

-- 3. Ensure Staff and Admin can insert reservations without user_id or with staff user_id
DROP POLICY IF EXISTS "Staff and Admin can manage all reservations" ON public.reservations;
CREATE POLICY "Staff and Admin can manage all reservations"
ON public.reservations FOR ALL TO authenticated
USING (public.current_user_role() IN ('admin', 'staff'))
WITH CHECK (public.current_user_role() IN ('admin', 'staff'));

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

