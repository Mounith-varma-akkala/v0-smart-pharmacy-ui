-- 🔧 BACKFILL MEDICINES DATA FROM PURCHASES AND SUPPLIERS
-- Run this script if you already have medicines, purchases, and suppliers tables
-- and want to populate missing medicine columns from existing data

-- 1. Update cost_price from average purchase costs
UPDATE medicines 
SET cost_price = p.avg_cost,
    updated_at = NOW()
FROM (
    SELECT 
        medicine_id,
        ROUND(AVG(unit_cost), 2) as avg_cost
    FROM purchases 
    WHERE unit_cost > 0
    GROUP BY medicine_id
) p
WHERE medicines.id = p.medicine_id 
AND (medicines.cost_price = 0 OR medicines.cost_price IS NULL);

-- 2. Update manufacturer from suppliers via purchases
UPDATE medicines 
SET manufacturer = s.name,
    updated_at = NOW()
FROM purchases p
JOIN suppliers s ON p.supplier_id = s.id
WHERE medicines.id = p.medicine_id 
AND (medicines.manufacturer IS NULL OR medicines.manufacturer = '' OR medicines.manufacturer = 'Unknown Manufacturer')
AND s.name IS NOT NULL;

-- 3. Update batch_number from most recent purchase
UPDATE medicines 
SET batch_number = p.batch_number,
    updated_at = NOW()
FROM (
    SELECT DISTINCT ON (medicine_id) 
        medicine_id, 
        batch_number
    FROM purchases 
    WHERE batch_number IS NOT NULL AND batch_number != ''
    ORDER BY medicine_id, purchase_date DESC
) p
WHERE medicines.id = p.medicine_id 
AND (medicines.batch_number IS NULL OR medicines.batch_number = '');

-- 4. Update expiry_date from most recent purchase
UPDATE medicines 
SET expiry_date = p.expiry_date,
    updated_at = NOW()
FROM (
    SELECT DISTINCT ON (medicine_id) 
        medicine_id, 
        expiry_date
    FROM purchases 
    WHERE expiry_date IS NOT NULL AND expiry_date > CURRENT_DATE
    ORDER BY medicine_id, purchase_date DESC
) p
WHERE medicines.id = p.medicine_id 
AND (medicines.expiry_date IS NULL OR medicines.expiry_date <= CURRENT_DATE);

-- 5. Update quantity = total_purchased - total_sold
UPDATE medicines 
SET quantity = GREATEST(
    COALESCE(p.total_received, 0) - COALESCE(s.total_sold, 0), 
    0
),
updated_at = NOW()
FROM (
    SELECT 
        medicine_id,
        SUM(quantity) as total_received
    FROM purchases 
    GROUP BY medicine_id
) p
LEFT JOIN (
    SELECT 
        medicine_id,
        SUM(quantity) as total_sold
    FROM sales 
    GROUP BY medicine_id
) s ON p.medicine_id = s.medicine_id
WHERE medicines.id = p.medicine_id;

-- 6. Set unit_price based on cost_price with markup if missing
UPDATE medicines 
SET unit_price = ROUND(cost_price * 1.25, 2),  -- 25% markup
    updated_at = NOW()
WHERE (unit_price = 0 OR unit_price IS NULL) 
AND cost_price > 0;

-- 7. Set intelligent categories based on medicine names
UPDATE medicines 
SET category = CASE 
    -- Pain Relief
    WHEN LOWER(name) LIKE '%paracetamol%' OR LOWER(name) LIKE '%dolo%' 
         OR LOWER(name) LIKE '%ibuprofen%' OR LOWER(name) LIKE '%aspirin%' THEN 'Pain Relief'
    
    -- Antibiotics
    WHEN LOWER(name) LIKE '%azithromycin%' OR LOWER(name) LIKE '%azithral%'
         OR LOWER(name) LIKE '%amoxicillin%' OR LOWER(name) LIKE '%antibiotic%' THEN 'Antibiotics'
    
    -- Gastric/Digestive
    WHEN LOWER(name) LIKE '%pantoprazole%' OR LOWER(name) LIKE '%pan%'
         OR LOWER(name) LIKE '%omeprazole%' OR LOWER(name) LIKE '%ranitidine%' THEN 'Gastric'
    
    -- Diabetes
    WHEN LOWER(name) LIKE '%metformin%' OR LOWER(name) LIKE '%glycomet%'
         OR LOWER(name) LIKE '%insulin%' OR LOWER(name) LIKE '%diabetes%' THEN 'Diabetes'
    
    -- Hypertension/Cardiac
    WHEN LOWER(name) LIKE '%telmisartan%' OR LOWER(name) LIKE '%telma%'
         OR LOWER(name) LIKE '%amlodipine%' OR LOWER(name) LIKE '%atenolol%' THEN 'Hypertension'
    
    -- Antihistamine/Allergy
    WHEN LOWER(name) LIKE '%fexofenadine%' OR LOWER(name) LIKE '%allegra%'
         OR LOWER(name) LIKE '%cetirizine%' OR LOWER(name) LIKE '%loratadine%' THEN 'Antihistamine'
    
    -- Vitamins/Supplements
    WHEN LOWER(name) LIKE '%vitamin%' OR LOWER(name) LIKE '%calcium%'
         OR LOWER(name) LIKE '%iron%' OR LOWER(name) LIKE '%supplement%' THEN 'Vitamins'
    
    -- Keep existing category if it's not 'General'
    WHEN category != 'General' AND category IS NOT NULL THEN category
    
    ELSE 'General'
END,
updated_at = NOW()
WHERE category = 'General' OR category IS NULL OR category = '';

-- 8. Set min_stock_level based on sales patterns
UPDATE medicines 
SET min_stock_level = GREATEST(
    COALESCE(s.suggested_min_stock, 10), 
    5  -- Minimum of 5 units
),
updated_at = NOW()
FROM (
    SELECT 
        medicine_id,
        -- Calculate suggested minimum: 1.5x average weekly sales
        CEIL(AVG(quantity) * 7 * 1.5) as suggested_min_stock
    FROM sales 
    WHERE sale_date >= NOW() - INTERVAL '30 days'
    GROUP BY medicine_id
    HAVING COUNT(*) >= 3  -- Only if we have at least 3 sales
) s
WHERE medicines.id = s.medicine_id;

-- 9. Set max_stock_level based on min_stock_level
UPDATE medicines 
SET max_stock_level = min_stock_level * 10,  -- 10x minimum stock
    updated_at = NOW()
WHERE max_stock_level <= min_stock_level;

-- 10. Set generic_name from medicine name if missing
UPDATE medicines 
SET generic_name = CASE 
    WHEN LOWER(name) LIKE '%paracetamol%' OR LOWER(name) LIKE '%dolo%' THEN 'Paracetamol'
    WHEN LOWER(name) LIKE '%azithromycin%' OR LOWER(name) LIKE '%azithral%' THEN 'Azithromycin'
    WHEN LOWER(name) LIKE '%pantoprazole%' OR LOWER(name) LIKE '%pan%' THEN 'Pantoprazole'
    WHEN LOWER(name) LIKE '%metformin%' OR LOWER(name) LIKE '%glycomet%' THEN 'Metformin'
    WHEN LOWER(name) LIKE '%telmisartan%' OR LOWER(name) LIKE '%telma%' THEN 'Telmisartan'
    WHEN LOWER(name) LIKE '%fexofenadine%' OR LOWER(name) LIKE '%allegra%' THEN 'Fexofenadine'
    WHEN LOWER(name) LIKE '%ibuprofen%' THEN 'Ibuprofen'
    WHEN LOWER(name) LIKE '%amoxicillin%' THEN 'Amoxicillin'
    WHEN LOWER(name) LIKE '%cetirizine%' THEN 'Cetirizine'
    WHEN LOWER(name) LIKE '%omeprazole%' THEN 'Omeprazole'
    ELSE SPLIT_PART(name, ' ', 1)  -- Use first word as generic name
END,
updated_at = NOW()
WHERE generic_name IS NULL OR generic_name = '';

-- 11. Set brand from medicine name (extract brand part)
UPDATE medicines 
SET brand = CASE 
    WHEN LOWER(name) LIKE '%dolo%' THEN 'Dolo'
    WHEN LOWER(name) LIKE '%azithral%' THEN 'Azithral'
    WHEN LOWER(name) LIKE '%pan%' THEN 'Pan'
    WHEN LOWER(name) LIKE '%glycomet%' THEN 'Glycomet'
    WHEN LOWER(name) LIKE '%telma%' THEN 'Telma'
    WHEN LOWER(name) LIKE '%allegra%' THEN 'Allegra'
    ELSE SPLIT_PART(name, ' ', 1)  -- Use first word as brand
END,
updated_at = NOW()
WHERE brand IS NULL OR brand = '';

-- 12. Extract strength from medicine name
UPDATE medicines 
SET strength = CASE 
    WHEN name ~ '\d+\s*mg' THEN SUBSTRING(name FROM '\d+\s*mg')
    WHEN name ~ '\d+mg' THEN SUBSTRING(name FROM '\d+mg')
    WHEN name ~ '\d+\s*g' THEN SUBSTRING(name FROM '\d+\s*g')
    WHEN name ~ '\d+g' THEN SUBSTRING(name FROM '\d+g')
    WHEN name ~ '\d+\s*ml' THEN SUBSTRING(name FROM '\d+\s*ml')
    WHEN name ~ '\d+ml' THEN SUBSTRING(name FROM '\d+ml')
    ELSE NULL
END,
updated_at = NOW()
WHERE strength IS NULL OR strength = '';

-- Show results of backfill operation
SELECT 'Backfill operation completed! 🎉' as status;

SELECT 
    'Medicines updated:' as operation,
    COUNT(*) as count
FROM medicines 
WHERE updated_at >= NOW() - INTERVAL '1 minute';

SELECT 
    'Summary of medicine data:' as summary,
    COUNT(*) as total_medicines,
    COUNT(CASE WHEN cost_price > 0 THEN 1 END) as with_cost_price,
    COUNT(CASE WHEN manufacturer IS NOT NULL AND manufacturer != '' THEN 1 END) as with_manufacturer,
    COUNT(CASE WHEN batch_number IS NOT NULL AND batch_number != '' THEN 1 END) as with_batch_number,
    COUNT(CASE WHEN expiry_date > CURRENT_DATE THEN 1 END) as with_valid_expiry,
    COUNT(CASE WHEN category != 'General' THEN 1 END) as with_specific_category
FROM medicines;

-- Show categories distribution
SELECT 
    category,
    COUNT(*) as medicine_count
FROM medicines 
GROUP BY category 
ORDER BY medicine_count DESC;