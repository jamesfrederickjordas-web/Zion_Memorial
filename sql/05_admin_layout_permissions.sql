-- ==============================================================================
-- PHASE 2 EXTENSION: ADMIN PLOT LAYOUT PERMISSIONS & SEED DATA FOR ALL 12 LAWNS
-- ==============================================================================

-- 1. Ensure authenticated users and staff/admins can manage memorial_spaces
DROP POLICY IF EXISTS "Public and users can view plots" ON public.memorial_spaces;
DROP POLICY IF EXISTS "Staff and Admins can manage spaces" ON public.memorial_spaces;
DROP POLICY IF EXISTS "Allow plot management for prototype" ON public.memorial_spaces;

-- Anyone can view plots
CREATE POLICY "Public and users can view plots"
ON public.memorial_spaces FOR SELECT USING (true);

-- Allow authenticated users and admins to manage spaces
CREATE POLICY "Allow plot management for prototype"
ON public.memorial_spaces FOR ALL
USING (true)
WITH CHECK (true);

-- 2. SEED PLOTS FOR REMAINING MAP AREAS (Areas 3, 6, 7, 8, 9, 11)

-- Area 3: Family Estate Jr. / Lawn of Hope (10 premium family lots)
INSERT INTO public.memorial_spaces (plot_identifier, section_name, category, status, price, down_payment, row_num, col_num)
SELECT 
    'FE-H' || LPAD(s::text, 3, '0'),
    'Area 3 - Lawn of Hope (Family Estate)',
    'Family Estate Jr.',
    CASE WHEN s = 2 THEN 'occupied' WHEN s = 5 THEN 'reserved' ELSE 'available' END,
    180000.00,
    30000.00,
    ((s - 1) / 5) + 1,
    ((s - 1) % 5) + 1
FROM generate_series(1, 10) AS s
ON CONFLICT (plot_identifier) DO NOTHING;

-- Area 6: Lawn of Peace (Single Tiered, 20 plots)
INSERT INTO public.memorial_spaces (plot_identifier, section_name, category, status, price, down_payment, row_num, col_num)
SELECT 
    'ST-P' || LPAD(s::text, 3, '0'),
    'Area 6 - Lawn of Peace',
    'Single Teired',
    CASE WHEN s % 4 = 0 THEN 'occupied' WHEN s % 5 = 0 THEN 'reserved' ELSE 'available' END,
    42000.00,
    6500.00,
    ((s - 1) / 10) + 1,
    ((s - 1) % 10) + 1
FROM generate_series(1, 20) AS s
ON CONFLICT (plot_identifier) DO NOTHING;

-- Area 7: Lawn of Faith (Supreme, 20 plots)
INSERT INTO public.memorial_spaces (plot_identifier, section_name, category, status, price, down_payment, row_num, col_num)
SELECT 
    'SUP-F' || LPAD(s::text, 3, '0'),
    'Area 7 - Lawn of Faith',
    'Supreme',
    CASE WHEN s % 3 = 0 THEN 'reserved' WHEN s % 6 = 0 THEN 'occupied' ELSE 'available' END,
    65000.00,
    9500.00,
    ((s - 1) / 10) + 1,
    ((s - 1) % 10) + 1
FROM generate_series(1, 20) AS s
ON CONFLICT (plot_identifier) DO NOTHING;

-- Area 8: Lawn of Grace (Supreme, 15 plots)
INSERT INTO public.memorial_spaces (plot_identifier, section_name, category, status, price, down_payment, row_num, col_num)
SELECT 
    'SUP-G' || LPAD(s::text, 3, '0'),
    'Area 8 - Lawn of Grace',
    'Supreme',
    CASE WHEN s % 4 = 0 THEN 'occupied' ELSE 'available' END,
    65000.00,
    9500.00,
    ((s - 1) / 5) + 1,
    ((s - 1) % 5) + 1
FROM generate_series(1, 15) AS s
ON CONFLICT (plot_identifier) DO NOTHING;

-- Area 9: Lawn of Serenity (Special Supreme, 20 plots)
INSERT INTO public.memorial_spaces (plot_identifier, section_name, category, status, price, down_payment, row_num, col_num)
SELECT 
    'SPEC-S' || LPAD(s::text, 3, '0'),
    'Area 9 - Lawn of Serenity',
    'Special Supreme',
    CASE WHEN s % 5 = 0 THEN 'reserved' WHEN s = 7 THEN 'occupied' ELSE 'available' END,
    71486.37,
    10200.00,
    ((s - 1) / 10) + 1,
    ((s - 1) % 10) + 1
FROM generate_series(1, 20) AS s
ON CONFLICT (plot_identifier) DO NOTHING;

-- Area 11: Lawn of Memories (Special Supreme, 20 plots)
INSERT INTO public.memorial_spaces (plot_identifier, section_name, category, status, price, down_payment, row_num, col_num)
SELECT 
    'SPEC-M' || LPAD(s::text, 3, '0'),
    'Area 11 - Lawn of Memories',
    'Special Supreme',
    CASE WHEN s % 4 = 0 THEN 'occupied' WHEN s = 9 THEN 'reserved' ELSE 'available' END,
    71486.37,
    10200.00,
    ((s - 1) / 10) + 1,
    ((s - 1) % 10) + 1
FROM generate_series(1, 20) AS s
ON CONFLICT (plot_identifier) DO NOTHING;

-- 3. HELPER FUNCTION: Update or Insert Plot in Layout Editor
CREATE OR REPLACE FUNCTION public.admin_upsert_plot(
    p_id BIGINT,
    p_plot_identifier VARCHAR(50),
    p_section_name VARCHAR(100),
    p_category VARCHAR(50),
    p_status VARCHAR(20),
    p_price NUMERIC(12,2),
    p_down_payment NUMERIC(12,2),
    p_row INT,
    p_col INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result RECORD;
BEGIN
    IF p_id IS NOT NULL AND p_id > 0 THEN
        UPDATE public.memorial_spaces
        SET 
            plot_identifier = p_plot_identifier,
            section_name = p_section_name,
            category = p_category,
            status = p_status,
            price = p_price,
            down_payment = p_down_payment,
            row_num = p_row,
            col_num = p_col,
            updated_at = NOW()
        WHERE id = p_id
        RETURNING * INTO v_result;
    ELSE
        INSERT INTO public.memorial_spaces (
            plot_identifier, section_name, category, status, price, down_payment, row_num, col_num
        ) VALUES (
            p_plot_identifier, p_section_name, p_category, p_status, p_price, p_down_payment, p_row, p_col
        )
        RETURNING * INTO v_result;
    END IF;

    RETURN to_jsonb(v_result);
END;
$$;

