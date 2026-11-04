-- ==============================================================================
-- ZION MEMORIAL GARDEN - PHASE 1: DATABASE SCHEMA MIGRATION
-- Project: Cloud-Based Online Reservation and Records Management System
-- Database: Supabase (PostgreSQL)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- CLEAN RESET: Drop any previous table versions to prevent column mismatch
-- ==============================================================================
DROP VIEW IF EXISTS public.inventory_summary CASCADE;
DROP TABLE IF EXISTS public.support_tickets CASCADE;
DROP TABLE IF EXISTS public.maintenance_visits CASCADE;
DROP TABLE IF EXISTS public.staff CASCADE;
DROP TABLE IF EXISTS public.memorial_records CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.reservations CASCADE;
DROP TABLE IF EXISTS public.memorial_spaces CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ==============================================================================
-- 1. PROFILES TABLE (Linked 1-to-1 with auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    username TEXT UNIQUE,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'staff', 'admin')),
    account_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (account_status IN ('ACTIVE', 'SUSPENDED', 'INACTIVE')),
    member_since DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 2. AUTOMATIC USER PROFILE TRIGGER
-- Syncs metadata sent via supabase.auth.signUp into public.profiles
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name,
        username,
        phone,
        role,
        avatar_url,
        member_since
    )
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', ''),
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        new.raw_user_meta_data->>'phone',
        COALESCE(new.raw_user_meta_data->>'role', 'client'),
        new.raw_user_meta_data->>'avatar_url',
        CURRENT_DATE
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        username = EXCLUDED.username,
        phone = EXCLUDED.phone,
        updated_at = NOW();

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function to check user roles easily in RLS
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ==============================================================================
-- 3. MEMORIAL SPACES TABLE (Cemetery Plots & Vault Inventory)
-- Matches Figma Lawn categories and SAD Proposal requirements
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.memorial_spaces (
    id BIGSERIAL PRIMARY KEY,
    plot_identifier TEXT NOT NULL UNIQUE,     -- e.g. 'SPB54', 'CA23', 'SB59'
    section_name TEXT NOT NULL,               -- e.g. 'Lawn of Love', 'Area 2', 'Area 13'
    category TEXT NOT NULL CHECK (
        category IN ('Condominium', 'Single Teired', 'Supreme', 'Special Supreme', 'Mausoleum', 'Family Estate Jr.')
    ),
    status TEXT NOT NULL DEFAULT 'available' CHECK (
        status IN ('available', 'reserved', 'occupied', 'maintenance')
    ),
    price NUMERIC(12, 2) NOT NULL DEFAULT 60000.00,
    down_payment NUMERIC(12, 2) NOT NULL DEFAULT 10200.00,
    row_num INT,
    col_num INT,
    coordinates JSONB,                       -- GeoJSON or polygon coordinates for SVG mapping
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memorial_spaces_status ON public.memorial_spaces(status);
CREATE INDEX IF NOT EXISTS idx_memorial_spaces_category ON public.memorial_spaces(category);
CREATE INDEX IF NOT EXISTS idx_memorial_spaces_section ON public.memorial_spaces(section_name);

-- ==============================================================================
-- 4. RESERVATIONS TABLE
-- Client and Staff plot reservation records with amortization terms
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reservations (
    id BIGSERIAL PRIMARY KEY,
    reservation_number TEXT NOT NULL UNIQUE,  -- e.g. 'ZMG-20260410-001'
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    space_id BIGINT NOT NULL REFERENCES public.memorial_spaces(id) ON DELETE RESTRICT,
    plan_type TEXT NOT NULL DEFAULT 'PRE-NEED' CHECK (plan_type IN ('PRE-NEED', 'AT-NEED')),
    payment_method TEXT NOT NULL DEFAULT 'INSTALLMENT' CHECK (
        payment_method IN ('INSTALLMENT', 'FULL_PAYMENT', 'Cash', 'Card', 'GCash', 'Maya')
    ),
    installment_term_months INT NOT NULL DEFAULT 60, -- e.g. 12, 24, 36, 60
    total_price NUMERIC(12, 2) NOT NULL DEFAULT 71486.37,
    down_payment_amount NUMERIC(12, 2) NOT NULL DEFAULT 10200.00,
    monthly_amortization NUMERIC(12, 2) NOT NULL DEFAULT 1191.44,
    total_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    balance NUMERIC(12, 2) NOT NULL DEFAULT 71486.37,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
        status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'OVERDUE', 'COMPLETED')
    ),
    reservation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON public.reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_space_id ON public.reservations(space_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);

-- ==============================================================================
-- 5. PAYMENTS TABLE
-- Tracks installments, cash, card, GCash, Maya payments
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
    payment_reference TEXT UNIQUE,
    amount NUMERIC(12, 2) NOT NULL,
    payment_type TEXT NOT NULL DEFAULT 'INSTALLMENT' CHECK (
        payment_type IN ('DOWN_PAYMENT', 'INSTALLMENT', 'FULL_PAYMENT')
    ),
    payment_method TEXT NOT NULL CHECK (
        payment_method IN ('Cash', 'Card', 'GCash', 'Maya', 'Bank Transfer')
    ),
    status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (
        status IN ('PENDING', 'COMPLETED', 'FAILED', 'OVERDUE')
    ),
    due_date DATE,
    paid_at TIMESTAMPTZ DEFAULT NOW(),
    receipt_url TEXT,
    received_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_reservation_id ON public.payments(reservation_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- ==============================================================================
-- 6. MEMORIAL RECORDS (Deceased Records & Interment Registry)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.memorial_records (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT REFERENCES public.memorial_spaces(id) ON DELETE SET NULL,
    family_contact_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    deceased_name TEXT NOT NULL,
    birth_date DATE,
    death_date DATE,
    burial_date DATE,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    epitaph TEXT,
    memorial_photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memorial_records_space_id ON public.memorial_records(space_id);
CREATE INDEX IF NOT EXISTS idx_memorial_records_family_contact_id ON public.memorial_records(family_contact_id);

-- ==============================================================================
-- 7. STAFF TABLE
-- Administrative personnel, park managers, and groundskeepers
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.staff (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    employee_id TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff', 'caretaker')),
    department TEXT NOT NULL DEFAULT 'Operations',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_user_id ON public.staff(user_id);

-- ==============================================================================
-- 8. MAINTENANCE VISITS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.maintenance_visits (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES public.memorial_spaces(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_staff_id BIGINT REFERENCES public.staff(id) ON DELETE SET NULL,
    visit_type TEXT NOT NULL CHECK (
        visit_type IN ('Grave Cleaning', 'Grass Trimming', 'Flower Placement', 'Inspection', 'Family Visit')
    ),
    scheduled_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (
        status IN ('scheduled', 'in-progress', 'completed', 'cancelled')
    ),
    notes TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_visits_space_id ON public.maintenance_visits(space_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_visits_requested_by ON public.maintenance_visits(requested_by);

-- ==============================================================================
-- 9. SUPPORT TICKETS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id BIGSERIAL PRIMARY KEY,
    ticket_number TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Reservation Inquiry',
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
