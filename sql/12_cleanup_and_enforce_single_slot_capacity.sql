-- ==============================================================================
-- ZION MEMORIAL GARDEN - COMPREHENSIVE DATABASE CLEANUP & CAPACITY ENFORCEMENT
-- ==============================================================================
-- Run this script in the Supabase SQL Editor.
-- 
-- What this script does:
-- 1. Deduplicates multiple/duplicate deceased records on single-capacity plots (keeps earliest record).
-- 2. Enforces plot capacity = 1 for standard plots (Supreme, Special Supreme, Condominium, Single Tiered).
-- 3. Reconciles ALL plot statuses in memorial_spaces:
--    - 'occupied'  -> has active deceased in memorial_records
--    - 'reserved'  -> has active reservation (not CANCELLED/REJECTED) and 0 deceased
--    - 'available' -> has 0 deceased and 0 active reservations (fixes SUP4-003 and any orphaned occupied plots)
-- 4. Installs automatic triggers so deleting or inserting deceased ALWAYS updates plot status in real time.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- STEP 1: DEDUPLICATE DECEASED RECORDS ON STANDARD (1-SLOT) PLOTS
-- Keeps the earliest record (smallest id) and removes redundant duplicate entries.
-- ------------------------------------------------------------------------------
DELETE FROM public.memorial_records
WHERE id IN (
    SELECT r.id
    FROM (
        SELECT 
            r.id,
            r.space_id,
            ROW_NUMBER() OVER (
                PARTITION BY r.space_id 
                ORDER BY r.id ASC
            ) as slot_num,
            s.category
        FROM public.memorial_records r
        LEFT JOIN public.memorial_spaces s ON s.id = r.space_id
        WHERE s.category NOT ILIKE '%Family Estate%' 
          AND s.category NOT ILIKE '%Mausoleum%'
    ) r
    WHERE r.slot_num > 1
);

-- Also remove exact name duplicates on the same space_id across any category
DELETE FROM public.memorial_records
WHERE id IN (
    SELECT id
    FROM (
        SELECT 
            id,
            ROW_NUMBER() OVER (
                PARTITION BY space_id, LOWER(TRIM(deceased_name))
                ORDER BY id ASC
            ) as dup_rank
        FROM public.memorial_records
    ) d
    WHERE d.dup_rank > 1
);

-- ------------------------------------------------------------------------------
-- STEP 2: RECONCILE ALL PLOT STATUSES IN MEMORIAL_SPACES
-- ------------------------------------------------------------------------------

-- A. Mark plots with deceased as 'occupied'
UPDATE public.memorial_spaces s
SET status = 'occupied', updated_at = NOW()
WHERE EXISTS (
    SELECT 1 FROM public.memorial_records r WHERE r.space_id = s.id
)
AND s.status <> 'occupied';

-- B. Mark plots with active reservation (and no deceased) as 'reserved'
UPDATE public.memorial_spaces s
SET status = 'reserved', updated_at = NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM public.memorial_records r WHERE r.space_id = s.id
)
AND EXISTS (
    SELECT 1 FROM public.reservations res 
    WHERE res.space_id = s.id 
      AND UPPER(COALESCE(res.status, '')) NOT IN ('CANCELLED', 'REJECTED')
)
AND s.status <> 'reserved';

-- C. Mark plots with NO deceased and NO active reservations as 'available'
-- (This immediately fixes SUP4-003 and any other orphaned plots)
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
AND s.status NOT IN ('available', 'maintenance')
AND s.section_name NOT LIKE '%__SYSTEM%';

-- ------------------------------------------------------------------------------
-- STEP 3: DATABASE TRIGGER TO ENFORCE STRICT 1-SLOT CAPACITY FOR STANDARD PLOTS
-- ------------------------------------------------------------------------------
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

    -- Only re-check on UPDATE when space_id changes
    IF TG_OP = 'UPDATE' AND NEW.space_id IS NOT DISTINCT FROM OLD.space_id THEN
        RETURN NEW;
    END IF;

    SELECT category INTO v_category
    FROM public.memorial_spaces
    WHERE id = NEW.space_id;

    -- Strict Capacity Rules:
    -- Family Estate / Mausoleum: up to 8 deceased
    -- Supreme, Special Supreme, Condominium, Single Tiered: strictly 1 deceased
    IF v_category ILIKE '%Family Estate%' OR v_category ILIKE '%Mausoleum%' THEN
        v_capacity := 8;
    ELSE
        v_capacity := 1;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM public.memorial_records
    WHERE space_id = NEW.space_id
      AND (TG_OP = 'INSERT' OR id <> NEW.id);

    IF v_count >= v_capacity THEN
        IF v_capacity = 1 THEN
            RAISE EXCEPTION 'Plot capacity exceeded: % plots allow strictly 1 interred deceased (1 of 1 slot).', COALESCE(v_category, 'Standard');
        ELSE
            RAISE EXCEPTION 'Plot capacity exceeded: % plots allow a maximum of % deceased.', v_category, v_capacity;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_memorial_space_capacity ON public.memorial_records;
CREATE TRIGGER trg_enforce_memorial_space_capacity
BEFORE INSERT OR UPDATE OF space_id ON public.memorial_records
FOR EACH ROW EXECUTE FUNCTION public.enforce_memorial_space_capacity();

-- ------------------------------------------------------------------------------
-- STEP 4: DATABASE TRIGGER TO AUTOMATICALLY UPDATE PLOT STATUS ON INSERT/UPDATE/DELETE
-- ------------------------------------------------------------------------------
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

COMMIT;

-- Verification output
SELECT 
    s.category,
    s.status,
    COUNT(*) as plot_count
FROM public.memorial_spaces s
WHERE s.section_name NOT LIKE '%__SYSTEM%'
GROUP BY s.category, s.status
ORDER BY s.category, s.status;

