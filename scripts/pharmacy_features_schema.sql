-- Smart Pharmacy Features Database Schema
-- This script creates all the necessary tables for the new features

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    lead_time_days INTEGER DEFAULT 7,
    reliability_rating DECIMAL(3,2) DEFAULT 0.00,
    price_trend VARCHAR(20) DEFAULT 'stable', -- 'up', 'down', 'stable'
    last_order_date TIMESTAMP,
    auto_reorder_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Supplier-Medicine mapping
CREATE TABLE IF NOT EXISTS supplier_medicines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE,
    medicine_name VARCHAR(255), -- Denormalized for easier queries
    unit_price DECIMAL(10,2),
    minimum_order_quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Supplier Orders for tracking performance
CREATE TABLE IF NOT EXISTS supplier_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    order_date TIMESTAMP DEFAULT NOW(),
    delivered_date TIMESTAMP,
    delivered_on_time BOOLEAN DEFAULT false,
    total_amount DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Inventory Batches for FEFO management
CREATE TABLE IF NOT EXISTS inventory_batches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE,
    batch_number VARCHAR(100) NOT NULL,
    expiry_date DATE NOT NULL,
    quantity INTEGER NOT NULL,
    cost_price DECIMAL(10,2),
    supplier_id UUID REFERENCES suppliers(id),
    received_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Drug Substitutes mapping
CREATE TABLE IF NOT EXISTS drug_substitutes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    original_medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE,
    substitute_medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE,
    equivalency_score INTEGER DEFAULT 0, -- 0-100 percentage
    notes TEXT,
    contraindications TEXT[], -- Array of contraindications
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Drug Substitution Logs for audit trail
CREATE TABLE IF NOT EXISTS drug_substitution_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    original_medicine_id UUID REFERENCES medicines(id),
    substitute_medicine_id UUID REFERENCES medicines(id),
    quantity INTEGER NOT NULL,
    pharmacist_confirmed BOOLEAN DEFAULT false,
    pharmacist_id VARCHAR(255),
    reason VARCHAR(255),
    substitution_date TIMESTAMP DEFAULT NOW(),
    notes TEXT
);

-- Low Stock Requests
CREATE TABLE IF NOT EXISTS low_stock_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE,
    requested_quantity INTEGER NOT NULL,
    reason TEXT NOT NULL,
    urgency VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    requested_by VARCHAR(255) NOT NULL,
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Supply Requests
CREATE TABLE IF NOT EXISTS supply_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    requested_by VARCHAR(255) NOT NULL,
    request_date TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'acknowledged', 'fulfilled'
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Purchase Orders (enhanced)
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2),
    total_amount DECIMAL(12,2),
    order_type VARCHAR(50) DEFAULT 'regular', -- 'regular', 'low_stock_replenishment', 'price_surge_prevention'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'cancelled'
    created_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs (enhanced)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    user_id VARCHAR(255),
    timestamp TIMESTAMP DEFAULT NOW(),
    details JSONB -- Store additional details as JSON
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_supplier_medicines_supplier_id ON supplier_medicines(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_medicines_medicine_id ON supplier_medicines(medicine_id);
CREATE INDEX IF NOT EXISTS idx_inventory_batches_medicine_id ON inventory_batches(medicine_id);
CREATE INDEX IF NOT EXISTS idx_inventory_batches_expiry_date ON inventory_batches(expiry_date);
CREATE INDEX IF NOT EXISTS idx_drug_substitutes_original_medicine_id ON drug_substitutes(original_medicine_id);
CREATE INDEX IF NOT EXISTS idx_low_stock_requests_status ON low_stock_requests(status);
CREATE INDEX IF NOT EXISTS idx_low_stock_requests_medicine_id ON low_stock_requests(medicine_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Add some sample data for testing
INSERT INTO suppliers (name, contact_person, email, phone, address, reliability_rating, price_trend) VALUES
('PharmaCorp Ltd', 'John Smith', 'john@pharmacorp.com', '+1-555-0101', '123 Medical St, Healthcare City', 4.5, 'stable'),
('MediSupply Inc', 'Sarah Johnson', 'sarah@medisupply.com', '+1-555-0102', '456 Pharma Ave, Medicine Town', 4.2, 'up'),
('HealthDistributors', 'Mike Wilson', 'mike@healthdist.com', '+1-555-0103', '789 Supply Rd, Wellness City', 3.8, 'down'),
('GlobalMeds Co', 'Lisa Brown', 'lisa@globalmeds.com', '+1-555-0104', '321 International Blvd, Pharma Hub', 4.7, 'stable'),
('QuickPharm Solutions', 'David Lee', 'david@quickpharm.com', '+1-555-0105', '654 Express Way, Fast City', 4.0, 'up');

-- Sample drug substitutes (assuming some medicines exist)
-- Note: These would need to be updated with actual medicine IDs from your medicines table
INSERT INTO drug_substitutes (original_medicine_id, substitute_medicine_id, equivalency_score, notes, contraindications) VALUES
-- These are placeholder UUIDs - replace with actual medicine IDs
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 95, 'Same active ingredient, different manufacturer', ARRAY['pregnancy', 'liver_disease']),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 88, 'Similar composition with minor differences', ARRAY['kidney_disease']),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440006', 92, 'Bioequivalent generic version', ARRAY[]);

-- Create a view for easy inventory with expiry information
CREATE OR REPLACE VIEW inventory_with_expiry AS
SELECT 
    i.*,
    m.name as medicine_name,
    ib.batch_number,
    ib.expiry_date,
    ib.cost_price,
    s.name as supplier_name,
    EXTRACT(DAYS FROM (ib.expiry_date - CURRENT_DATE)) as days_to_expiry,
    CASE 
        WHEN ib.expiry_date < CURRENT_DATE THEN 'expired'
        WHEN EXTRACT(DAYS FROM (ib.expiry_date - CURRENT_DATE)) <= 7 THEN 'critical'
        WHEN EXTRACT(DAYS FROM (ib.expiry_date - CURRENT_DATE)) <= 30 THEN 'warning'
        ELSE 'safe'
    END as expiry_status
FROM inventory i
JOIN medicines m ON i.medicine_id = m.id
LEFT JOIN inventory_batches ib ON i.medicine_id = ib.medicine_id
LEFT JOIN suppliers s ON ib.supplier_id = s.id
ORDER BY ib.expiry_date ASC;

-- Create a function to automatically update supplier reliability ratings
CREATE OR REPLACE FUNCTION update_supplier_reliability()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE suppliers 
    SET reliability_rating = (
        SELECT COALESCE(AVG(CASE WHEN delivered_on_time THEN 5.0 ELSE 2.0 END), 0)
        FROM supplier_orders 
        WHERE supplier_id = NEW.supplier_id
    )
    WHERE id = NEW.supplier_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update reliability ratings
DROP TRIGGER IF EXISTS trigger_update_supplier_reliability ON supplier_orders;
CREATE TRIGGER trigger_update_supplier_reliability
    AFTER INSERT OR UPDATE ON supplier_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_supplier_reliability();

-- Create a function for FEFO stock selection
CREATE OR REPLACE FUNCTION select_fefo_batches(
    p_medicine_id UUID,
    p_quantity_needed INTEGER
)
RETURNS TABLE(
    batch_id UUID,
    batch_number VARCHAR,
    available_quantity INTEGER,
    expiry_date DATE,
    cost_price DECIMAL
) AS $$
DECLARE
    remaining_quantity INTEGER := p_quantity_needed;
    batch_record RECORD;
BEGIN
    FOR batch_record IN 
        SELECT id, batch_number, quantity, expiry_date, cost_price
        FROM inventory_batches 
        WHERE medicine_id = p_medicine_id 
        AND quantity > 0
        ORDER BY expiry_date ASC
    LOOP
        IF remaining_quantity <= 0 THEN
            EXIT;
        END IF;
        
        batch_id := batch_record.id;
        batch_number := batch_record.batch_number;
        available_quantity := LEAST(batch_record.quantity, remaining_quantity);
        expiry_date := batch_record.expiry_date;
        cost_price := batch_record.cost_price;
        
        remaining_quantity := remaining_quantity - available_quantity;
        
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;