-- ==============================================================================
-- CLEAR ALL MEMORIAL SPACES (PLOTS & NICHES)
-- Zion Memorial Garden - Cloud Database Cleanup
-- ==============================================================================

-- 1. Remove any references in child tables (if any exist)
DELETE FROM public.maintenance_visits;
DELETE FROM public.memorial_records;
DELETE FROM public.payments;
DELETE FROM public.reservations;

-- 2. Clear all plots from memorial_spaces
TRUNCATE TABLE public.memorial_spaces RESTART IDENTITY CASCADE;

-- 3. Verify that the table is completely empty
SELECT COUNT(*) AS remaining_plots FROM public.memorial_spaces;

