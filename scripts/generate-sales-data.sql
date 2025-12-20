-- 🎯 GENERATE 10,000+ REALISTIC SALES RECORDS
-- This creates realistic sales patterns with seasonal variations

-- Generate sales data for the last 365 days with realistic patterns
DO $$
DECLARE
    medicine_record RECORD;
    sale_date DATE;
    daily_sales INTEGER;
    customer_names TEXT[] := ARRAY[
        'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Vikram Singh',
        'Kavya Nair', 'Rohit Gupta', 'Meera Shah', 'Arun Joshi', 'Sanjay Reddy',
        'Neha Agarwal', 'Kiran Kumar', 'Pooja Mehta', 'Ravi Tiwari', 'Deepika Jain',
        'Suresh Rao', 'Anita Singh', 'Rajiv Menon', 'Lakshmi Devi', 'Venkat Reddy',
        'Arjun Nair', 'Divya Iyer', 'Manoj Gupta', 'Sunita Devi', 'Ramesh Babu',
        'Geeta Rani', 'Sunil Kumar', 'Madhuri Dixit', 'Ajay Devgan', 'Kajol Sharma',
        'Walk-in Customer', 'Regular Customer', 'Senior Citizen', 'Insurance Patient'
    ];
    payment_methods TEXT[] := ARRAY['cash', 'card', 'upi', 'insurance'];
    i INTEGER;
    j INTEGER;
    quantity INTEGER;
    customer_name TEXT;
    payment_method TEXT;
    discount DECIMAL(10,2);
    final_amount DECIMAL(10,2);
BEGIN
    -- Loop through last 365 days
    FOR i IN 0..364 LOOP
        sale_date := CURRENT_DATE - INTERVAL '1 day' * i;
        
        -- Determine daily sales volume based on day patterns
        daily_sales := CASE 
            WHEN EXTRACT(DOW FROM sale_date) IN (0, 6) THEN 15 + FLOOR(RANDOM() * 10) -- Weekend: 15-25 sales
            WHEN EXTRACT(DOW FROM sale_date) IN (1, 5) THEN 25 + FLOOR(RANDOM() * 15) -- Mon/Fri: 25-40 sales  
            ELSE 35 + FLOOR(RANDOM() * 20) -- Tue-Thu: 35-55 sales
        END;
        
        -- Seasonal adjustments
        IF EXTRACT(MONTH FROM sale_date) IN (12, 1, 2) THEN -- Winter: more cold/flu medicines
            daily_sales := daily_sales + FLOOR(RANDOM() * 10);
        ELSIF EXTRACT(MONTH FROM sale_date) IN (6, 7, 8) THEN -- Summer: more digestive issues
            daily_sales := daily_sales + FLOOR(RANDOM() * 8);
        END IF;
        
        -- Generate sales for this day
        FOR j IN 1..daily_sales LOOP
            -- Select random medicine with weighted probability (common medicines more likely)
            SELECT * INTO medicine_record FROM medicines 
            WHERE CASE 
                WHEN category IN ('Pain Relief', 'Gastric', 'Vitamins') THEN RANDOM() < 0.4 -- 40% chance
                WHEN category IN ('Antibiotics', 'Diabetes', 'Hypertension') THEN RANDOM() < 0.25 -- 25% chance
                ELSE RANDOM() < 0.15 -- 15% chance for others
            END
            ORDER BY RANDOM() LIMIT 1;
            
            -- Skip if no medicine selected
            CONTINUE WHEN medicine_record IS NULL;
            
            -- Generate realistic quantity (1-5 for most, up to 10 for vitamins/common medicines)
            quantity := CASE 
                WHEN medicine_record.category IN ('Vitamins', 'Pain Relief') THEN 1 + FLOOR(RANDOM() * 8)
                WHEN medicine_record.category = 'Antibiotics' THEN 1 + FLOOR(RANDOM() * 2) -- Usually 1-2
                ELSE 1 + FLOOR(RANDOM() * 4) -- 1-4 for others
            END;
            
            -- Select customer and payment method
            customer_name := customer_names[1 + FLOOR(RANDOM() * array_length(customer_names, 1))];
            payment_method := payment_methods[1 + FLOOR(RANDOM() * array_length(payment_methods, 1))];
            
            -- Calculate discount (0-15% randomly, higher for bulk purchases)
            discount := CASE 
                WHEN quantity >= 5 THEN RANDOM() * 15 -- Up to 15% for bulk
                WHEN customer_name = 'Senior Citizen' THEN 5 + RANDOM() * 10 -- 5-15% for seniors
                WHEN payment_method = 'insurance' THEN 10 + RANDOM() * 20 -- 10-30% for insurance
                ELSE RANDOM() * 8 -- 0-8% regular discount
            END;
            
            final_amount := (medicine_record.unit_price * quantity) * (1 - discount/100);
            
            -- Insert the sale record
            INSERT INTO sales (
                medicine_id, 
                quantity, 
                unit_price, 
                total_price, 
                payment_method, 
                customer_name, 
                customer_phone,
                sale_date, 
                discount_amount, 
                tax_amount,
                final_amount, 
                status
            ) VALUES (
                medicine_record.id,
                quantity,
                medicine_record.unit_price,
                medicine_record.unit_price * quantity,
                payment_method,
                customer_name,
                CASE WHEN RANDOM() > 0.3 THEN '+91-' || (9000000000 + FLOOR(RANDOM() * 999999999))::TEXT ELSE NULL END,
                sale_date + (RANDOM() * INTERVAL '23 hours 59 minutes'), -- Random time during the day
                ROUND((medicine_record.unit_price * quantity * discount/100), 2),
                ROUND((final_amount * 0.05), 2), -- 5% tax
                ROUND(final_amount, 2),
                'completed'
            );
            
        END LOOP;
        
        -- Progress indicator every 30 days
        IF i % 30 = 0 THEN
            RAISE NOTICE 'Generated sales for % days ago (Date: %)', i, sale_date;
        END IF;
        
    END LOOP;
    
    RAISE NOTICE 'Sales data generation completed!';
END $$;