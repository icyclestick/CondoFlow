-- Set all units to vacant first
UPDATE public.units 
SET status = 'vacant';

-- Set only the specified units to occupied
UPDATE public.units 
SET status = 'occupied'
WHERE id IN (
    'f82eb53e-9096-4374-a428-4e804bbb3a56',
    '4b6d4977-d802-4225-9c10-d0cfdc0940f1',
    'e1a96f15-bb15-4392-b85f-e43cf60b1ad1',
    '880ac182-d296-45be-8204-fac289501083'
);

-- Verify the changes
SELECT 
    id,
    block,
    unit_number,
    status,
    monthly_fee
FROM public.units 
WHERE id IN (
    'f82eb53e-9096-4374-a428-4e804bbb3a56',
    '4b6d4977-d802-4225-9c10-d0cfdc0940f1',
    'e1a96f15-bb15-4392-b85f-e43cf60b1ad1',
    '880ac182-d296-45be-8204-fac289501083'
)
ORDER BY block, unit_number;

-- Summary of all units
SELECT 
    status,
    COUNT(*) as unit_count
FROM public.units 
GROUP BY status
ORDER BY status;

-- Check which units have residents assigned
SELECT 
    u.id,
    u.block,
    u.unit_number,
    u.status,
    COUNT(ur.id) as resident_count
FROM public.units u
LEFT JOIN public.unit_residency ur ON u.id = ur.unit_id AND ur.is_active = true
GROUP BY u.id, u.block, u.unit_number, u.status
ORDER BY u.block, u.unit_number; 