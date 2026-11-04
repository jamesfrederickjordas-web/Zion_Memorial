-- ==============================================================================
-- ZION MEMORIAL GARDEN - PHASE 1 & 2: COMPLETE DATABASE SETUP
-- Project: Cloud-Based Online Reservation and Records Management System
-- Description: Run this entire script in the Supabase SQL Editor:
--              https://supabase.com/dashboard/project/mjhkglatnwcudwcpbzsp/sql
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
-- 2. TABLES & SCHEMA
-- ==============================================================================

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
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

-- Memorial Spaces (Plots, Niches, Crypts)
CREATE TABLE IF NOT EXISTS public.memorial_spaces (
    id BIGSERIAL PRIMARY KEY,
    plot_identifier TEXT NOT NULL UNIQUE,
    section_name TEXT NOT NULL,
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
    coordinates JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memorial_spaces_status ON public.memorial_spaces(status);
CREATE INDEX IF NOT EXISTS idx_memorial_spaces_category ON public.memorial_spaces(category);
CREATE INDEX IF NOT EXISTS idx_memorial_spaces_section ON public.memorial_spaces(section_name);

-- Reservations
CREATE TABLE IF NOT EXISTS public.reservations (
    id BIGSERIAL PRIMARY KEY,
    reservation_number TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    space_id BIGINT NOT NULL REFERENCES public.memorial_spaces(id) ON DELETE RESTRICT,
    plan_type TEXT NOT NULL DEFAULT 'PRE-NEED' CHECK (plan_type IN ('PRE-NEED', 'AT-NEED')),
    payment_method TEXT NOT NULL DEFAULT 'INSTALLMENT' CHECK (
        payment_method IN ('INSTALLMENT', 'FULL_PAYMENT', 'Cash', 'Card', 'GCash', 'Maya')
    ),
    installment_term_months INT NOT NULL DEFAULT 60,
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

-- Payments
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

-- Memorial Records (Deceased / Burial Records)
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

-- Staff Table
CREATE TABLE IF NOT EXISTS public.staff (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    employee_id TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff', 'caretaker')),
    department TEXT NOT NULL DEFAULT 'Operations',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_user_id ON public.staff(user_id);

-- Maintenance Visits Table
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

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id BIGSERIAL PRIMARY KEY,
    ticket_number TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Reservation Inquiry',
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);

-- ==============================================================================
-- 3. TRIGGERS & FUNCTIONS
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

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ==============================================================================
-- 4. STORAGE BUCKET & POLICIES (Bucket: 'profiles')
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view profile avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile avatar" ON storage.objects;

CREATE POLICY "Public can view profile avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

CREATE POLICY "Users can upload their own profile avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'profiles' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own profile avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'profiles' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own profile avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'profiles' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memorial_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memorial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "Profiles are readable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Public can check usernames" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

CREATE POLICY "Profiles are readable by authenticated users"
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Public can check usernames"
ON public.profiles FOR SELECT TO anon USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles"
ON public.profiles FOR ALL TO authenticated
USING (public.current_user_role() = 'admin');

-- Memorial Spaces
DROP POLICY IF EXISTS "Public and users can view plots" ON public.memorial_spaces;
DROP POLICY IF EXISTS "Staff and Admins can manage spaces" ON public.memorial_spaces;

CREATE POLICY "Public and users can view plots"
ON public.memorial_spaces FOR SELECT USING (true);

CREATE POLICY "Staff and Admins can manage spaces"
ON public.memorial_spaces FOR ALL TO authenticated
USING (public.current_user_role() IN ('admin', 'staff'));

-- Reservations
DROP POLICY IF EXISTS "Clients view their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Clients can create reservations" ON public.reservations;
DROP POLICY IF EXISTS "Clients can update/cancel own pending reservations" ON public.reservations;
DROP POLICY IF EXISTS "Clients can delete own pending reservations" ON public.reservations;
DROP POLICY IF EXISTS "Staff and Admin can view and manage all reservations" ON public.reservations;

CREATE POLICY "Clients view their own reservations"
ON public.reservations FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.current_user_role() IN ('admin', 'staff'));

CREATE POLICY "Clients can create reservations"
ON public.reservations FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Clients can update/cancel own pending reservations"
ON public.reservations FOR UPDATE TO authenticated
USING (user_id = auth.uid() AND status = 'PENDING')
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Clients can delete own pending reservations"
ON public.reservations FOR DELETE TO authenticated
USING (user_id = auth.uid() AND status = 'PENDING');

CREATE POLICY "Staff and Admin can view and manage all reservations"
ON public.reservations FOR ALL TO authenticated
USING (public.current_user_role() IN ('admin', 'staff'));

-- Payments
DROP POLICY IF EXISTS "Clients can view payments for their reservations" ON public.payments;
DROP POLICY IF EXISTS "Staff and Admin can manage payments" ON public.payments;

CREATE POLICY "Clients can view payments for their reservations"
ON public.payments FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.reservations r
        WHERE r.id = payments.reservation_id AND r.user_id = auth.uid()
    ) OR public.current_user_role() IN ('admin', 'staff')
);

CREATE POLICY "Staff and Admin can manage payments"
ON public.payments FOR ALL TO authenticated
USING (public.current_user_role() IN ('admin', 'staff'));

-- Memorial Records
DROP POLICY IF EXISTS "Public can view deceased records" ON public.memorial_records;
DROP POLICY IF EXISTS "Staff and Admins can manage memorial records" ON public.memorial_records;
DROP POLICY IF EXISTS "Family contacts can update memorial records" ON public.memorial_records;

CREATE POLICY "Public can view deceased records"
ON public.memorial_records FOR SELECT USING (true);

CREATE POLICY "Staff and Admins can manage memorial records"
ON public.memorial_records FOR ALL TO authenticated
USING (public.current_user_role() IN ('admin', 'staff'));

CREATE POLICY "Family contacts can update memorial records"
ON public.memorial_records FOR UPDATE TO authenticated
USING (family_contact_id = auth.uid()) WITH CHECK (family_contact_id = auth.uid());

-- Staff Table
DROP POLICY IF EXISTS "Staff members can view staff directory" ON public.staff;
DROP POLICY IF EXISTS "Admins can manage staff records" ON public.staff;

CREATE POLICY "Staff members can view staff directory"
ON public.staff FOR SELECT TO authenticated
USING (public.current_user_role() IN ('admin', 'staff'));

CREATE POLICY "Admins can manage staff records"
ON public.staff FOR ALL TO authenticated
USING (public.current_user_role() = 'admin');

-- Maintenance Visits
DROP POLICY IF EXISTS "Users can view visits they requested" ON public.maintenance_visits;
DROP POLICY IF EXISTS "Users can request maintenance visits" ON public.maintenance_visits;
DROP POLICY IF EXISTS "Staff can view and update maintenance visits" ON public.maintenance_visits;

CREATE POLICY "Users can view visits they requested"
ON public.maintenance_visits FOR SELECT TO authenticated
USING (requested_by = auth.uid() OR public.current_user_role() IN ('admin', 'staff'));

CREATE POLICY "Users can request maintenance visits"
ON public.maintenance_visits FOR INSERT TO authenticated
WITH CHECK (requested_by = auth.uid());

CREATE POLICY "Staff can view and update maintenance visits"
ON public.maintenance_visits FOR ALL TO authenticated
USING (public.current_user_role() IN ('admin', 'staff'));

-- Support Tickets
DROP POLICY IF EXISTS "Users can view own support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can create support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Staff and Admin manage support tickets" ON public.support_tickets;

CREATE POLICY "Users can view own support tickets"
ON public.support_tickets FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.current_user_role() IN ('admin', 'staff'));

CREATE POLICY "Users can create support tickets"
ON public.support_tickets FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Staff and Admin manage support tickets"
ON public.support_tickets FOR ALL TO authenticated
USING (public.current_user_role() IN ('admin', 'staff'));

-- ==============================================================================
-- 6. VIEWS & INITIAL SEED DATA
-- ==============================================================================

CREATE OR REPLACE VIEW public.inventory_summary AS
SELECT
    COUNT(*) AS total_plots,
    COUNT(*) FILTER (WHERE status = 'available') AS available_plots,
    COUNT(*) FILTER (WHERE status = 'reserved') AS reserved_plots,
    COUNT(*) FILTER (WHERE status = 'occupied') AS occupied_plots,
    COUNT(*) FILTER (WHERE status = 'maintenance') AS maintenance_plots
FROM public.memorial_spaces;

-- Seed exact Figma plot inventory
INSERT INTO public.memorial_spaces (plot_identifier, section_name, category, status, price, down_payment)
VALUES
    ('SPB54', 'Area 2 - Lawn of Love', 'Special Supreme', 'reserved', 71486.37, 10200.00),
    ('SPB58', 'Area 2 - Lawn of Love', 'Special Supreme', 'occupied', 71486.37, 10200.00),
    ('SB59',  'Area 2 - Lawn of Love', 'Supreme',         'reserved', 65000.00, 9500.00),
    ('CA23',  'Area 13 - Condominium', 'Condominium',     'reserved', 45000.00, 7000.00),
    ('CB10',  'Area 13 - Condominium', 'Condominium',     'occupied', 45000.00, 7000.00),
    ('SD35',  'Area 2 - Single Tier',  'Single Teired',   'occupied', 55000.00, 8000.00)
ON CONFLICT (plot_identifier) DO UPDATE SET
    section_name = EXCLUDED.section_name,
    category = EXCLUDED.category,
    status = EXCLUDED.status,
    price = EXCLUDED.price;

-- Condominium (Area 10)
INSERT INTO public.memorial_spaces (plot_identifier, section_name, category, status, price, down_payment, row_num, col_num)
SELECT 
    'COND-A' || LPAD(s::text, 3, '0'),
    'Area 10 - Condominium Block A',
    'Condominium',
    CASE WHEN s % 5 = 0 THEN 'reserved' WHEN s % 7 = 0 THEN 'occupied' ELSE 'available' END,
    45000.00,
    7000.00,
    ((s - 1) / 10) + 1,
    ((s - 1) % 10) + 1
FROM generate_series(1, 40) AS s
ON CONFLICT (plot_identifier) DO NOTHING;

-- Single Tiered (Area 1)
INSERT INTO public.memorial_spaces (plot_identifier, section_name, category, status, price, down_payment, row_num, col_num)
SELECT 
    'ST-L' || LPAD(s::text, 3, '0'),
    'Area 1 - Single Tiered Lawn',
    'Single Teired',
    CASE WHEN s % 4 = 0 THEN 'occupied' WHEN s % 9 = 0 THEN 'reserved' ELSE 'available' END,
    55000.00,
    8000.00,
    ((s - 1) / 10) + 1,
    ((s - 1) % 10) + 1
FROM generate_series(1, 30) AS s
ON CONFLICT (plot_identifier) DO NOTHING;

-- Supreme (Area 4)
INSERT INTO public.memorial_spaces (plot_identifier, section_name, category, status, price, down_payment, row_num, col_num)
SELECT 
    'SUP-L' || LPAD(s::text, 3, '0'),
    'Area 4 - Supreme Garden',
    'Supreme',
    CASE WHEN s % 6 = 0 THEN 'occupied' ELSE 'available' END,
    65000.00,
    9500.00,
    ((s - 1) / 10) + 1,
    ((s - 1) % 10) + 1
FROM generate_series(1, 30) AS s
ON CONFLICT (plot_identifier) DO NOTHING;

-- Special Supreme (Area 5)
INSERT INTO public.memorial_spaces (plot_identifier, section_name, category, status, price, down_payment, row_num, col_num)
SELECT 
    'SPEC-L' || LPAD(s::text, 3, '0'),
    'Area 5 - Special Supreme Estate',
    'Special Supreme',
    CASE WHEN s % 5 = 0 THEN 'reserved' ELSE 'available' END,
    71486.37,
    10200.00,
    ((s - 1) / 10) + 1,
    ((s - 1) % 10) + 1
FROM generate_series(1, 20) AS s
ON CONFLICT (plot_identifier) DO NOTHING;

-- Mausoleum (Area 12)
INSERT INTO public.memorial_spaces (plot_identifier, section_name, category, status, price, down_payment, row_num, col_num)
SELECT 
    'MAUS-' || LPAD(s::text, 3, '0'),
    'Area 12 - Mausoleum Court',
    'Mausoleum',
    CASE WHEN s % 3 = 0 THEN 'occupied' ELSE 'available' END,
    150000.00,
    25000.00,
    ((s - 1) / 5) + 1,
    ((s - 1) % 5) + 1
FROM generate_series(1, 15) AS s
ON CONFLICT (plot_identifier) DO NOTHING;


-- ==============================================================================
-- PHASE 2 EXTENSIONS: AUTOMATIC INVENTORY SYNC & RESERVATION HELPERS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_reservation_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.memorial_spaces
        SET status = 'reserved', updated_at = NOW()
        WHERE id = NEW.space_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.status IN ('CANCELLED', 'REJECTED') AND OLD.status NOT IN ('CANCELLED', 'REJECTED') THEN
            UPDATE public.memorial_spaces
            SET status = 'available', updated_at = NOW()
            WHERE id = NEW.space_id;
        ELSIF NEW.status IN ('APPROVED', 'COMPLETED') AND OLD.status NOT IN ('APPROVED', 'COMPLETED') THEN
            UPDATE public.memorial_spaces
            SET status = 'occupied', updated_at = NOW()
            WHERE id = NEW.space_id;
        ELSIF NEW.status = 'PENDING' AND OLD.status IN ('CANCELLED', 'REJECTED') THEN
            UPDATE public.memorial_spaces
            SET status = 'reserved', updated_at = NOW()
            WHERE id = NEW.space_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.memorial_spaces
        SET status = 'available', updated_at = NOW()
        WHERE id = OLD.space_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_reservation_status_change ON public.reservations;
CREATE TRIGGER trg_reservation_status_change
    AFTER INSERT OR UPDATE OR DELETE ON public.reservations
    FOR EACH ROW EXECUTE FUNCTION public.handle_reservation_status_change();

CREATE OR REPLACE FUNCTION public.generate_reservation_number()
RETURNS TEXT AS $$
DECLARE
    today_str TEXT := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
    seq_num INT;
    result TEXT;
BEGIN
    SELECT COUNT(*) + 1 INTO seq_num 
    FROM public.reservations 
    WHERE reservation_number LIKE 'ZMG-' || today_str || '-%';
    
    result := 'ZMG-' || today_str || '-' || LPAD(seq_num::TEXT, 3, '0');
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==============================================================================
-- PHASE 2 EXTENSION: ADMIN PLOT LAYOUT PERMISSIONS & SEED DATA FOR ALL 12 LAWNS
-- ==============================================================================

-- 1. Ensure authenticated users and staff/admins can manage memorial_spaces
DROP POLICY IF EXISTS "Public and users can view plots" ON public.memorial_spaces;
DROP POLICY IF EXISTS "Staff and Admins can manage spaces" ON public.memorial_spaces;
DROP POLICY IF EXISTS "Allow plot management for prototype" ON public.memorial_spaces;

CREATE POLICY "Public and users can view plots"
ON public.memorial_spaces FOR SELECT USING (true);

CREATE POLICY "Allow plot management for prototype"
ON public.memorial_spaces FOR ALL
USING (true)
WITH CHECK (true);

-- 2. SEED PLOTS FOR REMAINING MAP AREAS (Areas 3, 6, 7, 8, 9, 11)

-- Area 3: Family Estate Jr. / Lawn of Hope (10 premium family lots)
INSERT INTO public.memorial_spaces (plot_identifier, section_name, category, status, price, down_payment, row_num, col_num)
SELECT 
    'FE-H' || LPAD(s::text, 3, '0'),
    'Area 3 - Lawn of Hope (Family Estate)',
    'Family Estate Jr.',
    CASE WHEN s = 2 THEN 'occupied' WHEN s = 5 THEN 'reserved' ELSE 'available' END,
    180000.00,
    30000.00,
    ((s - 1) / 5) + 1,
    ((s - 1) % 5) + 1
FROM generate_series(1, 10) AS s
ON CONFLICT (plot_identifier) DO NOTHING;

-- Area 6: Lawn of Peace (Single Tiered, 20 plots)
INSERT INTO public.memorial_spaces (plot_identifier, section_name, category, status, price, down_payment, row_num, col_num)
SELECT 
    'ST-P' || LPAD(s::text, 3, '0'),
    'Area 6 - Lawn of Peace',
    'Single Teired',
    CASE WHEN s % 4 = 0 THEN 'occupied' WHEN s % 5 = 0 THEN 'reserved' ELSE 'available' END,
    42000.00,
    6500.00,
    ((s - 1) / 10) + 1,
    ((s - 1) % 10) + 1
FROM generate_series(1, 20) AS s
ON CONFLICT (plot_identifier) DO NOTHING;

-- Area 7: Lawn of Faith (Supreme, 20 plots)
INSERT INTO public.memorial_spaces (plot_identifier, section_name, category, status, price, down_payment, row_num, col_num)
SELECT 
    'SUP-F' || LPAD(s::text, 3, '0'),
    'Area 7 - Lawn of Faith',
    'Supreme',
    CASE WHEN s % 3 = 0 THEN 'reserved' WHEN s % 6 = 0 THEN 'occupied' ELSE 'available' END,
    65000.00,
    9500.00,
    ((s - 1) / 10) + 1,
    ((s - 1) % 10) + 1
FROM generate_series(1, 20) AS s
ON CONFLICT (plot_identifier) DO NOTHING;

-- Area 8: Lawn of Grace (Supreme, 15 plots)
INSERT INTO public.memorial_spaces (plot_identifier, section_name, category, status, price, down_payment, row_num, col_num)
SELECT 
    'SUP-G' || LPAD(s::text, 3, '0'),
    'Area 8 - Lawn of Grace',
    'Supreme',
    CASE WHEN s % 4 = 0 THEN 'occupied' ELSE 'available' END,
    65000.00,
    9500.00,
    ((s - 1) / 5) + 1,
    ((s - 1) % 5) + 1
FROM generate_series(1, 15) AS s
ON CONFLICT (plot_identifier) DO NOTHING;

-- Area 9: Lawn of Serenity (Special Supreme, 20 plots)
INSERT INTO public.memorial_spaces (plot_identifier, section_name, category, status, price, down_payment, row_num, col_num)
SELECT 
    'SPEC-S' || LPAD(s::text, 3, '0'),
    'Area 9 - Lawn of Serenity',
    'Special Supreme',
    CASE WHEN s % 5 = 0 THEN 'reserved' WHEN s = 7 THEN 'occupied' ELSE 'available' END,
    71486.37,
    10200.00,
    ((s - 1) / 10) + 1,
    ((s - 1) % 10) + 1
FROM generate_series(1, 20) AS s
ON CONFLICT (plot_identifier) DO NOTHING;

-- Area 11: Lawn of Memories (Special Supreme, 20 plots)
INSERT INTO public.memorial_spaces (plot_identifier, section_name, category, status, price, down_payment, row_num, col_num)
SELECT 
    'SPEC-M' || LPAD(s::text, 3, '0'),
    'Area 11 - Lawn of Memories',
    'Special Supreme',
    CASE WHEN s % 4 = 0 THEN 'occupied' WHEN s = 9 THEN 'reserved' ELSE 'available' END,
    71486.37,
    10200.00,
    ((s - 1) / 10) + 1,
    ((s - 1) % 10) + 1
FROM generate_series(1, 20) AS s
ON CONFLICT (plot_identifier) DO NOTHING;

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
    SELECT role INTO caller_role 
    FROM public.profiles 
    WHERE id = auth.uid();

    IF caller_role IS NULL OR caller_role != 'admin' THEN
        RAISE EXCEPTION 'Access Denied: Only administrators can modify user passwords.';
    END IF;

    IF LENGTH(new_password) < 6 THEN
        RAISE EXCEPTION 'Password must be at least 6 characters long.';
    END IF;

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

GRANT EXECUTE ON FUNCTION public.admin_set_user_password(UUID, TEXT) TO authenticated;

-- ==============================================================================
-- PHASE 4 EXTENSION: CLIENT DECEASED MANAGEMENT & CAPACITY POLICIES
-- ==============================================================================
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



-- ==============================================================================
-- PHASE 5: DECEASED CAPACITY RULE (Only Family Estate holds multiple deceased)
-- ZION MEMORIAL GARDEN - DECEASED CAPACITY RULE
-- Only Family Estate plots may hold multiple deceased (up to 8).
-- Every other plot category may hold exactly ONE deceased.
-- Run this in the Supabase SQL editor.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.enforce_memorial_space_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_category TEXT;
    v_capacity INT;
    v_count INT;
BEGIN
    IF NEW.space_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Only re-check on UPDATE when the record is moved to another plot
    IF TG_OP = 'UPDATE' AND NEW.space_id IS NOT DISTINCT FROM OLD.space_id THEN
        RETURN NEW;
    END IF;

    SELECT category INTO v_category
    FROM public.memorial_spaces
    WHERE id = NEW.space_id
    FOR UPDATE;

    v_capacity := CASE WHEN v_category ILIKE 'Family Estate%' THEN 8 ELSE 1 END;

    SELECT COUNT(*) INTO v_count
    FROM public.memorial_records
    WHERE space_id = NEW.space_id
      AND (TG_OP = 'INSERT' OR id <> NEW.id);

    IF v_count >= v_capacity THEN
        IF v_capacity > 1 THEN
            RAISE EXCEPTION 'This Family Estate plot is already at full capacity (% deceased).', v_capacity;
        ELSE
            RAISE EXCEPTION 'This plot (%) already holds a deceased. Only Family Estate plots may hold multiple deceased.', COALESCE(v_category, 'standard');
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_memorial_space_capacity ON public.memorial_records;
CREATE TRIGGER trg_enforce_memorial_space_capacity
BEFORE INSERT OR UPDATE OF space_id ON public.memorial_records
FOR EACH ROW EXECUTE FUNCTION public.enforce_memorial_space_capacity();



-- ==============================================================================
-- PHASE 6: AUTOMATIC PLOT OCCUPANCY & INTERMENT SYNCHRONIZATION
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_memorial_record_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.space_id IS NOT NULL THEN
            UPDATE public.memorial_spaces
            SET status = 'occupied', updated_at = NOW()
            WHERE id = NEW.space_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.space_id IS NOT NULL THEN
            IF NOT EXISTS (SELECT 1 FROM public.memorial_records WHERE space_id = OLD.space_id) THEN
                UPDATE public.memorial_spaces
                SET status = CASE 
                    WHEN EXISTS (SELECT 1 FROM public.reservations WHERE space_id = OLD.space_id AND status NOT IN ('CANCELLED', 'REJECTED')) THEN 'reserved'
                    ELSE 'available'
                END,
                updated_at = NOW()
                WHERE id = OLD.space_id;
            END IF;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_memorial_record_change ON public.memorial_records;
CREATE TRIGGER trg_memorial_record_change
AFTER INSERT OR DELETE ON public.memorial_records
FOR EACH ROW EXECUTE FUNCTION public.handle_memorial_record_change();

-- ==============================================================================
-- PHASE 7: ADMIN DIRECT ACCOUNT CREATION & PASSWORD CONTROL
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
    SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
    IF caller_role IS NULL OR caller_role != 'admin' THEN
        RAISE EXCEPTION 'Access Denied: Only administrators can modify user passwords.';
    END IF;

    IF LENGTH(new_password) < 6 THEN
        RAISE EXCEPTION 'Password must be at least 6 characters long.';
    END IF;

    UPDATE auth.users
    SET encrypted_password = crypt(new_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE id = target_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Target user not found in authentication system.';
    END IF;

    RETURN json_build_object('success', true, 'message', 'User password successfully updated.');
END;
$$;

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
    SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
    IF caller_role IS NULL OR caller_role != 'admin' THEN
        RAISE EXCEPTION 'Access Denied: Only administrators can create new user or staff accounts.';
    END IF;

    clean_email := LOWER(TRIM(COALESCE(new_email, '')));
    IF clean_email = '' OR clean_email NOT LIKE '%@%.%' THEN
        RAISE EXCEPTION 'Please provide a valid email address.';
    END IF;

    IF LENGTH(COALESCE(new_password, '')) < 6 THEN
        RAISE EXCEPTION 'Password must be at least 6 characters long.';
    END IF;

    target_role := LOWER(TRIM(COALESCE(new_role, 'client')));
    IF target_role NOT IN ('admin', 'staff', 'client') THEN
        target_role := 'client';
    END IF;

    target_status := UPPER(TRIM(COALESCE(new_status, 'ACTIVE')));
    IF target_status NOT IN ('ACTIVE', 'SUSPENDED', 'INACTIVE') THEN
        target_status := 'ACTIVE';
    END IF;

    clean_username := TRIM(COALESCE(new_username, ''));
    IF clean_username = '' THEN
        clean_username := split_part(clean_email, '@', 1);
    END IF;

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

    new_user_id := gen_random_uuid();
    encrypted_pwd := crypt(new_password, gen_salt('bf'));

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

GRANT EXECUTE ON FUNCTION public.admin_set_user_password(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_account(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_confirm_user_email(UUID) TO authenticated;

-- ==============================================================================
-- 10. ADMIN DIRECT USER ACCOUNT DELETION RPC FUNCTION
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
    SELECT role INTO caller_role 
    FROM public.profiles 
    WHERE id = auth.uid();

    IF caller_role IS NULL OR caller_role != 'admin' THEN
        RAISE EXCEPTION 'Access Denied: Only administrators can delete accounts.';
    END IF;

    IF target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'Action Prohibited: You cannot delete your own logged-in administrator account.';
    END IF;

    SELECT role, full_name INTO target_role, target_name
    FROM public.profiles
    WHERE id = target_user_id;

    DELETE FROM auth.users
    WHERE id = target_user_id;

    DELETE FROM public.profiles
    WHERE id = target_user_id;

    RETURN json_build_object(
        'success', true, 
        'user_id', target_user_id,
        'message', COALESCE(target_name, 'User') || ' has been permanently deleted from the system.'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_account(UUID) TO authenticated;

-- ==============================================================================
-- 10. SYSTEM SETTINGS & GCASH QR CODE STORAGE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read system settings" ON public.system_settings;
CREATE POLICY "Public read system settings"
ON public.system_settings FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Authenticated users can update system settings" ON public.system_settings;
CREATE POLICY "Authenticated users can update system settings"
ON public.system_settings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

