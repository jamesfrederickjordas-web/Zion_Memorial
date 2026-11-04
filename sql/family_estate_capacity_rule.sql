-- ==============================================================================
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

