-- ==============================================================================
-- ZION MEMORIAL GARDEN - PHASE 3: GCASH QR CODE & MERCHANT SETTINGS
-- Enables cloud synchronization of the business GCash QR code and payment details.
-- Run this in the Supabase SQL Editor if you wish to persist the QR code across all devices.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Row Level Security
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public/clients) to read settings (needed for displaying GCash QR code to payers)
DROP POLICY IF EXISTS "Public read system settings" ON public.system_settings;
CREATE POLICY "Public read system settings"
ON public.system_settings FOR SELECT
TO public
USING (true);

-- Allow authenticated users (staff/admin) to insert or update system settings
DROP POLICY IF EXISTS "Authenticated users can update system settings" ON public.system_settings;
CREATE POLICY "Authenticated users can update system settings"
ON public.system_settings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Seed default GCash QR config if not present
INSERT INTO public.system_settings (key, value, description)
VALUES (
    'gcash_qr_config',
    jsonb_build_object(
        'merchantName', 'Zion Memorial Garden Inc.',
        'accountNumber', '0945 187 6774',
        'qrImageUrl', 'assets/images/gcash-qr-default.svg',
        'instructions', 'Scan this QR code with your GCash app, pay the exact amount, and enter the GCash Reference Number in your form.',
        'updatedAt', NOW()
    ),
    'Active GCash Payment QR Code and merchant details for client reservations and amortizations'
)
ON CONFLICT (key) DO NOTHING;

