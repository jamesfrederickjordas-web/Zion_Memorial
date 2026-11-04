-- ==============================================================================
-- ZION MEMORIAL GARDEN - CLIENT DECEASED MANAGEMENT & CAPACITY POLICIES
-- Enables authenticated clients to add, edit, and manage deceased records
-- for their reserved memorial spaces up to category slot capacity.
-- ==============================================================================

-- 1. Ensure RLS is active
ALTER TABLE public.memorial_records ENABLE ROW LEVEL SECURITY;

-- 2. Allow Authenticated Users to Insert Deceased Records for spaces they reserved or manage
DROP POLICY IF EXISTS "Authenticated users can insert memorial records" ON public.memorial_records;
CREATE POLICY "Authenticated users can insert memorial records"
ON public.memorial_records FOR INSERT TO authenticated
WITH CHECK (
    family_contact_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.reservations
        WHERE reservations.space_id = memorial_records.space_id
        AND reservations.user_id = auth.uid()
    ) OR
    public.current_user_role() IN ('admin', 'staff')
);

-- 3. Allow Family Contacts and Space Owners to Update Memorial Records
DROP POLICY IF EXISTS "Family contacts can update memorial records" ON public.memorial_records;
CREATE POLICY "Family contacts can update memorial records"
ON public.memorial_records FOR UPDATE TO authenticated
USING (
    family_contact_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.reservations
        WHERE reservations.space_id = memorial_records.space_id
        AND reservations.user_id = auth.uid()
    ) OR
    public.current_user_role() IN ('admin', 'staff')
)
WITH CHECK (
    family_contact_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.reservations
        WHERE reservations.space_id = memorial_records.space_id
        AND reservations.user_id = auth.uid()
    ) OR
    public.current_user_role() IN ('admin', 'staff')
);

-- 4. Allow Family Contacts and Space Owners to Delete Memorial Records
DROP POLICY IF EXISTS "Family contacts can delete memorial records" ON public.memorial_records;
CREATE POLICY "Family contacts can delete memorial records"
ON public.memorial_records FOR DELETE TO authenticated
USING (
    family_contact_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.reservations
        WHERE reservations.space_id = memorial_records.space_id
        AND reservations.user_id = auth.uid()
    ) OR
    public.current_user_role() IN ('admin', 'staff')
);

