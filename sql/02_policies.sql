-- ==============================================================================
-- ZION MEMORIAL GARDEN - PHASE 1: ROW LEVEL SECURITY (RLS) POLICIES
-- Project: Cloud-Based Online Reservation and Records Management System
-- ==============================================================================

-- ==============================================================================
-- 1. STORAGE POLICIES (Bucket: 'profiles')
-- ==============================================================================
-- Ensure the 'profiles' bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing storage policies on bucket 'profiles' to avoid duplicates
DROP POLICY IF EXISTS "Public can view profile avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile avatar" ON storage.objects;

-- Allow public read access to avatars stored in 'profiles' bucket
CREATE POLICY "Public can view profile avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

-- Allow authenticated users to upload avatar images into 'profiles' bucket
CREATE POLICY "Users can upload their own profile avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'profiles' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own avatar images
CREATE POLICY "Users can update their own profile avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'profiles' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own avatar images
CREATE POLICY "Users can delete their own profile avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'profiles' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);


-- ==============================================================================
-- 2. ENABLE RLS ON ALL TABLES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memorial_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memorial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;


-- ==============================================================================
-- 3. PROFILES POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Profiles are readable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- Anyone authenticated can read user profiles (e.g. for greetings, staff assignments)
CREATE POLICY "Profiles are readable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Also allow public select if needed for username availability checks
CREATE POLICY "Public can check usernames"
ON public.profiles FOR SELECT
TO anon
USING (true);

-- User can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins have full access
CREATE POLICY "Admins can manage all profiles"
ON public.profiles FOR ALL
TO authenticated
USING (public.current_user_role() = 'admin');


-- ==============================================================================
-- 4. MEMORIAL SPACES POLICIES (Inventory)
-- ==============================================================================
DROP POLICY IF EXISTS "Public and users can view plots" ON public.memorial_spaces;
DROP POLICY IF EXISTS "Staff and Admins can manage spaces" ON public.memorial_spaces;

-- Public visitors and authenticated users can view the cemetery plot layout
CREATE POLICY "Public and users can view plots"
ON public.memorial_spaces FOR SELECT
USING (true);

-- Staff and Admins can insert/update/delete plots
CREATE POLICY "Staff and Admins can manage spaces"
ON public.memorial_spaces FOR ALL
TO authenticated
USING (public.current_user_role() IN ('admin', 'staff'));


-- ==============================================================================
-- 5. RESERVATIONS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Clients view their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Clients can create reservations" ON public.reservations;
DROP POLICY IF EXISTS "Clients can update/cancel own pending reservations" ON public.reservations;
DROP POLICY IF EXISTS "Clients can delete own pending reservations" ON public.reservations;
DROP POLICY IF EXISTS "Staff and Admin can view and manage all reservations" ON public.reservations;

-- Clients can see their own bookings
CREATE POLICY "Clients view their own reservations"
ON public.reservations FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.current_user_role() IN ('admin', 'staff'));

-- Authenticated users can submit a reservation request
CREATE POLICY "Clients can create reservations"
ON public.reservations FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Clients can modify their own pending reservations
CREATE POLICY "Clients can update/cancel own pending reservations"
ON public.reservations FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND status = 'PENDING')
WITH CHECK (user_id = auth.uid());

-- Clients can delete their own pending reservations
CREATE POLICY "Clients can delete own pending reservations"
ON public.reservations FOR DELETE
TO authenticated
USING (user_id = auth.uid() AND status = 'PENDING');

-- Staff/Admins can view and manage all reservations
CREATE POLICY "Staff and Admin can view and manage all reservations"
ON public.reservations FOR ALL
TO authenticated
USING (public.current_user_role() IN ('admin', 'staff'));


-- ==============================================================================
-- 6. PAYMENTS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Clients can view payments for their reservations" ON public.payments;
DROP POLICY IF EXISTS "Staff and Admin can manage payments" ON public.payments;

-- Clients can view payment records associated with their reservations
CREATE POLICY "Clients can view payments for their reservations"
ON public.payments FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.reservations r
        WHERE r.id = payments.reservation_id AND r.user_id = auth.uid()
    ) OR public.current_user_role() IN ('admin', 'staff')
);

-- Staff and Admin can record and update payments
CREATE POLICY "Staff and Admin can manage payments"
ON public.payments FOR ALL
TO authenticated
USING (public.current_user_role() IN ('admin', 'staff'));


-- ==============================================================================
-- 7. MEMORIAL RECORDS POLICIES (Deceased Registry)
-- ==============================================================================
DROP POLICY IF EXISTS "Public can view deceased records" ON public.memorial_records;
DROP POLICY IF EXISTS "Staff and Admins can manage memorial records" ON public.memorial_records;
DROP POLICY IF EXISTS "Family contacts can update memorial records" ON public.memorial_records;

-- Public can search and view deceased memorials
CREATE POLICY "Public can view deceased records"
ON public.memorial_records FOR SELECT
USING (true);

-- Staff and Admins can manage all memorial records
CREATE POLICY "Staff and Admins can manage memorial records"
ON public.memorial_records FOR ALL
TO authenticated
USING (public.current_user_role() IN ('admin', 'staff'));

-- Family contact can update epitaph/photo
CREATE POLICY "Family contacts can update memorial records"
ON public.memorial_records FOR UPDATE
TO authenticated
USING (family_contact_id = auth.uid())
WITH CHECK (family_contact_id = auth.uid());


-- ==============================================================================
-- 8. STAFF TABLE POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Staff members can view staff directory" ON public.staff;
DROP POLICY IF EXISTS "Admins can manage staff records" ON public.staff;

CREATE POLICY "Staff members can view staff directory"
ON public.staff FOR SELECT
TO authenticated
USING (public.current_user_role() IN ('admin', 'staff'));

CREATE POLICY "Admins can manage staff records"
ON public.staff FOR ALL
TO authenticated
USING (public.current_user_role() = 'admin');


-- ==============================================================================
-- 9. MAINTENANCE VISITS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Users can view visits they requested" ON public.maintenance_visits;
DROP POLICY IF EXISTS "Users can request maintenance visits" ON public.maintenance_visits;
DROP POLICY IF EXISTS "Staff can view and update maintenance visits" ON public.maintenance_visits;

CREATE POLICY "Users can view visits they requested"
ON public.maintenance_visits FOR SELECT
TO authenticated
USING (requested_by = auth.uid() OR public.current_user_role() IN ('admin', 'staff'));

CREATE POLICY "Users can request maintenance visits"
ON public.maintenance_visits FOR INSERT
TO authenticated
WITH CHECK (requested_by = auth.uid());

CREATE POLICY "Staff can view and update maintenance visits"
ON public.maintenance_visits FOR ALL
TO authenticated
USING (public.current_user_role() IN ('admin', 'staff'));


-- ==============================================================================
-- 10. SUPPORT TICKETS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Users can view own support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can create support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Staff and Admin manage support tickets" ON public.support_tickets;

CREATE POLICY "Users can view own support tickets"
ON public.support_tickets FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.current_user_role() IN ('admin', 'staff'));

CREATE POLICY "Users can create support tickets"
ON public.support_tickets FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Staff and Admin manage support tickets"
ON public.support_tickets FOR ALL
TO authenticated
USING (public.current_user_role() IN ('admin', 'staff'));
