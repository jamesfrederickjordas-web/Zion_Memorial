-- =========================================================================
-- Zion Memorial Garden: Apply Official Management Pricing & 20% Downpayment
-- =========================================================================
-- Run this script once in the Supabase SQL Editor to update all existing
-- memorial_spaces rows across every map & area to the new Lot Prices and
-- 20% Pre-Need Downpayments. Realtime subscriptions will automatically
-- sync the updated prices to Admin and Client pages.

UPDATE public.memorial_spaces
SET price = 45000.00,
    down_payment = 8280.00
WHERE category ILIKE '%condo%';

UPDATE public.memorial_spaces
SET price = 65000.00,
    down_payment = 11960.00
WHERE category ILIKE '%single%';

UPDATE public.memorial_spaces
SET price = 80000.00,
    down_payment = 14720.00
WHERE category ILIKE '%supreme%'
  AND category NOT ILIKE '%special%';

UPDATE public.memorial_spaces
SET price = 120000.00,
    down_payment = 22080.00
WHERE category ILIKE '%special%';

UPDATE public.memorial_spaces
SET price = 1000000.00,
    down_payment = 184000.00
WHERE category ILIKE '%mausoleum%'
   OR category ILIKE '%family%';
