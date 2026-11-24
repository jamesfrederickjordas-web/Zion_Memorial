-- ==============================================================================
-- 13. FIX ADMIN DECEASED RECORD DELETION (RLS + SECURITY DEFINER RPC)
-- Fixes cases where Supabase RLS silently blocks DELETE on public.memorial_records
-- (0 rows deleted) when an admin's role is stored in user_metadata or profiles.
-- ==============================================================================

-- 1. Update DELETE policy on memorial_records to accept both profiles.role and auth.jwt() user_metadata role
DROP POLICY IF EXISTS "Staff and Admins can manage memorial records" ON public.memorial_records;
CREATE POLICY "Staff and Admins can manage memorial records"
ON public.memorial_records FOR ALL
TO authenticated
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

-- 2. RPC fallback for admin deletion (verifies admin/staff caller and deletes the row)
CREATE OR REPLACE FUNCTION public.admin_delete_memorial_record(p_record_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role TEXT;
    v_meta_role TEXT;
    v_email TEXT;
    v_deleted_id BIGINT;
BEGIN
    SELECT LOWER(COALESCE(role, '')) INTO v_role
    FROM public.profiles
    WHERE id = auth.uid();

    v_meta_role := LOWER(COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', ''));
    v_email := LOWER(COALESCE(auth.jwt() ->> 'email', ''));

    IF v_role NOT IN ('admin', 'staff')
       AND v_meta_role NOT IN ('admin', 'staff')
       AND v_email NOT LIKE 'admin%' THEN
        RAISE EXCEPTION 'Only Administrators or Staff can delete memorial records.';
    END IF;

    DELETE FROM public.memorial_records
    WHERE id = p_record_id
    RETURNING id INTO v_deleted_id;

    RETURN v_deleted_id IS NOT NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_memorial_record(BIGINT) TO authenticated;
