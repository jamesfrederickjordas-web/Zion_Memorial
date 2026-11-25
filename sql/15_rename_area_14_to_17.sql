-- =========================================================================
-- Zion Memorial Garden: Rename Areas 14, 15, 16, 17 from Rectangle names
-- to official Lawn names across plots & saved map layout configuration.
-- =========================================================================

UPDATE public.memorial_spaces
SET section_name = CASE
    WHEN section_name ILIKE 'Area 14 - Rectangle 19' THEN 'Area 14 - Lawn of Harmony'
    WHEN section_name ILIKE 'Area 15 - Rectangle 18' THEN 'Area 15 - Lawn of Mercy'
    WHEN section_name ILIKE 'Area 16 - Rectangle 28' THEN 'Area 16 - Lawn of Blessing'
    WHEN section_name ILIKE 'Area 17 - Rectangle 32' THEN 'Area 17 - Lawn of Promise'
    ELSE section_name
END
WHERE section_name ILIKE 'Area 14 - Rectangle 19'
   OR section_name ILIKE 'Area 15 - Rectangle 18'
   OR section_name ILIKE 'Area 16 - Rectangle 28'
   OR section_name ILIKE 'Area 17 - Rectangle 32';

-- Update saved vector layout config JSON so Map Editor & all maps store the new names
UPDATE public.memorial_spaces
SET coordinates = replace(
        replace(
            replace(
                replace(coordinates::text, 'Area 14 - Rectangle 19', 'Area 14 - Lawn of Harmony'),
                'Area 15 - Rectangle 18', 'Area 15 - Lawn of Mercy'
            ),
            'Area 16 - Rectangle 28', 'Area 16 - Lawn of Blessing'
        ),
        'Area 17 - Rectangle 32', 'Area 17 - Lawn of Promise'
    )::jsonb
WHERE plot_identifier = 'ZMG-MAP-VECTOR-LAYOUT-CONFIG'
  AND coordinates IS NOT NULL;
