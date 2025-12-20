-- 🎯 GENERATE REALISTIC PURCHASE RECORDS
-- This creates purchase history that matches inventory levels

DO $$
DECLARE
    medicine_record RECORD;
    supplier_record RECORD;
    purchase_date DATE;
    quantity INTEGER;
    batch_num TEXT;
    i INTEGER;
BEGIN
    -- Generate purchases for each medicine over the last 180 days
    FOR medicine_record IN SELECT * FROM medicines LOOP
        
        -- Generate 3-8 purchase orders per medicine over 6 months
        FOR i IN 1..(3 + FLOOR(RANDOM() * 6)) LOOP
            
            -- Random purchase date in last 180 days
            purchase_date := CURRENT_DATE - INTERVAL '1 day' * FLOOR(RANDOM() * 180);
            
            -- Select random supplier
            SELECT * INTO supplier_record FROM suppliers ORDER BY RANDOM() LIMIT 1;
            
            -- Calculate purchase quantity based on medicine popularity and stock levels
            quantity := CASE 
                WHEN medicine_record.category IN ('Pain Relief', 'Gastric', 'Vitamins') THEN 
                    200 + FLOOR(RANDOM() * 800) -- 200-1000 units for popular medicines
                WHEN medicine_record.category IN ('Antibiotics', 'Diabetes', 'Hypertension') THEN 
                    100 + FLOOR(RANDOM() * 400) -- 100-500 units for prescription medicines
                ELSE 
                    50 + FLOOR(RANDOM() * 200) -- 50-250 units for specialized medicines
            END;
            
            -- Generate realistic batch number
            batch_num := UPPER(LEFT(medicine_record.generic_name, 3)) || '-' || 
                        TO_CHAR(purchase_date, 'YYMM') || '-' || 
                        LPAD((10 + FLOOR(RANDOM() * 90))::TEXT, 2, '0');
            
            -- Insert purchase record
            INSERT INTO purchases (
                medicine_id,
                supplier_id,
                quantity,
                unit_cost,
                total_cost,
                purchase_date,
                batch_number,
                expiry_date,
                status
            ) VALUES (
                medicine_record.id,
                supplier_record.id,
                quantity,
                medicine_record.cost_price,
                medicine_record.cost_price * quantity,
                purchase_date,
                batch_num,
                purchase_date + INTERVAL '18 months' + (RANDOM() * INTERVAL '12 months'), -- 18-30 months expiry
                'completed'
            );
            
        END LOOP;
        
    END LOOP;
    
    RAISE NOTICE 'Purchase data generation completed!';
END $$;

-- Update medicine quantities based on purchases minus estimated sales
UPDATE medicines 
SET quantity = COALESCE(p.total_purchased, 0) - COALESCE(s.total_sold, 0)
FROM (
    SELECT medicine_id, SUM(quantity) as total_purchased
    FROM purchases 
    GROUP BY medicine_id
) p
LEFT JOIN (
    SELECT medicine_id, SUM(quantity) as total_sold
    FROM sales 
    GROUP BY medicine_id
) s ON p.medicine_id = s.medicine_id
WHERE medicines.id = p.medicine_id;

-- Ensure no negative quantities
UPDATE medicines SET quantity = GREATEST(quantity, 0);

-- Generate some low stock requests for medicines below minimum level
INSERT INTO low_stock_requests (medicine_id, requested_quantity, current_stock, min_stock_level, priority, status, requested_by, notes)
SELECT 
    id,
    min_stock_level * 3, -- Request 3x minimum stock
    quantity,
    min_stock_level,
    CASE 
        WHEN quantity = 0 THEN 'high'
        WHEN quantity < min_stock_level * 0.5 THEN 'high'
        ELSE 'medium'
    END,
    CASE WHEN RANDOM() > 0.7 THEN 'approved' ELSE 'pending' END,
    'System Auto-Request',
    'Auto-generated based on stock levels'
FROM medicines 
WHERE quantity < min_stock_level
LIMIT 20;