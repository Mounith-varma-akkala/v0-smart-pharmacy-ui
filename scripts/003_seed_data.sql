-- Seed medicines data
INSERT INTO public.medicines (name, category, quantity, price, expiry_date, reorder_level, supplier, batch_number) VALUES
('Paracetamol 500mg', 'Pain Relief', 500, 5.99, '2025-12-31', 50, 'Sun Pharma', 'BATCH001'),
('Amoxicillin 250mg', 'Antibiotics', 300, 12.50, '2025-06-30', 30, 'Cipla', 'BATCH002'),
('Ibuprofen 400mg', 'Pain Relief', 450, 8.99, '2025-09-15', 40, 'Apollo', 'BATCH003'),
('Metformin 500mg', 'Diabetes', 200, 15.00, '2025-03-20', 25, 'Mankind', 'BATCH004'),
('Omeprazole 20mg', 'Digestive', 350, 10.50, '2025-11-10', 35, 'Amazon Pharma', 'BATCH005'),
('Aspirin 75mg', 'Cardiovascular', 600, 4.50, '2026-01-25', 60, 'Sun Pharma', 'BATCH006'),
('Cetirizine 10mg', 'Allergy', 400, 6.75, '2025-08-05', 45, 'Cipla', 'BATCH007'),
('Atorvastatin 10mg', 'Cholesterol', 250, 18.00, '2025-04-18', 30, 'Apollo', 'BATCH008'),
('Salbutamol Inhaler', 'Respiratory', 150, 25.00, '2025-10-30', 20, 'Mankind', 'BATCH009'),
('Losartan 50mg', 'Blood Pressure', 280, 14.50, '2025-07-22', 28, 'Amazon Pharma', 'BATCH010');

-- Seed alerts
INSERT INTO public.alerts (title, message, priority, type) VALUES
('Low Stock Alert', 'Metformin 500mg is running low. Current stock: 200 units', 'high', 'stock'),
('Expiry Warning', 'Metformin 500mg expires in 90 days', 'medium', 'expiry'),
('Critical Stock', 'Salbutamol Inhaler below reorder level', 'critical', 'stock'),
('Price Update', 'New competitive pricing available for Paracetamol', 'low', 'price');

-- Seed price comparisons
INSERT INTO public.price_comparisons (medicine_name, supplier, supplier_price, selling_price, discount, is_best_deal) VALUES
('Paracetamol 500mg', 'Sun Pharma', 4.50, 5.99, 10.00, TRUE),
('Paracetamol 500mg', 'Apollo', 5.00, 6.50, 8.00, FALSE),
('Paracetamol 500mg', 'Cipla', 4.80, 6.20, 9.00, FALSE),
('Amoxicillin 250mg', 'Cipla', 10.00, 12.50, 12.00, TRUE),
('Amoxicillin 250mg', 'Mankind', 11.00, 13.50, 10.00, FALSE),
('Ibuprofen 400mg', 'Apollo', 7.50, 8.99, 15.00, TRUE),
('Ibuprofen 400mg', 'Amazon Pharma', 8.00, 9.50, 12.00, FALSE);

-- Seed demand forecasts
INSERT INTO public.demand_forecasts (medicine_id, predicted_demand, confidence_level, forecast_date, reasoning)
SELECT 
  id,
  CASE 
    WHEN name LIKE '%Paracetamol%' THEN 150
    WHEN name LIKE '%Amoxicillin%' THEN 80
    WHEN name LIKE '%Ibuprofen%' THEN 120
    ELSE 50
  END,
  85.5,
  CURRENT_DATE + INTERVAL '30 days',
  'Seasonal trend analysis and historical data'
FROM public.medicines
LIMIT 5;
