-- Smart Pharmacy Database Schema for Supabase (FIXED VERSION)
-- Run this in your Supabase SQL Editor to create all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SUPPLIERS TABLE
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'India',
    rating DECIMAL(3,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. MEDICINES TABLE
CREATE TABLE IF NOT EXISTS medicines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    generic_name TEXT,
    brand TEXT,
    category TEXT DEFAULT 'General',
    dosage_form TEXT DEFAULT 'Tablet',
    strength TEXT,
    unit_price DECIMAL(10,2) DEFAULT 0,
    cost_price DECIMAL(10,2) DEFAULT 0,
    quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 10,
    max_stock_level INTEGER DEFAULT 1000,
    batch_number TEXT,
    expiry_date DATE,
    manufacturer TEXT,
    prescription_required BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SALES TABLE (FIXED: sale_date instead of ale_date)
CREATE TABLE IF NOT EXISTS sales (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    medicine_id UUID REFERENCES medicines(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_method TEXT DEFAULT 'cash',
    customer_name TEXT DEFAULT 'Walk-in Customer',
    customer_phone TEXT,
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PURCHASES TABLE (Optional - for tracking purchase history)
CREATE TABLE IF NOT EXISTS purchases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    medicine_id UUID REFERENCES medicines(id),
    supplier_id UUID REFERENCES suppliers(id),
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    batch_number TEXT,
    expiry_date DATE,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. LOW STOCK REQUESTS TABLE (for the low stock feature)
CREATE TABLE IF NOT EXISTS low_stock_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    medicine_id UUID REFERENCES medicines(id),
    requested_quantity INTEGER NOT NULL,
    current_stock INTEGER NOT NULL,
    min_stock_level INTEGER NOT NULL,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    requested_by TEXT DEFAULT 'System',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name);
CREATE INDEX IF NOT EXISTS idx_medicines_category ON medicines(category);
CREATE INDEX IF NOT EXISTS idx_medicines_expiry ON medicines(expiry_date);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_medicine ON sales(medicine_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(purchase_date);
CREATE INDEX IF NOT EXISTS idx_low_stock_status ON low_stock_requests(status);

-- Enable Row Level Security (RLS)
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE low_stock_requests ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (adjust as needed for your security requirements)
-- For development/testing - allows all operations

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on suppliers" ON suppliers;
DROP POLICY IF EXISTS "Allow all operations on medicines" ON medicines;
DROP POLICY IF EXISTS "Allow all operations on sales" ON sales;
DROP POLICY IF EXISTS "Allow all operations on purchases" ON purchases;
DROP POLICY IF EXISTS "Allow all operations on low_stock_requests" ON low_stock_requests;

-- Suppliers policies
CREATE POLICY "Allow all operations on suppliers" ON suppliers
    FOR ALL USING (true) WITH CHECK (true);

-- Medicines policies
CREATE POLICY "Allow all operations on medicines" ON medicines
    FOR ALL USING (true) WITH CHECK (true);

-- Sales policies
CREATE POLICY "Allow all operations on sales" ON sales
    FOR ALL USING (true) WITH CHECK (true);

-- Purchases policies
CREATE POLICY "Allow all operations on purchases" ON purchases
    FOR ALL USING (true) WITH CHECK (true);

-- Low stock requests policies
CREATE POLICY "Allow all operations on low_stock_requests" ON low_stock_requests
    FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
DROP TRIGGER IF EXISTS update_medicines_updated_at ON medicines;
DROP TRIGGER IF EXISTS update_low_stock_requests_updated_at ON low_stock_requests;

-- Add updated_at triggers
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medicines_updated_at BEFORE UPDATE ON medicines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_low_stock_requests_updated_at BEFORE UPDATE ON low_stock_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample suppliers data
INSERT INTO suppliers (name, contact_person, email, phone, city, state) VALUES
('Apollo Supply Chain', 'Rajesh Kumar', 'rajesh@apollo.com', '+91-9876543210', 'Mumbai', 'Maharashtra'),
('Hetero Healthcare', 'Priya Sharma', 'priya@hetero.com', '+91-9876543211', 'Hyderabad', 'Telangana'),
('MedPlus Mart', 'Amit Patel', 'amit@medplus.com', '+91-9876543212', 'Chennai', 'Tamil Nadu')
ON CONFLICT (name) DO NOTHING;

-- Insert sample medicines data
INSERT INTO medicines (name, generic_name, category, unit_price, cost_price, quantity, min_stock_level, expiry_date, manufacturer) VALUES
('Dolo 650', 'Paracetamol', 'Pain Relief', 25.00, 20.00, 100, 20, '2025-12-31', 'Micro Labs'),
('Azithral 500', 'Azithromycin', 'Antibiotics', 95.00, 80.00, 50, 15, '2025-12-31', 'Alembic Pharma'),
('Pan 40', 'Pantoprazole', 'Gastric', 120.00, 100.00, 75, 25, '2025-12-31', 'Alkem Labs'),
('Glycomet 500', 'Metformin', 'Diabetes', 18.00, 15.00, 200, 30, '2025-12-31', 'USV Ltd'),
('Telma 40', 'Telmisartan', 'Hypertension', 180.00, 150.00, 60, 20, '2025-12-31', 'Glenmark'),
('Allegra 120', 'Fexofenadine', 'Antihistamine', 160.00, 140.00, 80, 25, '2025-12-31', 'Sanofi')
ON CONFLICT (name) DO NOTHING;

-- Insert sample sales data for testing dashboard
INSERT INTO sales (medicine_id, quantity, unit_price, total_price, payment_method, customer_name, sale_date, final_amount) 
SELECT 
    m.id,
    FLOOR(RANDOM() * 10 + 1)::INTEGER as quantity,
    m.unit_price,
    m.unit_price * FLOOR(RANDOM() * 10 + 1),
    CASE FLOOR(RANDOM() * 3)
        WHEN 0 THEN 'cash'
        WHEN 1 THEN 'card'
        ELSE 'upi'
    END as payment_method,
    CASE FLOOR(RANDOM() * 5)
        WHEN 0 THEN 'John Doe'
        WHEN 1 THEN 'Jane Smith'
        WHEN 2 THEN 'Raj Patel'
        WHEN 3 THEN 'Priya Sharma'
        ELSE 'Walk-in Customer'
    END as customer_name,
    NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 7) as sale_date,
    m.unit_price * FLOOR(RANDOM() * 10 + 1) as final_amount
FROM medicines m
WHERE EXISTS (SELECT 1 FROM medicines LIMIT 1);

-- 🔧 BACKFILL QUERIES FOR EXISTING DATA
-- Run these UPDATE queries if you already have data and need to populate missing columns

-- Backfill medicines data from purchases table
-- Update cost_price from purchases
UPDATE medicines 
SET cost_price = p.avg_cost,
    updated_at = NOW()
FROM (
    SELECT 
        medicine_id,
        AVG(unit_cost) as avg_cost
    FROM purchases 
    WHERE unit_cost > 0
    GROUP BY medicine_id
) p
WHERE medicines.id = p.medicine_id 
AND (medicines.cost_price = 0 OR medicines.cost_price IS NULL);

-- Update manufacturer from purchases/suppliers
UPDATE medicines 
SET manufacturer = COALESCE(s.name, 'Unknown Manufacturer'),
    updated_at = NOW()
FROM purchases p
JOIN suppliers s ON p.supplier_id = s.id
WHERE medicines.id = p.medicine_id 
AND (medicines.manufacturer IS NULL OR medicines.manufacturer = '');

-- Update batch_number from latest purchase
UPDATE medicines 
SET batch_number = p.batch_number,
    updated_at = NOW()
FROM (
    SELECT DISTINCT ON (medicine_id) 
        medicine_id, 
        batch_number
    FROM purchases 
    WHERE batch_number IS NOT NULL
    ORDER BY medicine_id, purchase_date DESC
) p
WHERE medicines.id = p.medicine_id 
AND (medicines.batch_number IS NULL OR medicines.batch_number = '');

-- Update expiry_date from latest purchase
UPDATE medicines 
SET expiry_date = p.expiry_date,
    updated_at = NOW()
FROM (
    SELECT DISTINCT ON (medicine_id) 
        medicine_id, 
        expiry_date
    FROM purchases 
    WHERE expiry_date IS NOT NULL
    ORDER BY medicine_id, purchase_date DESC
) p
WHERE medicines.id = p.medicine_id 
AND (medicines.expiry_date IS NULL OR medicines.expiry_date < '2025-01-01');

-- Update quantity from purchases (sum all received quantities)
UPDATE medicines 
SET quantity = COALESCE(p.total_received, 0) - COALESCE(s.total_sold, 0),
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

-- Set reasonable unit_price based on cost_price if missing
UPDATE medicines 
SET unit_price = ROUND(cost_price * 1.3, 2),  -- 30% markup
    updated_at = NOW()
WHERE (unit_price = 0 OR unit_price IS NULL) 
AND cost_price > 0;

-- Set default category based on medicine name patterns
UPDATE medicines 
SET category = CASE 
    WHEN LOWER(name) LIKE '%paracetamol%' OR LOWER(name) LIKE '%dolo%' THEN 'Pain Relief'
    WHEN LOWER(name) LIKE '%azithromycin%' OR LOWER(name) LIKE '%antibiotic%' THEN 'Antibiotics'
    WHEN LOWER(name) LIKE '%pantoprazole%' OR LOWER(name) LIKE '%pan%' THEN 'Gastric'
    WHEN LOWER(name) LIKE '%metformin%' OR LOWER(name) LIKE '%glycomet%' THEN 'Diabetes'
    WHEN LOWER(name) LIKE '%telmisartan%' OR LOWER(name) LIKE '%telma%' THEN 'Hypertension'
    WHEN LOWER(name) LIKE '%fexofenadine%' OR LOWER(name) LIKE '%allegra%' THEN 'Antihistamine'
    ELSE 'General'
END,
updated_at = NOW()
WHERE category = 'General' OR category IS NULL;

-- Set min_stock_level based on average sales if available
UPDATE medicines 
SET min_stock_level = GREATEST(COALESCE(s.avg_monthly_sales, 10), 5),
    updated_at = NOW()
FROM (
    SELECT 
        medicine_id,
        CEIL(AVG(quantity) * 30) as avg_monthly_sales  -- Estimate monthly from daily average
    FROM sales 
    WHERE sale_date >= NOW() - INTERVAL '30 days'
    GROUP BY medicine_id
) s
WHERE medicines.id = s.medicine_id 
AND min_stock_level = 10;  -- Only update default values

-- Success messages
SELECT 'Smart Pharmacy database schema created successfully! 🎉' as message;
SELECT 'Tables created: suppliers, medicines, sales, purchases, low_stock_requests' as tables;
SELECT 'Sample data inserted for testing' as sample_data;
SELECT 'Backfill queries executed for existing data' as backfill_status;
SELECT 'You can now import your JSON data!' as next_step;

-- Show summary of created data
SELECT 
    (SELECT COUNT(*) FROM suppliers) as suppliers_count,
    (SELECT COUNT(*) FROM medicines) as medicines_count,
    (SELECT COUNT(*) FROM sales) as sales_count,
    (SELECT COUNT(*) FROM purchases) as purchases_count;