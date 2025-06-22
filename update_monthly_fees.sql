-- Option 1: Update all units to ₱15,000
UPDATE public.units 
SET monthly_fee = 15000.00;

-- Option 2: Update all units to ₱25,000
UPDATE public.units 
SET monthly_fee = 25000.00;

-- Option 3: Alternate between ₱15,000 and ₱25,000 based on unit number
UPDATE public.units 
SET monthly_fee = CASE 
    WHEN CAST(unit_number AS INTEGER) % 2 = 0 THEN 15000.00
    ELSE 25000.00
END;

-- Option 4: Set specific blocks to different fees
UPDATE public.units 
SET monthly_fee = CASE 
    WHEN block IN ('A', 'B', 'C') THEN 15000.00
    WHEN block IN ('D', 'E', 'F') THEN 25000.00
    ELSE 20000.00  -- Default for any other blocks
END;

-- Option 5: Random distribution (approximately 50/50 split)
UPDATE public.units 
SET monthly_fee = CASE 
    WHEN random() < 0.5 THEN 15000.00
    ELSE 25000.00
END;

-- Option 6: Based on unit number ranges
UPDATE public.units 
SET monthly_fee = CASE 
    WHEN CAST(unit_number AS INTEGER) <= 50 THEN 15000.00
    ELSE 25000.00
END;

-- Verify the changes
SELECT 
    block, 
    unit_number, 
    monthly_fee,
    COUNT(*) as count
FROM public.units 
GROUP BY block, unit_number, monthly_fee
ORDER BY block, unit_number;

-- Summary of fee distribution
SELECT 
    monthly_fee,
    COUNT(*) as unit_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public.units), 2) as percentage
FROM public.units 
GROUP BY monthly_fee
ORDER BY monthly_fee; 