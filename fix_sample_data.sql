-- Option 1: Set all units to vacant (Recommended for sample data)
UPDATE public.units 
SET status = 'vacant';

-- Option 2: Clean up orphaned residency records (if any exist)
-- This removes residency records for units that don't exist
DELETE FROM public.unit_residency 
WHERE unit_id NOT IN (SELECT id FROM public.units);

-- Option 3: Set units to vacant only if they don't have active residents
UPDATE public.units 
SET status = 'vacant'
WHERE id NOT IN (
    SELECT DISTINCT unit_id 
    FROM public.unit_residency 
    WHERE is_active = true
);

-- Verify the changes
SELECT 
    status,
    COUNT(*) as unit_count
FROM public.units 
GROUP BY status
ORDER BY status;

-- Check for any units that still have residency issues
SELECT 
    u.id,
    u.block,
    u.unit_number,
    u.status,
    COUNT(ur.id) as residency_count
FROM public.units u
LEFT JOIN public.unit_residency ur ON u.id = ur.unit_id AND ur.is_active = true
GROUP BY u.id, u.block, u.unit_number, u.status
HAVING u.status = 'occupied' AND COUNT(ur.id) = 0; 