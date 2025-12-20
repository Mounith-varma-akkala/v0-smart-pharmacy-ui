-- Fresh Pharmacy Database Setup Script
-- This script creates a complete pharmacy management database from scratch

-- Drop existing tables if they exist (in correct order to handle foreign keys)
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS low_stock_requests CASCADE;
DROP TABLE IF EXISTS drug_substitutions CASCADE;
DROP TABLE IF EXISTS supplier_medicines CASCADE;
DROP TABLE IF EXISTS medicines CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'staff')),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Suppliers table
CREATE TABLE suppliers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    is_active BOOLEAN DEFAULT true,
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Medicines table
CREATE TABLE medicines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    brand VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    dosage_form VARCHAR(100), -- tablet, capsule, syrup, injection, etc.
    strength VARCHAR(100), -- 500mg, 10ml, etc.
    unit_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    quantity INTEGER NOT NULL DEFAULT 0,
    min_stock_level INTEGER DEFAULT 10,
    max_stock_level INTEGER DEFAULT 1000,
    batch_number VARCHAR(100),
    manufacturing_date DATE,
    expiry_date DATE NOT NULL,
    manufacturer VARCHAR(255),
    supplier_id UUID REFERENCES suppliers(id),
    prescription_required BOOLEAN DEFAULT false,
    storage_conditions TEXT,
    side_effects TEXT,
    contraindications TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Sales table
CREATE TABLE sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    final_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'card', 'upi', 'insurance')),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_email VARCHAR(255),
    prescription_id VARCHAR(100),
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES users(id),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Low Stock Requests table
CREATE TABLE low_stock_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    requested_quantity INTEGER NOT NULL,
    current_stock INTEGER NOT NULL,
    reason TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'ordered', 'received')),
    requested_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Drug Substitutions table
CREATE TABLE drug_substitutions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    original_medicine_id UUID NOT NULL REFERENCES medicines(id),
    substitute_medicine_id UUID NOT NULL REFERENCES medicines(id),
    reason VARCHAR(255),
    effectiveness_rating DECIMAL(3,2) DEFAULT 0.00,
    cost_difference DECIMAL(10,2),
    is_recommended BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(original_medicine_id, substitute_medicine_id)
);

-- Create Supplier Medicines junction table
CREATE TABLE supplier_medicines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    supplier_price DECIMAL(10,2),
    lead_time_days INTEGER DEFAULT 7,
    minimum_order_quantity INTEGER DEFAULT 1,
    is_preferred BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(supplier_id, medicine_id)
);

-- Create indexes for better performance
CREATE INDEX idx_medicines_category ON medicines(category);
CREATE INDEX idx_medicines_expiry ON medicines(expiry_date);
CREATE INDEX idx_medicines_quantity ON medicines(quantity);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_medicine ON sales(medicine_id);
CREATE INDEX idx_sales_customer ON sales(customer_name);
CREATE INDEX idx_low_stock_status ON low_stock_requests(status);
CREATE INDEX idx_suppliers_active ON suppliers(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medicines_updated_at BEFORE UPDATE ON medicines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_low_stock_requests_updated_at BEFORE UPDATE ON low_stock_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drug_substitutions_updated_at BEFORE UPDATE ON drug_substitutions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_supplier_medicines_updated_at BEFORE UPDATE ON supplier_medicines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data

-- Sample Users
INSERT INTO users (email, password_hash, full_name, role, phone) VALUES
('admin@pharm.com', '$2b$10$example_hash', 'Admin User', 'admin', '+91-9876543210'),
('manager@pharm.com', '$2b$10$example_hash', 'Manager User', 'manager', '+91-9876543211'),
('staff@pharm.com', '$2b$10$example_hash', 'Staff User', 'staff', '+91-9876543212');

-- Sample Suppliers
INSERT INTO suppliers (name, contact_person, email, phone, address, city, state, postal_code, rating) VALUES
('MediSupply Co.', 'Rajesh Kumar', 'contact@medisupply.com', '+91-9876543213', '123 Medical Street', 'Mumbai', 'Maharashtra', '400001', 4.5),
('PharmaCorp Ltd.', 'Priya Sharma', 'info@pharmacorp.com', '+91-9876543214', '456 Health Avenue', 'Delhi', 'Delhi', '110001', 4.2),
('HealthFirst Distributors', 'Amit Patel', 'sales@healthfirst.com', '+91-9876543215', '789 Wellness Road', 'Bangalore', 'Karnataka', '560001', 4.7),
('Global Pharma Solutions', 'Sunita Singh', 'orders@globalpharma.com', '+91-9876543216', '321 Medicine Plaza', 'Chennai', 'Tamil Nadu', '600001', 4.3),
('Indian Drug Company', 'Vikram Gupta', 'supply@indiandrug.com', '+91-9876543217', '654 Pharma Complex', 'Hyderabad', 'Telangana', '500001', 4.6);

-- Sample Medicines
INSERT INTO medicines (name, generic_name, brand, category, dosage_form, strength, unit_price, cost_price, quantity, min_stock_level, expiry_date, manufacturer, prescription_required) VALUES
('Paracetamol 500mg', 'Paracetamol', 'Crocin', 'Pain Relief', 'Tablet', '500mg', 5.00, 3.50, 500, 50, '2025-12-31', 'GSK', false),
('Amoxicillin 250mg', 'Amoxicillin', 'Amoxil', 'Antibiotics', 'Capsule', '250mg', 15.00, 10.00, 200, 30, '2025-06-30', 'Cipla', true),
('Cetirizine 10mg', 'Cetirizine', 'Zyrtec', 'Antihistamine', 'Tablet', '10mg', 8.00, 5.50, 300, 40, '2025-09-15', 'Dr. Reddy', false),
('Metformin 500mg', 'Metformin', 'Glucophage', 'Diabetes', 'Tablet', '500mg', 12.00, 8.00, 150, 25, '2025-11-20', 'Sun Pharma', true),
('Atorvastatin 20mg', 'Atorvastatin', 'Lipitor', 'Cardiac', 'Tablet', '20mg', 25.00, 18.00, 100, 20, '2025-08-10', 'Pfizer', true),
('Vitamin D3 60000 IU', 'Cholecalciferol', 'Calcirol', 'Vitamins', 'Capsule', '60000 IU', 35.00, 25.00, 80, 15, '2025-10-05', 'Cadila', false),
('Omeprazole 20mg', 'Omeprazole', 'Prilosec', 'Gastric', 'Capsule', '20mg', 18.00, 12.00, 120, 20, '2025-07-25', 'Lupin', true),
('Aspirin 75mg', 'Aspirin', 'Ecosprin', 'Cardiac', 'Tablet', '75mg', 6.00, 4.00, 400, 50, '2025-12-15', 'USV', false),
('Ibuprofen 400mg', 'Ibuprofen', 'Brufen', 'Pain Relief', 'Tablet', '400mg', 10.00, 7.00, 250, 35, '2025-09-30', 'Abbott', false),
('Azithromycin 500mg', 'Azithromycin', 'Zithromax', 'Antibiotics', 'Tablet', '500mg', 45.00, 32.00, 75, 15, '2025-05-20', 'Pfizer', true),
('Loratadine 10mg', 'Loratadine', 'Claritin', 'Antihistamine', 'Tablet', '10mg', 12.00, 8.50, 180, 25, '2025-08-18', 'Schering', false),
('Amlodipine 5mg', 'Amlodipine', 'Norvasc', 'Cardiac', 'Tablet', '5mg', 8.50, 6.00, 200, 30, '2025-11-12', 'Pfizer', true),
('Multivitamin', 'Mixed Vitamins', 'Revital', 'Vitamins', 'Tablet', 'Multi', 22.00, 16.00, 150, 25, '2025-10-28', 'Ranbaxy', false),
('Dolo 650mg', 'Paracetamol', 'Dolo', 'Pain Relief', 'Tablet', '650mg', 7.00, 5.00, 350, 45, '2025-12-20', 'Micro Labs', false),
('Cough Syrup', 'Dextromethorphan', 'Benadryl', 'Respiratory', 'Syrup', '100ml', 85.00, 65.00, 60, 10, '2025-06-15', 'Johnson & Johnson', false);

-- Sample Sales (last 30 days)
INSERT INTO sales (medicine_id, quantity, unit_price, total_price, discount_amount, tax_amount, final_amount, payment_method, customer_name, customer_phone, sale_date) 
SELECT 
    m.id,
    (RANDOM() * 5 + 1)::INTEGER,
    m.unit_price,
    (RANDOM() * 5 + 1)::INTEGER * m.unit_price,
    0,
    ((RANDOM() * 5 + 1)::INTEGER * m.unit_price * 0.18),
    ((RANDOM() * 5 + 1)::INTEGER * m.unit_price * 1.18),
    CASE (RANDOM() * 4)::INTEGER 
        WHEN 0 THEN 'cash'
        WHEN 1 THEN 'card'
        WHEN 2 THEN 'upi'
        ELSE 'insurance'
    END,
    CASE (RANDOM() * 10)::INTEGER 
        WHEN 0 THEN 'Rahul Sharma'
        WHEN 1 THEN 'Priya Patel'
        WHEN 2 THEN 'Amit Kumar'
        WHEN 3 THEN 'Sunita Singh'
        WHEN 4 THEN 'Vikram Gupta'
        WHEN 5 THEN 'Neha Agarwal'
        WHEN 6 THEN 'Ravi Verma'
        WHEN 7 THEN 'Kavita Joshi'
        WHEN 8 THEN 'Suresh Reddy'
        ELSE 'Anjali Mehta'
    END,
    '+91-' || (9000000000 + (RANDOM() * 999999999)::BIGINT)::TEXT,
    NOW() - (RANDOM() * INTERVAL '30 days')
FROM medicines m, generate_series(1, 3) -- 3 sales per medicine
WHERE m.quantity > 0;

-- Sample Low Stock Requests
INSERT INTO low_stock_requests (medicine_id, requested_quantity, current_stock, reason, priority, status)
SELECT 
    id,
    min_stock_level * 2,
    quantity,
    'Stock running low - need replenishment',
    CASE 
        WHEN quantity < min_stock_level / 2 THEN 'urgent'
        WHEN quantity < min_stock_level THEN 'high'
        ELSE 'medium'
    END,
    'pending'
FROM medicines 
WHERE quantity < min_stock_level * 1.5;

-- Sample Drug Substitutions
INSERT INTO drug_substitutions (original_medicine_id, substitute_medicine_id, reason, effectiveness_rating, cost_difference, is_recommended)
SELECT 
    m1.id,
    m2.id,
    'Generic alternative with similar efficacy',
    4.2 + (RANDOM() * 0.8),
    m1.unit_price - m2.unit_price,
    true
FROM medicines m1, medicines m2
WHERE m1.category = m2.category 
    AND m1.id != m2.id 
    AND m1.generic_name != m2.generic_name
LIMIT 10;

-- Link suppliers to medicines
INSERT INTO supplier_medicines (supplier_id, medicine_id, supplier_price, lead_time_days, minimum_order_quantity, is_preferred)
SELECT 
    s.id,
    m.id,
    m.cost_price * (0.8 + RANDOM() * 0.4), -- Price variation
    (3 + (RANDOM() * 10)::INTEGER), -- 3-13 days lead time
    (10 + (RANDOM() * 40)::INTEGER), -- 10-50 minimum order
    RANDOM() > 0.7 -- 30% chance of being preferred
FROM suppliers s
CROSS JOIN medicines m
WHERE RANDOM() > 0.6; -- 40% of all possible combinations

-- Update medicine quantities based on sales
UPDATE medicines 
SET quantity = quantity - (
    SELECT COALESCE(SUM(s.quantity), 0)
    FROM sales s 
    WHERE s.medicine_id = medicines.id
)
WHERE id IN (SELECT DISTINCT medicine_id FROM sales);

-- Ensure no negative quantities
UPDATE medicines SET quantity = 0 WHERE quantity < 0;

COMMIT;