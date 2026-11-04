-- ==============================================================================
-- ADMIN DIRECT USER ACCOUNT DELETION RPC FUNCTION
-- Allows administrators to permanently delete any user or staff account
-- Automatically removes from auth.users and cascades to profiles & related tables
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.admin_delete_account(target_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    caller_role TEXT;
    target_role TEXT;
    target_name TEXT;
BEGIN
    -- 1. Verify caller has admin privileges in public.profiles
    SELECT role INTO caller_role 
    FROM public.profiles 
    WHERE id = auth.uid();

    IF caller_role IS NULL OR caller_role != 'admin' THEN
        RAISE EXCEPTION 'Access Denied: Only administrators can delete accounts.';
    END IF;

    -- 2. Prevent self-deletion
    IF target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'Action Prohibited: You cannot delete your own logged-in administrator account.';
    END IF;

    -- 3. Fetch target user information for confirmation
    SELECT role, full_name INTO target_role, target_name
    FROM public.profiles
    WHERE id = target_user_id;

    -- 4. Delete user from auth.users (cascades to profiles, reservations, payments, etc.)
    DELETE FROM auth.users
    WHERE id = target_user_id;

    -- 5. In case user only existed in profiles or cascade didn't touch it
    DELETE FROM public.profiles
    WHERE id = target_user_id;

    RETURN json_build_object(
        'success', true, 
        'user_id', target_user_id,
        'message', COALESCE(target_name, 'User') || ' has been permanently deleted from the system.'
    );
END;
$$;

-- Grant execution permissions to authenticated users (function verifies role = 'admin' internally)
GRANT EXECUTE ON FUNCTION public.admin_delete_account(UUID) TO authenticated;

