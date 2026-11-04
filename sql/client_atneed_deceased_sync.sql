-- ==============================================================================
-- ZION MEMORIAL GARDEN - AT-NEED DECEASED SYNC & CLIENT PERMISSIONS
-- Ensures client reservations with AT-NEED immediately assign deceased
-- to the reserved plot, update plot status to 'occupied', and reflect in Admin.
-- Run this in the Supabase SQL Editor.
-- ==============================================================================

-- 1. Ensure RLS is active on memorial_records
ALTER TABLE public.memorial_records ENABLE ROW LEVEL SECURITY;

-- 2. Allow Authenticated Clients to INSERT Memorial Records for their reserved spaces
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

-- 3. Allow Family Contacts and Space Owners to UPDATE Memorial Records
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

-- 4. Allow Family Contacts and Admins to DELETE Memorial Records
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

-- 5. AUTOMATIC TRIGGER: Synchronize plot occupancy whenever a deceased record is added or removed
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
            -- Check if any other deceased remain in this plot
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

-- 6. Ensure Reservation Status Change Trigger respects AT-NEED reservations
CREATE OR REPLACE FUNCTION public.handle_reservation_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- If reservation already has an interred deceased or is AT-NEED, mark occupied; otherwise reserved
        IF NEW.plan_type = 'AT-NEED' AND EXISTS (SELECT 1 FROM public.memorial_records WHERE space_id = NEW.space_id) THEN
            UPDATE public.memorial_spaces
            SET status = 'occupied', updated_at = NOW()
            WHERE id = NEW.space_id;
        ELSE
            UPDATE public.memorial_spaces
            SET status = 'reserved', updated_at = NOW()
            WHERE id = NEW.space_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.status IN ('CANCELLED', 'REJECTED') AND OLD.status NOT IN ('CANCELLED', 'REJECTED') THEN
            -- If deceased is interred, stay occupied; otherwise available
            IF EXISTS (SELECT 1 FROM public.memorial_records WHERE space_id = NEW.space_id) THEN
                UPDATE public.memorial_spaces
                SET status = 'occupied', updated_at = NOW()
                WHERE id = NEW.space_id;
            ELSE
                UPDATE public.memorial_spaces
                SET status = 'available', updated_at = NOW()
                WHERE id = NEW.space_id;
            END IF;
        ELSIF NEW.status IN ('APPROVED', 'COMPLETED') AND OLD.status NOT IN ('APPROVED', 'COMPLETED') THEN
            UPDATE public.memorial_spaces
            SET status = 'occupied', updated_at = NOW()
            WHERE id = NEW.space_id;
        ELSIF NEW.status = 'PENDING' AND OLD.status IN ('CANCELLED', 'REJECTED') THEN
            IF EXISTS (SELECT 1 FROM public.memorial_records WHERE space_id = NEW.space_id) THEN
                UPDATE public.memorial_spaces
                SET status = 'occupied', updated_at = NOW()
                WHERE id = NEW.space_id;
            ELSE
                UPDATE public.memorial_spaces
                SET status = 'reserved', updated_at = NOW()
                WHERE id = NEW.space_id;
            END IF;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF NOT EXISTS (SELECT 1 FROM public.memorial_records WHERE space_id = OLD.space_id) THEN
            UPDATE public.memorial_spaces
            SET status = 'available', updated_at = NOW()
            WHERE id = OLD.space_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

