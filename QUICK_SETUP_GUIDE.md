# 🚀 Quick Setup Guide - Import JSON to Supabase

## Step 1: Create Database Tables

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `ltxmhawsjyjshnmtqgsx`
3. **Open SQL Editor** (left sidebar)
4. **Copy and paste** the contents of `scripts/create-supabase-tables.sql`
5. **Click "Run"** to create all tables

## Step 2: Import Your JSON Data

### Option A: Web Interface (Easiest)
1. **Start the app**: `npm run dev`
2. **Go to**: http://localhost:3001/import-json-data
3. **Select data type** and **paste your JSON**
4. **Click Import**

### Option B: Command Line
```bash
# Make sure app is running first
npm run dev

# In another terminal:
node scripts/import-json-to-supabase.js your-sales.json sales
node scripts/import-json-to-supabase.js your-medicines.json medicines
node scripts/import-json-to-supabase.js your-purchases.json purchases
```

## Step 3: Verify Import

1. **Check Dashboard**: http://localhost:3001/admin/dashboard
2. **Test Connection**: http://localhost:3001/api/test-connection
3. **View Sales**: http://localhost:3001/test-supabase-sales

## 📋 Your JSON Format Examples

### Sales Data
```json
[
  {
    "Transaction_ID": 1,
    "Date": "2025-12-20",
    "Drug_Name": "Paracetamol",
    "Qty_Sold": 10,
    "Unit_Price": 5.00,
    "Total_Amount": 50.00,
    "Payment_Method": "cash",
    "Customer_Name": "John Doe"
  }
]
```

### Medicines Data
```json
[
  {
    "Drug_Name": "Paracetamol 500mg",
    "Generic_Name": "Paracetamol",
    "Category": "Pain Relief",
    "Unit_Price": 5.00,
    "Cost_Price": 3.50,
    "Quantity": 100,
    "Expiry_Date": "2025-12-31",
    "Manufacturer": "GSK"
  }
]
```

### Purchases Data
```json
[
  {
    "Purchase_ID": "PO-1001",
    "Date_Received": "2023-01-01",
    "Drug_Name": "Dolo 650",
    "Supplier_Name": "Apollo Supply Chain",
    "Qty_Received": 789,
    "Unit_Cost_Price": 23.17,
    "Expiry_Date": "2024-12-31"
  }
]
```

## ✅ That's It!

Your JSON data will be imported into Supabase and your Smart Pharmacy dashboard will show all the data with charts, analytics, and management features.

## 🔧 Troubleshooting

**❌ "Table doesn't exist"**
- Run the SQL script in Supabase first

**❌ "Permission denied"**
- Tables are created with proper RLS policies

**❌ "Invalid JSON"**
- Use a JSON validator to check your format

**❌ "Connection failed"**
- Check your `.env.local` file has correct Supabase credentials

## 🎉 Success!

Once imported, you'll have:
- ✅ Real-time dashboard with charts
- ✅ Inventory management
- ✅ Sales tracking
- ✅ Low stock alerts
- ✅ Supplier management
- ✅ Analytics and forecasting

Happy importing! 🚀