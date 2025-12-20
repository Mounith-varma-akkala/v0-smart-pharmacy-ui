# 🗄️ Supabase Database Setup Guide

Your Smart Pharmacy application is now configured to use **Supabase** as the database backend. Here's everything you need to know:

## 🔧 **Current Configuration**

### **Environment Variables** (`.env.local`)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://ltxmhawsjyjshnmtqgsx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Database Connection**
- **Client**: `lib/supabase/client.ts` - Browser-side connection
- **Server**: `lib/supabase/server.ts` - Server-side connection
- **Proxy**: `lib/supabase/proxy.ts` - Proxy configuration

## 📊 **Database Tables**

Your Supabase database should have these tables:

### **1. medicines**
```sql
- id (uuid, primary key)
- name (text)
- generic_name (text)
- brand (text)
- category (text)
- dosage_form (text)
- strength (text)
- unit_price (decimal)
- cost_price (decimal)
- quantity (integer)
- min_stock_level (integer)
- max_stock_level (integer)
- batch_number (text)
- expiry_date (date)
- manufacturer (text)
- prescription_required (boolean)
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

### **2. sales**
```sql
- id (uuid, primary key)
- medicine_id (uuid, foreign key)
- quantity (integer)
- unit_price (decimal)
- total_price (decimal)
- payment_method (text)
- customer_name (text)
- customer_phone (text)
- sale_date (timestamp)
- discount_amount (decimal)
- tax_amount (decimal)
- final_amount (decimal)
- status (text)
- created_at (timestamp)
```

### **3. suppliers**
```sql
- id (uuid, primary key)
- name (text)
- contact_person (text)
- email (text)
- phone (text)
- address (text)
- city (text)
- state (text)
- postal_code (text)
- country (text)
- rating (decimal)
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

### **4. purchases** (Optional)
```sql
- id (uuid, primary key)
- medicine_id (uuid, foreign key)
- supplier_id (uuid, foreign key)
- quantity (integer)
- unit_cost (decimal)
- total_cost (decimal)
- purchase_date (timestamp)
- batch_number (text)
- expiry_date (date)
- status (text)
- created_at (timestamp)
```

## 🚀 **How to Import Your JSON Data**

### **Step 1: Start the Application**
```bash
cd v0-smart-pharmacy-ui
npm run dev
```

### **Step 2: Choose Your Import Method**

#### **Option A: Web Interface (Easiest)**
1. Go to: http://localhost:3001/import-json-data
2. Select data type (sales, medicines, purchases, suppliers)
3. Paste your JSON data
4. Click "Import JSON Data"

#### **Option B: Command Line Script**
```bash
# Import your JSON files directly
node scripts/import-json-to-supabase.js your-sales-data.json sales
node scripts/import-json-to-supabase.js your-medicines-data.json medicines
node scripts/import-json-to-supabase.js your-purchases-data.json purchases
```

#### **Option C: API Call**
```bash
curl -X POST http://localhost:3001/api/import-json \
  -H "Content-Type: application/json" \
  -d '{
    "jsonData": [...your JSON array...],
    "dataType": "sales"
  }'
```

## 📋 **JSON Format Examples**

### **Sales Data**
```json
[
  {
    "Transaction_ID": 1,
    "Date": "2025-12-01",
    "Drug_Name": "Paracetamol",
    "Qty_Sold": 10,
    "Unit_Price": 5.00,
    "Total_Amount": 50.00,
    "Payment_Method": "cash",
    "Customer_Name": "John Doe"
  }
]
```

### **Medicines Data**
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

### **Purchases Data**
```json
[
  {
    "Drug_Name": "Amoxicillin",
    "Quantity": 50,
    "Unit_Cost": 10.00,
    "Supplier": "MediSupply Co.",
    "Expiry_Date": "2025-06-30"
  }
]
```

## ✅ **Verification Steps**

After importing your data:

1. **Check Dashboard**: http://localhost:3001/admin/dashboard
2. **Test Connection**: http://localhost:3001/api/test-connection
3. **View Sales Data**: http://localhost:3001/test-supabase-sales
4. **Check Import Results**: Look for success/error messages

## 🔍 **Troubleshooting**

### **Common Issues**

**❌ "Cannot connect to Supabase"**
- Check your internet connection
- Verify SUPABASE_URL and ANON_KEY in `.env.local`
- Make sure Supabase project is active

**❌ "Table doesn't exist"**
- Create tables in Supabase dashboard
- Or use the setup scripts provided
- Check table names match exactly

**❌ "Permission denied"**
- Enable Row Level Security (RLS) in Supabase
- Add appropriate policies for your tables
- Check ANON_KEY permissions

**❌ "JSON import fails"**
- Validate JSON format first
- Check field names match supported formats
- Try with smaller data chunks

### **Database Setup**

If tables don't exist, create them in Supabase:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the table creation scripts
4. Enable RLS and add policies

## 🎉 **Success!**

Once your data is imported:

- ✅ **Dashboard** shows your pharmacy metrics
- ✅ **Sales data** appears in charts and reports
- ✅ **Inventory** reflects current stock levels
- ✅ **Suppliers** are available for management
- ✅ **Real-time updates** work automatically

Your Smart Pharmacy is now powered by Supabase! 🚀

## 📞 **Need Help?**

- Check the detailed **JSON_IMPORT_GUIDE.md** for more examples
- Use the web interface at http://localhost:3001/import-json-data
- Test with sample data first before importing large files
- Monitor the browser console for detailed error messages

Happy importing! 🎊