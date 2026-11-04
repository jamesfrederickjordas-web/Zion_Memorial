-- ==============================================================================
-- FIX: "Database error querying schema" when logging in with admin-created accounts
--
-- Cause: admin_create_account inserted rows into auth.users leaving token columns
-- NULL (GoTrue cannot scan NULL into these string fields) and did not create a
-- matching auth.identities row.
--
-- Run this ONCE in the Supabase SQL Editor to repair existing accounts.
-- Then re-run sql/admin_create_account_rpc.sql so future accounts are created correctly.
-- ==============================================================================

-- 1. Replace NULL token columns with empty strings
UPDATE auth.users
SET confirmation_token         = COALESCE(confirmation_token, ''),
    recovery_token             = COALESCE(recovery_token, ''),
    email_change               = COALESCE(email_change, ''),
    email_change_token_new     = COALESCE(email_change_token_new, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    phone_change               = COALESCE(phone_change, ''),
    phone_change_token         = COALESCE(phone_change_token, ''),
    reauthentication_token     = COALESCE(reauthentication_token, '')
WHERE confirmation_token IS NULL
   OR recovery_token IS NULL
   OR email_change IS NULL
   OR email_change_token_new IS NULL
   OR email_change_token_current IS NULL
   OR phone_change IS NULL
   OR phone_change_token IS NULL
   OR reauthentication_token IS NULL;

-- 2. Create missing email identities
INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    u.id,
    u.id::text,
    jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
    'email',
    NOW(),
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM auth.identities i
      WHERE i.user_id = u.id AND i.provider = 'email'
  );

