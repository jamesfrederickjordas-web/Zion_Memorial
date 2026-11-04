-- ==============================================================================
-- CLEAR ALL DECEASED RECORDS & RESET PLOT STATUSES
-- Zion Memorial Garden - Cloud Database Cleanup
-- Run this in the Supabase SQL Editor.
-- ==============================================================================

-- 1. Remove all records from the memorial_records table
DELETE FROM public.memorial_records;

-- 2. Reset occupied plots back to 'reserved' (if an active reservation exists) or 'available'
UPDATE public.memorial_spaces s
SET status = CASE 
    WHEN EXISTS (
        SELECT 1 FROM public.reservations r 
        WHERE r.space_id = s.id 
        AND r.status NOT IN ('CANCELLED', 'REJECTED')
    ) THEN 'reserved'
    ELSE 'available'
END,
updated_at = NOW()
WHERE s.status = 'occupied';

-- 3. Reset auto-increment sequence (optional)
ALTER SEQUENCE IF EXISTS public.memorial_records_id_seq RESTART WITH 1;

-- 4. Verify results
SELECT 
    (SELECT COUNT(*) FROM public.memorial_records) AS remaining_deceased_records,
    (SELECT COUNT(*) FROM public.memorial_spaces WHERE status = 'occupied') AS occupied_plots_count,
    (SELECT COUNT(*) FROM public.memorial_spaces WHERE status = 'reserved') AS reserved_plots_count,
    (SELECT COUNT(*) FROM public.memorial_spaces WHERE status = 'available') AS available_plots_count;

