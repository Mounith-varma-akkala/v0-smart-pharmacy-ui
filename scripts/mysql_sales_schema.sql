-- MySQL Sales Database Schema
-- Run this script in your MySQL database to create the required tables

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS pharmacy_sales;
USE pharmacy_sales;

-- Create medicines table (if you want to sync with Supabase or have local copy)
CREATE TABLE IF NOT EXISTS medicines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL,
    expiry_date DATE NOT NULL,
    reorder_level INT NOT NULL DEFAULT 10,
    supplier VARCHAR(255) NOT NULL,
    batch_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_category (category),
    INDEX idx_expiry (expiry_date)
);

-- Create sales table (main table for sales transactions)
CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_id INT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method ENUM('cash', 'card', 'upi', 'online', 'insurance') DEFAULT 'cash',
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_email VARCHAR(255),
    prescription_id VARCHAR(100),
    user_id VARCHAR(255), -- ID of the user who made the sale
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    status ENUM('completed', 'pending', 'cancelled', 'refunded') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE SET NULL,
    INDEX idx_sale_date (sale_date),
    INDEX idx_medicine_id (medicine_id),
    INDEX idx_customer_phone (customer_phone),
    INDEX idx_payment_method (payment_method),
    INDEX idx_status (status)
);

-- Create customers table (optional - for customer management)
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(255),
    address TEXT,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_email (email)
);

-- Create sales_items table (for detailed line items if needed)
CREATE TABLE IF NOT EXISTS sales_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    medicine_id INT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE SET NULL,
    INDEX idx_sale_id (sale_id),
    INDEX idx_medicine_id (medicine_id)
);

-- Create daily_sales_summary table (for faster reporting)
CREATE TABLE IF NOT EXISTS daily_sales_summary (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_date DATE NOT NULL UNIQUE,
    total_transactions INT DEFAULT 0,
    total_revenue DECIMAL(12, 2) DEFAULT 0,
    total_units_sold INT DEFAULT 0,
    unique_customers INT DEFAULT 0,
    cash_sales DECIMAL(12, 2) DEFAULT 0,
    card_sales DECIMAL(12, 2) DEFAULT 0,
    upi_sales DECIMAL(12, 2) DEFAULT 0,
    online_sales DECIMAL(12, 2) DEFAULT 0,
    insurance_sales DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sale_date (sale_date)
);

-- Insert sample data for testing
INSERT INTO medicines (name, category, quantity, price, expiry_date, reorder_level, supplier, batch_number) VALUES
('Paracetamol 500mg', 'Pain Relief', 500, 5.99, '2025-12-31', 50, 'Sun Pharma', 'BATCH001'),
('Amoxicillin 250mg', 'Antibiotics', 300, 12.50, '2025-06-30', 30, 'Cipla', 'BATCH002'),
('Ibuprofen 400mg', 'Pain Relief', 450, 8.99, '2025-09-15', 40, 'Apollo', 'BATCH003'),
('Metformin 500mg', 'Diabetes', 200, 15.00, '2025-03-20', 25, 'Mankind', 'BATCH004'),
('Omeprazole 20mg', 'Digestive', 350, 10.50, '2025-11-10', 35, 'Amazon Pharma', 'BATCH005');

-- Insert sample sales data
INSERT INTO sales (medicine_id, quantity, unit_price, total_price, payment_method, customer_name, customer_phone) VALUES
(1, 2, 5.99, 11.98, 'cash', 'John Doe', '9876543210'),
(2, 1, 12.50, 12.50, 'card', 'Jane Smith', '9876543211'),
(3, 3, 8.99, 26.97, 'upi', 'Bob Johnson', '9876543212'),
(1, 1, 5.99, 5.99, 'cash', 'Alice Brown', '9876543213'),
(4, 2, 15.00, 30.00, 'online', 'Charlie Wilson', '9876543214');

-- Create triggers to update daily summary
DELIMITER //

CREATE TRIGGER update_daily_summary_after_insert
AFTER INSERT ON sales
FOR EACH ROW
BEGIN
    INSERT INTO daily_sales_summary (
        sale_date, total_transactions, total_revenue, total_units_sold
    ) VALUES (
        DATE(NEW.sale_date), 1, NEW.total_price, NEW.quantity
    ) ON DUPLICATE KEY UPDATE
        total_transactions = total_transactions + 1,
        total_revenue = total_revenue + NEW.total_price,
        total_units_sold = total_units_sold + NEW.quantity,
        updated_at = CURRENT_TIMESTAMP;
END//

CREATE TRIGGER update_daily_summary_after_update
AFTER UPDATE ON sales
FOR EACH ROW
BEGIN
    -- Remove old values
    UPDATE daily_sales_summary 
    SET total_transactions = total_transactions - 1,
        total_revenue = total_revenue - OLD.total_price,
        total_units_sold = total_units_sold - OLD.quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE sale_date = DATE(OLD.sale_date);
    
    -- Add new values
    INSERT INTO daily_sales_summary (
        sale_date, total_transactions, total_revenue, total_units_sold
    ) VALUES (
        DATE(NEW.sale_date), 1, NEW.total_price, NEW.quantity
    ) ON DUPLICATE KEY UPDATE
        total_transactions = total_transactions + 1,
        total_revenue = total_revenue + NEW.total_price,
        total_units_sold = total_units_sold + NEW.quantity,
        updated_at = CURRENT_TIMESTAMP;
END//

DELIMITER ;

-- Create indexes for better performance
CREATE INDEX idx_sales_date_status ON sales(sale_date, status);
CREATE INDEX idx_sales_customer ON sales(customer_name, customer_phone);
CREATE INDEX idx_sales_payment_date ON sales(payment_method, sale_date);