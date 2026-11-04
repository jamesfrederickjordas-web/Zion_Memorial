-- ==============================================================================
-- 11. AUTOMATIC PLOT STATUS SYNCHRONIZATION ON DECEASED INTERMENT CHANGE
-- Ensures memorial_spaces.status is ALWAYS updated to 'occupied', 'reserved',
-- or 'available' whenever a record in memorial_records is INSERTED, UPDATED, or DELETED.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.fn_sync_space_status_on_deceased_change()
RETURNS TRIGGER AS $$
DECLARE
    v_space_id BIGINT;
    v_remaining_deceased INT;
    v_active_reservations INT;
BEGIN
    v_space_id := COALESCE(NEW.space_id, OLD.space_id);
    IF v_space_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- Count active deceased records remaining for this space
    SELECT COUNT(*) INTO v_remaining_deceased
    FROM public.memorial_records
    WHERE space_id = v_space_id;

    IF v_remaining_deceased > 0 THEN
        UPDATE public.memorial_spaces
        SET status = 'occupied', updated_at = NOW()
        WHERE id = v_space_id;
    ELSE
        -- No deceased remain: check if an active reservation exists for this space
        SELECT COUNT(*) INTO v_active_reservations
        FROM public.reservations
        WHERE space_id = v_space_id
          AND UPPER(COALESCE(status, '')) NOT IN ('CANCELLED', 'REJECTED');

        IF v_active_reservations > 0 THEN
            UPDATE public.memorial_spaces
            SET status = 'reserved', updated_at = NOW()
            WHERE id = v_space_id;
        ELSE
            UPDATE public.memorial_spaces
            SET status = 'available', updated_at = NOW()
            WHERE id = v_space_id;
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_space_status_on_deceased ON public.memorial_records;
CREATE TRIGGER trg_sync_space_status_on_deceased
AFTER INSERT OR UPDATE OR DELETE ON public.memorial_records
FOR EACH ROW
EXECUTE FUNCTION public.fn_sync_space_status_on_deceased_change();

-- Run an initial reconciliation pass across all plots to correct any out-of-sync plots
UPDATE public.memorial_spaces s
SET status = 'occupied', updated_at = NOW()
WHERE EXISTS (
    SELECT 1 FROM public.memorial_records r WHERE r.space_id = s.id
);

UPDATE public.memorial_spaces s
SET status = 'reserved', updated_at = NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM public.memorial_records r WHERE r.space_id = s.id
)
AND EXISTS (
    SELECT 1 FROM public.reservations res 
    WHERE res.space_id = s.id 
      AND UPPER(COALESCE(res.status, '')) NOT IN ('CANCELLED', 'REJECTED')
);

UPDATE public.memorial_spaces s
SET status = 'available', updated_at = NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM public.memorial_records r WHERE r.space_id = s.id
)
AND NOT EXISTS (
    SELECT 1 FROM public.reservations res 
    WHERE res.space_id = s.id 
      AND UPPER(COALESCE(res.status, '')) NOT IN ('CANCELLED', 'REJECTED')
)
AND s.status NOT IN ('available', 'maintenance');

