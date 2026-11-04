-- ==============================================================================
-- ZION MEMORIAL GARDEN - PHASE 2: RESERVATIONS, AMORTIZATION & INVENTORY SYNC
-- Project: Cloud-Based Online Reservation and Records Management System
-- Database: Supabase (PostgreSQL)
-- ==============================================================================

-- 1. AUTOMATIC PLOT STATUS SYNC TRIGGER
-- Keeps memorial_spaces.status automatically in sync whenever reservations change
CREATE OR REPLACE FUNCTION public.handle_reservation_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- When a new reservation is created
    IF TG_OP = 'INSERT' THEN
        UPDATE public.memorial_spaces
        SET status = 'reserved', updated_at = NOW()
        WHERE id = NEW.space_id;
        RETURN NEW;

    -- When a reservation status changes
    ELSIF TG_OP = 'UPDATE' THEN
        -- If cancelled or rejected, release the plot back to available
        IF NEW.status IN ('CANCELLED', 'REJECTED') AND OLD.status NOT IN ('CANCELLED', 'REJECTED') THEN
            UPDATE public.memorial_spaces
            SET status = 'available', updated_at = NOW()
            WHERE id = NEW.space_id;
        -- If approved or completed, mark as occupied
        ELSIF NEW.status IN ('APPROVED', 'COMPLETED') AND OLD.status NOT IN ('APPROVED', 'COMPLETED') THEN
            UPDATE public.memorial_spaces
            SET status = 'occupied', updated_at = NOW()
            WHERE id = NEW.space_id;
        -- If reinstated from cancelled to pending/reserved
        ELSIF NEW.status = 'PENDING' AND OLD.status IN ('CANCELLED', 'REJECTED') THEN
            UPDATE public.memorial_spaces
            SET status = 'reserved', updated_at = NOW()
            WHERE id = NEW.space_id;
        END IF;
        RETURN NEW;

    -- When a reservation is deleted, release the plot
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.memorial_spaces
        SET status = 'available', updated_at = NOW()
        WHERE id = OLD.space_id;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if already exists and recreate
DROP TRIGGER IF EXISTS trg_reservation_status_change ON public.reservations;
CREATE TRIGGER trg_reservation_status_change
    AFTER INSERT OR UPDATE OR DELETE ON public.reservations
    FOR EACH ROW EXECUTE FUNCTION public.handle_reservation_status_change();


-- 2. HELPER FUNCTION TO GENERATE UNIQUE RESERVATION NUMBER
-- Generates clean formats like 'ZMG-YYYYMMDD-XXXX'
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


-- 3. ENSURE CLIENTS CAN CANCEL OR UPDATE OWN PENDING RESERVATIONS
DROP POLICY IF EXISTS "Clients can update/cancel own pending reservations" ON public.reservations;
CREATE POLICY "Clients can update/cancel own pending reservations"
ON public.reservations FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND status = 'PENDING')
WITH CHECK (user_id = auth.uid());

