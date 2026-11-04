-- ==============================================================================
-- ADMIN DIRECT PASSWORD OVERRIDE RPC FUNCTION
-- Allows administrators to set or reset any user's password directly
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.admin_set_user_password(target_user_id UUID, new_password TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    caller_role TEXT;
BEGIN
    -- 1. Verify caller has admin privileges in public.profiles
    SELECT role INTO caller_role 
    FROM public.profiles 
    WHERE id = auth.uid();

    IF caller_role IS NULL OR caller_role != 'admin' THEN
        RAISE EXCEPTION 'Access Denied: Only administrators can modify user passwords.';
    END IF;

    -- 2. Validate password length
    IF LENGTH(new_password) < 6 THEN
        RAISE EXCEPTION 'Password must be at least 6 characters long.';
    END IF;

    -- 3. Update the encrypted password directly in auth.users
    UPDATE auth.users
    SET encrypted_password = crypt(new_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE id = target_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Target user not found in authentication system.';
    END IF;

    RETURN json_build_object(
        'success', true, 
        'message', 'User password successfully updated.'
    );
END;
$$;

-- Grant execution permissions to authenticated users (function checks for role = 'admin' internally)
GRANT EXECUTE ON FUNCTION public.admin_set_user_password(UUID, TEXT) TO authenticated;

