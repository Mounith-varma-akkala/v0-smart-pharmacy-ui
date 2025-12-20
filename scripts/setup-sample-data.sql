-- Setup Sample Data for Smart Pharmacy Features
-- Run this script to ensure you have basic data for feature population

-- First, ensure we have some basic medicines if none exist
INSERT INTO medicines (name, composition, price, description, requires_prescription) 
SELECT * FROM (VALUES
  ('Paracetamol 500mg', 'Paracetamol 500mg', 25, 'Pain reliever and fever reducer', false),
  ('Amoxicillin 250mg', 'Amoxicillin 250mg', 85, 'Antibiotic for bacterial infections', true),
  ('Ibuprofen 400mg', 'Ibuprofen 400mg', 35, 'Anti-inflammatory pain reliever', false),
  ('Metformin 500mg', 'Metformin HCl 500mg', 45, 'Diabetes medication', true),
  ('Omeprazole 20mg', 'Omeprazole 20mg', 65, 'Proton pump inhibitor for acid reflux', true),
  ('Cetirizine 10mg', 'Cetirizine HCl 10mg', 15, 'Antihistamine for allergies', false),
  ('Atorvastatin 20mg', 'Atorvastatin 20mg', 125, 'Cholesterol-lowering medication', true),
  ('Aspirin 75mg', 'Acetylsalicylic Acid 75mg', 20, 'Blood thinner and pain reliever', false),
  ('Losartan 50mg', 'Losartan Potassium 50mg', 95, 'Blood pressure medication', true),
  ('Vitamin D3 1000IU', 'Cholecalciferol 1000IU', 30, 'Vitamin D supplement', false),
  ('Azithromycin 500mg', 'Azithromycin 500mg', 150, 'Antibiotic for respiratory infections', true),
  ('Pantoprazole 40mg', 'Pantoprazole 40mg', 75, 'Proton pump inhibitor', true),
  ('Clopidogrel 75mg', 'Clopidogrel 75mg', 180, 'Antiplatelet medication', true),
  ('Montelukast 10mg', 'Montelukast Sodium 10mg', 110, 'Asthma and allergy medication', true),
  ('Calcium Carbonate 500mg', 'Calcium Carbonate 500mg', 25, 'Calcium supplement', false)
) AS new_medicines(name, composition, price, description, requires_prescription)
WHERE NOT EXISTS (
  SELECT 1 FROM medicines WHERE medicines.name = new_medicines.name
);

-- Ensure we have some inventory records
INSERT INTO inventory (medicine_id, quantity, reorder_level, last_updated)
SELECT 
  m.id,
  FLOOR(RANDOM() * 200) + 50 as quantity,
  FLOOR(RANDOM() * 30) + 20 as reorder_level,
  NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 30) as last_updated
FROM medicines m
WHERE NOT EXISTS (
  SELECT 1 FROM inventory WHERE inventory.medicine_id = m.id
)
LIMIT 15;

-- Create some sample sales data for the last 3 months
INSERT INTO sales (medicine_id, quantity, unit_price, total_amount, sale_date, customer_name, prescription_required)
SELECT 
  m.id,
  FLOOR(RANDOM() * 10) + 1 as quantity,
  m.price,
  (FLOOR(RANDOM() * 10) + 1) * m.price as total_amount,
  NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 90) as sale_date,
  CASE FLOOR(RANDOM() * 5)
    WHEN 0 THEN 'John Smith'
    WHEN 1 THEN 'Sarah Johnson'
    WHEN 2 THEN 'Mike Wilson'
    WHEN 3 THEN 'Lisa Brown'
    ELSE 'David Lee'
  END as customer_name,
  m.requires_prescription
FROM medicines m
CROSS JOIN generate_series(1, 3) -- Create 3 sales records per medicine
WHERE EXISTS (SELECT 1 FROM inventory WHERE inventory.medicine_id = m.id)
ORDER BY RANDOM()
LIMIT 200;

-- Update inventory quantities based on sales
UPDATE inventory 
SET quantity = GREATEST(
  quantity - COALESCE((
    SELECT SUM(s.quantity) 
    FROM sales s 
    WHERE s.medicine_id = inventory.medicine_id
  ), 0),
  5 -- Minimum stock of 5
)
WHERE EXISTS (
  SELECT 1 FROM sales WHERE sales.medicine_id = inventory.medicine_id
);

-- Create some alerts for low stock items
INSERT INTO alerts (type, message, severity, is_read, created_at, medicine_id)
SELECT 
  'low_stock',
  'Low stock alert: ' || m.name || ' has only ' || i.quantity || ' units remaining',
  CASE 
    WHEN i.quantity <= 10 THEN 'high'
    WHEN i.quantity <= 20 THEN 'medium'
    ELSE 'low'
  END,
  false,
  NOW() - INTERVAL '1 hour' * FLOOR(RANDOM() * 24),
  m.id
FROM inventory i
JOIN medicines m ON i.medicine_id = m.id
WHERE i.quantity <= i.reorder_level
AND NOT EXISTS (
  SELECT 1 FROM alerts WHERE alerts.medicine_id = m.id AND alerts.type = 'low_stock'
);

-- Create some expiry alerts (we'll create these after batches are populated)
-- This will be handled by the populate-features API

-- Verify data creation
SELECT 
  'medicines' as table_name, 
  COUNT(*) as record_count 
FROM medicines
UNION ALL
SELECT 
  'inventory' as table_name, 
  COUNT(*) as record_count 
FROM inventory
UNION ALL
SELECT 
  'sales' as table_name, 
  COUNT(*) as record_count 
FROM sales
UNION ALL
SELECT 
  'alerts' as table_name, 
  COUNT(*) as record_count 
FROM alerts
ORDER BY table_name;