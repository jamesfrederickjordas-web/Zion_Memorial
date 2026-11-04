-- ==============================================================================
-- ADMIN ACCOUNT CREATION RPC & USER CONFIRMATION
-- Allows administrators to create Staff, Administrator, and Client accounts
-- with instant email confirmation and automatic profile assignment.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.admin_create_account(
    new_email TEXT,
    new_password TEXT,
    new_full_name TEXT,
    new_username TEXT,
    new_phone TEXT,
    new_role TEXT,
    new_status TEXT DEFAULT 'ACTIVE'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    caller_role TEXT;
    target_role TEXT;
    target_status TEXT;
    clean_email TEXT;
    clean_username TEXT;
    new_user_id UUID;
    encrypted_pwd TEXT;
BEGIN
    -- 1. Verify caller has admin privileges in public.profiles
    SELECT role INTO caller_role 
    FROM public.profiles 
    WHERE id = auth.uid();

    IF caller_role IS NULL OR caller_role != 'admin' THEN
        RAISE EXCEPTION 'Access Denied: Only administrators can create new user or staff accounts.';
    END IF;

    -- 2. Validate email format
    clean_email := LOWER(TRIM(COALESCE(new_email, '')));
    IF clean_email = '' OR clean_email NOT LIKE '%@%.%' THEN
        RAISE EXCEPTION 'Please provide a valid email address.';
    END IF;

    -- 3. Validate password
    IF LENGTH(COALESCE(new_password, '')) < 6 THEN
        RAISE EXCEPTION 'Password must be at least 6 characters long.';
    END IF;

    -- 4. Normalize role
    target_role := LOWER(TRIM(COALESCE(new_role, 'client')));
    IF target_role NOT IN ('admin', 'staff', 'client') THEN
        target_role := 'client';
    END IF;

    -- 5. Normalize status
    target_status := UPPER(TRIM(COALESCE(new_status, 'ACTIVE')));
    IF target_status NOT IN ('ACTIVE', 'SUSPENDED', 'INACTIVE') THEN
        target_status := 'ACTIVE';
    END IF;

    -- 6. Clean username
    clean_username := TRIM(COALESCE(new_username, ''));
    IF clean_username = '' THEN
        clean_username := split_part(clean_email, '@', 1);
    END IF;

    -- 7. If user with this email already exists in auth.users, update credentials and profile
    IF EXISTS (SELECT 1 FROM auth.users WHERE LOWER(email) = clean_email) THEN
        SELECT id INTO new_user_id FROM auth.users WHERE LOWER(email) = clean_email;
        encrypted_pwd := crypt(new_password, gen_salt('bf'));

        UPDATE auth.users
        SET encrypted_password = encrypted_pwd,
            raw_user_meta_data = jsonb_build_object(
                'full_name', COALESCE(new_full_name, ''),
                'username', clean_username,
                'phone', COALESCE(new_phone, ''),
                'role', target_role,
                'account_status', target_status
            ),
            updated_at = NOW()
        WHERE id = new_user_id;

        INSERT INTO public.profiles (
            id,
            full_name,
            username,
            phone,
            role,
            account_status,
            member_since,
            updated_at
        )
        VALUES (
            new_user_id,
            COALESCE(new_full_name, ''),
            clean_username,
            new_phone,
            target_role,
            target_status,
            CURRENT_DATE,
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            username = EXCLUDED.username,
            phone = EXCLUDED.phone,
            role = EXCLUDED.role,
            account_status = EXCLUDED.account_status,
            updated_at = NOW();

        RETURN json_build_object(
            'success', true,
            'user_id', new_user_id,
            'email', clean_email,
            'role', target_role,
            'status', target_status,
            'updated', true,
            'message', 'Existing account was updated and assigned to ' || UPPER(target_role) || ' with new credentials.'
        );
    END IF;

    -- 8. Generate user id and hash password with bcrypt
    new_user_id := gen_random_uuid();
    encrypted_pwd := crypt(new_password, gen_salt('bf'));

    -- 9. Insert into auth.users (instantly email confirmed so user can log in right away)
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token,
        email_change,
        email_change_token_new,
        email_change_token_current,
        phone_change,
        phone_change_token,
        reauthentication_token
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_user_id,
        'authenticated',
        'authenticated',
        clean_email,
        encrypted_pwd,
        NOW(),
        jsonb_build_object('provider', 'email', 'providers', array['email']),
        jsonb_build_object(
            'full_name', COALESCE(new_full_name, ''),
            'username', clean_username,
            'phone', COALESCE(new_phone, ''),
            'role', target_role,
            'account_status', target_status
        ),
        NOW(),
        NOW(),
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        ''
    );

    -- 9b. Create matching email identity (required by Supabase Auth for password login)
    INSERT INTO auth.identities (
        id,
        user_id,
        provider_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
    )
    VALUES (
        gen_random_uuid(),
        new_user_id,
        new_user_id::text,
        jsonb_build_object('sub', new_user_id::text, 'email', clean_email, 'email_verified', true),
        'email',
        NOW(),
        NOW(),
        NOW()
    );

    -- 10. Upsert into public.profiles
    INSERT INTO public.profiles (
        id,
        full_name,
        username,
        phone,
        role,
        account_status,
        member_since,
        updated_at
    )
    VALUES (
        new_user_id,
        COALESCE(new_full_name, ''),
        clean_username,
        new_phone,
        target_role,
        target_status,
        CURRENT_DATE,
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        username = EXCLUDED.username,
        phone = EXCLUDED.phone,
        role = EXCLUDED.role,
        account_status = EXCLUDED.account_status,
        updated_at = NOW();

    RETURN json_build_object(
        'success', true,
        'user_id', new_user_id,
        'email', clean_email,
        'role', target_role,
        'status', target_status,
        'message', 'Account created successfully.'
    );
END;
$$;

-- Helper RPC: Admin auto-confirm user email if created via SDK fallback
CREATE OR REPLACE FUNCTION public.admin_confirm_user_email(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    caller_role TEXT;
BEGIN
    SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
    IF caller_role IS NULL OR caller_role != 'admin' THEN
        RAISE EXCEPTION 'Access Denied: Only administrators can confirm user accounts.';
    END IF;

    UPDATE auth.users
    SET email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        updated_at = NOW()
    WHERE id = target_user_id;

    RETURN true;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.admin_create_account(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_confirm_user_email(UUID) TO authenticated;

