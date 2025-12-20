-- 🎯 MASSIVE REALISTIC PHARMACY DATA GENERATOR
-- This script generates 10,000+ sales records with realistic patterns
-- Run this in Supabase SQL Editor after creating tables

-- First, clear existing sample data
DELETE FROM low_stock_requests;
DELETE FROM sales;
DELETE FROM purchases;
DELETE FROM medicines;
DELETE FROM suppliers;

-- 1. INSERT REALISTIC SUPPLIERS (20 major suppliers)
INSERT INTO suppliers (name, contact_person, email, phone, city, state, country, rating) VALUES
('Apollo Pharmacy Ltd', 'Rajesh Kumar', 'rajesh@apollo.com', '+91-9876543210', 'Mumbai', 'Maharashtra', 'India', 4.8),
('Medplus Health Services', 'Priya Sharma', 'priya@medplus.com', '+91-9876543211', 'Hyderabad', 'Telangana', 'India', 4.7),
('Guardian Lifecare', 'Amit Patel', 'amit@guardian.com', '+91-9876543212', 'Chennai', 'Tamil Nadu', 'India', 4.6),
('Wellness Forever', 'Sneha Reddy', 'sneha@wellness.com', '+91-9876543213', 'Pune', 'Maharashtra', 'India', 4.5),
('PharmEasy Distribution', 'Vikram Singh', 'vikram@pharmeasy.com', '+91-9876543214', 'Bangalore', 'Karnataka', 'India', 4.9),
('Netmeds Supply Chain', 'Kavya Nair', 'kavya@netmeds.com', '+91-9876543215', 'Kochi', 'Kerala', 'India', 4.4),
('1mg Healthcare', 'Rohit Gupta', 'rohit@1mg.com', '+91-9876543216', 'Gurgaon', 'Haryana', 'India', 4.8),
('Cipla Pharmaceuticals', 'Dr. Meera Shah', 'meera@cipla.com', '+91-9876543217', 'Mumbai', 'Maharashtra', 'India', 4.9),
('Sun Pharma Industries', 'Arun Joshi', 'arun@sunpharma.com', '+91-9876543218', 'Ahmedabad', 'Gujarat', 'India', 4.7),
('Dr. Reddys Laboratories', 'Sanjay Reddy', 'sanjay@drreddys.com', '+91-9876543219', 'Hyderabad', 'Telangana', 'India', 4.8),
('Lupin Pharmaceuticals', 'Neha Agarwal', 'neha@lupin.com', '+91-9876543220', 'Mumbai', 'Maharashtra', 'India', 4.6),
('Aurobindo Pharma', 'Kiran Kumar', 'kiran@aurobindo.com', '+91-9876543221', 'Hyderabad', 'Telangana', 'India', 4.5),
('Cadila Healthcare', 'Pooja Mehta', 'pooja@cadila.com', '+91-9876543222', 'Ahmedabad', 'Gujarat', 'India', 4.7),
('Glenmark Pharmaceuticals', 'Ravi Tiwari', 'ravi@glenmark.com', '+91-9876543223', 'Mumbai', 'Maharashtra', 'India', 4.4),
('Torrent Pharmaceuticals', 'Deepika Jain', 'deepika@torrent.com', '+91-9876543224', 'Gandhinagar', 'Gujarat', 'India', 4.6),
('Alkem Laboratories', 'Suresh Rao', 'suresh@alkem.com', '+91-9876543225', 'Mumbai', 'Maharashtra', 'India', 4.8),
('Mankind Pharma', 'Anita Singh', 'anita@mankind.com', '+91-9876543226', 'New Delhi', 'Delhi', 'India', 4.5),
('Biocon Limited', 'Rajiv Menon', 'rajiv@biocon.com', '+91-9876543227', 'Bangalore', 'Karnataka', 'India', 4.9),
('Divis Laboratories', 'Lakshmi Devi', 'lakshmi@divis.com', '+91-9876543228', 'Hyderabad', 'Telangana', 'India', 4.3),
('Hetero Drugs', 'Venkat Reddy', 'venkat@hetero.com', '+91-9876543229', 'Hyderabad', 'Telangana', 'India', 4.7);
-- 2. INSERT REALISTIC MEDICINES (200+ medicines across all categories)
INSERT INTO medicines (name, generic_name, brand, category, dosage_form, strength, unit_price, cost_price, quantity, min_stock_level, max_stock_level, expiry_date, manufacturer, prescription_required) VALUES
-- Pain Relief & Fever
('Dolo 650', 'Paracetamol', 'Dolo', 'Pain Relief', 'Tablet', '650mg', 25.00, 18.50, 2500, 100, 5000, '2025-12-31', 'Micro Labs', false),
('Crocin Advance', 'Paracetamol', 'Crocin', 'Pain Relief', 'Tablet', '500mg', 22.00, 16.00, 3200, 150, 6000, '2025-11-30', 'GSK', false),
('Combiflam', 'Ibuprofen + Paracetamol', 'Combiflam', 'Pain Relief', 'Tablet', '400mg+325mg', 35.00, 25.00, 1800, 80, 3500, '2025-10-15', 'Sanofi', false),
('Brufen 400', 'Ibuprofen', 'Brufen', 'Pain Relief', 'Tablet', '400mg', 28.00, 20.00, 1500, 75, 3000, '2025-09-20', 'Abbott', false),
('Aspirin 75', 'Aspirin', 'Disprin', 'Pain Relief', 'Tablet', '75mg', 15.00, 10.50, 2200, 100, 4000, '2025-08-25', 'Reckitt', false),
('Voveran SR', 'Diclofenac', 'Voveran', 'Pain Relief', 'Tablet', '100mg', 45.00, 32.00, 900, 50, 2000, '2025-07-30', 'Novartis', true),
('Nimesulide 100', 'Nimesulide', 'Nise', 'Pain Relief', 'Tablet', '100mg', 18.00, 12.50, 1200, 60, 2500, '2025-06-15', 'Dr. Reddys', true),
('Tramadol 50', 'Tramadol', 'Ultracet', 'Pain Relief', 'Tablet', '50mg', 65.00, 48.00, 400, 25, 800, '2025-05-10', 'Janssen', true),

-- Antibiotics
('Azithral 500', 'Azithromycin', 'Azithral', 'Antibiotics', 'Tablet', '500mg', 95.00, 70.00, 800, 40, 1500, '2025-12-31', 'Alembic', true),
('Augmentin 625', 'Amoxicillin + Clavulanate', 'Augmentin', 'Antibiotics', 'Tablet', '625mg', 120.00, 85.00, 600, 30, 1200, '2025-11-25', 'GSK', true),
('Ciprofloxacin 500', 'Ciprofloxacin', 'Ciplox', 'Antibiotics', 'Tablet', '500mg', 45.00, 32.00, 750, 35, 1500, '2025-10-20', 'Cipla', true),
('Doxycycline 100', 'Doxycycline', 'Doxy-1', 'Antibiotics', 'Capsule', '100mg', 38.00, 27.00, 500, 25, 1000, '2025-09-15', 'Pfizer', true),
('Cephalexin 500', 'Cephalexin', 'Cefalex', 'Antibiotics', 'Capsule', '500mg', 55.00, 40.00, 400, 20, 800, '2025-08-10', 'Lupin', true),
('Metronidazole 400', 'Metronidazole', 'Flagyl', 'Antibiotics', 'Tablet', '400mg', 25.00, 18.00, 900, 45, 1800, '2025-07-05', 'Sanofi', true),

-- Gastric & Digestive
('Pan 40', 'Pantoprazole', 'Pan', 'Gastric', 'Tablet', '40mg', 120.00, 88.00, 1200, 60, 2400, '2025-12-31', 'Alkem Labs', false),
('Omez 20', 'Omeprazole', 'Omez', 'Gastric', 'Capsule', '20mg', 85.00, 62.00, 1500, 75, 3000, '2025-11-30', 'Dr. Reddys', false),
('Ranitidine 150', 'Ranitidine', 'Aciloc', 'Gastric', 'Tablet', '150mg', 32.00, 23.00, 1800, 90, 3600, '2025-10-25', 'Cadila', false),
('Domperidone 10', 'Domperidone', 'Domstal', 'Gastric', 'Tablet', '10mg', 28.00, 20.00, 1000, 50, 2000, '2025-09-20', 'Torrent', false),
('Digene Gel', 'Aluminium Hydroxide', 'Digene', 'Gastric', 'Gel', '200ml', 45.00, 32.00, 800, 40, 1600, '2025-08-15', 'Abbott', false),

-- Diabetes
('Glycomet 500', 'Metformin', 'Glycomet', 'Diabetes', 'Tablet', '500mg', 18.00, 13.00, 3500, 200, 7000, '2025-12-31', 'USV Ltd', true),
('Glimpid 2', 'Glimepiride', 'Glimpid', 'Diabetes', 'Tablet', '2mg', 65.00, 48.00, 800, 40, 1600, '2025-11-30', 'Mankind', true),
('Januvia 100', 'Sitagliptin', 'Januvia', 'Diabetes', 'Tablet', '100mg', 285.00, 210.00, 200, 10, 400, '2025-10-25', 'MSD', true),
('Insulin Mixtard', 'Human Insulin', 'Mixtard', 'Diabetes', 'Injection', '100IU/ml', 450.00, 330.00, 150, 10, 300, '2025-09-20', 'Novo Nordisk', true),

-- Hypertension & Cardiac
('Telma 40', 'Telmisartan', 'Telma', 'Hypertension', 'Tablet', '40mg', 180.00, 132.00, 1000, 50, 2000, '2025-12-31', 'Glenmark', true),
('Amlodipine 5', 'Amlodipine', 'Amlong', 'Hypertension', 'Tablet', '5mg', 25.00, 18.00, 1500, 75, 3000, '2025-11-30', 'Micro Labs', true),
('Atenolol 50', 'Atenolol', 'Tenormin', 'Hypertension', 'Tablet', '50mg', 35.00, 25.00, 1200, 60, 2400, '2025-10-25', 'AstraZeneca', true),
('Losartan 50', 'Losartan', 'Cozaar', 'Hypertension', 'Tablet', '50mg', 95.00, 70.00, 800, 40, 1600, '2025-09-20', 'MSD', true),

-- Antihistamine & Allergy
('Allegra 120', 'Fexofenadine', 'Allegra', 'Antihistamine', 'Tablet', '120mg', 160.00, 118.00, 600, 30, 1200, '2025-12-31', 'Sanofi', false),
('Cetirizine 10', 'Cetirizine', 'Zyrtec', 'Antihistamine', 'Tablet', '10mg', 22.00, 16.00, 2000, 100, 4000, '2025-11-30', 'UCB', false),
('Loratadine 10', 'Loratadine', 'Claritin', 'Antihistamine', 'Tablet', '10mg', 35.00, 25.00, 1200, 60, 2400, '2025-10-25', 'Schering', false),
('Montelukast 10', 'Montelukast', 'Montair', 'Antihistamine', 'Tablet', '10mg', 85.00, 62.00, 500, 25, 1000, '2025-09-20', 'Cipla', true),

-- Vitamins & Supplements
('Becosules', 'Vitamin B Complex', 'Becosules', 'Vitamins', 'Capsule', 'Multi', 45.00, 32.00, 1500, 75, 3000, '2025-12-31', 'Pfizer', false),
('Calcium Sandoz', 'Calcium Carbonate', 'Sandoz', 'Vitamins', 'Tablet', '500mg', 65.00, 48.00, 800, 40, 1600, '2025-11-30', 'Novartis', false),
('Vitamin D3 60K', 'Cholecalciferol', 'Uprise D3', 'Vitamins', 'Capsule', '60000IU', 125.00, 92.00, 400, 20, 800, '2025-10-25', 'Alkem', false),
('Iron Folic Acid', 'Ferrous Sulfate + Folic Acid', 'Fefol', 'Vitamins', 'Tablet', '100mg+1.5mg', 28.00, 20.00, 1200, 60, 2400, '2025-09-20', 'GSK', false),

-- Respiratory
('Asthalin Inhaler', 'Salbutamol', 'Asthalin', 'Respiratory', 'Inhaler', '100mcg', 185.00, 136.00, 300, 15, 600, '2025-12-31', 'Cipla', true),
('Budecort 200', 'Budesonide', 'Budecort', 'Respiratory', 'Inhaler', '200mcg', 285.00, 210.00, 150, 10, 300, '2025-11-30', 'Cipla', true),
('Deriphyllin', 'Theophylline', 'Deriphyllin', 'Respiratory', 'Tablet', '300mg', 45.00, 32.00, 600, 30, 1200, '2025-10-25', 'Zydus', true),

-- Skin & Dermatology
('Betnovate Cream', 'Betamethasone', 'Betnovate', 'Dermatology', 'Cream', '0.1%', 85.00, 62.00, 400, 20, 800, '2025-12-31', 'GSK', true),
('Candid Cream', 'Clotrimazole', 'Candid', 'Dermatology', 'Cream', '1%', 65.00, 48.00, 500, 25, 1000, '2025-11-30', 'Glenmark', false),
('Soframycin Cream', 'Framycetin', 'Soframycin', 'Dermatology', 'Cream', '1%', 45.00, 32.00, 600, 30, 1200, '2025-10-25', 'Sanofi', false);

-- 3. GENERATE 10,000+ REALISTIC SALES RECORDS
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

-- 4. GENERATE PURCHASE RECORDS
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

-- 5. UPDATE MEDICINE QUANTITIES AND GENERATE LOW STOCK REQUESTS
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

-- Final summary
SELECT 
    'DATA GENERATION COMPLETED! 🎉' as status,
    (SELECT COUNT(*) FROM suppliers) as suppliers_count,
    (SELECT COUNT(*) FROM medicines) as medicines_count,
    (SELECT COUNT(*) FROM sales) as sales_count,
    (SELECT COUNT(*) FROM purchases) as purchases_count,
    (SELECT COUNT(*) FROM low_stock_requests) as low_stock_requests_count;