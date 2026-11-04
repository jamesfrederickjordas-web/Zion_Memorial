-- ==============================================================================
-- ZION MEMORIAL GARDEN - PHASE 1: SEED DATA & INVENTORY METRICS
-- Project: Cloud-Based Online Reservation and Records Management System
-- ==============================================================================

-- ==============================================================================
-- 1. ANALYTICS / KPI SUMMARY VIEW
-- Provides instant metrics matching the Admin Dashboard KPI cards in Figma
-- ==============================================================================
CREATE OR REPLACE VIEW public.inventory_summary AS
SELECT
    COUNT(*) AS total_plots,
    COUNT(*) FILTER (WHERE status = 'available') AS available_plots,
    COUNT(*) FILTER (WHERE status = 'reserved') AS reserved_plots,
    COUNT(*) FILTER (WHERE status = 'occupied') AS occupied_plots,
    COUNT(*) FILTER (WHERE status = 'maintenance') AS maintenance_plots
FROM public.memorial_spaces;

-- ==============================================================================
-- 2. SEED MEMORIAL SPACES (PLOTS & NICHES)
-- Matching exact Figma identifiers (SPB54, SPB58, SB59, CA23, CB10, SD35)
-- ==============================================================================

-- Specific plots shown on Figma dashboard tables
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

-- Generate realistic available plots across all 5 sections for testing
-- Condominium (Niches in vertical blocks)
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

-- Single Tiered Lawn
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

-- Supreme Lawn
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

-- Special Supreme Lawn
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

-- Mausoleum
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
