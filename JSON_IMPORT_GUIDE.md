# 📊 JSON Data Import Guide for Supabase

## 🚀 **Quick Start**

1. **Access Import Page**: http://localhost:3001/import-json-data
2. **Select Data Type**: Choose from Sales, Medicines, Purchases, or Suppliers
3. **Paste JSON Data**: Copy your JSON array into the text area
4. **Click Import**: Wait for the import to complete

## 📋 **Supported Data Types**

### **1. Sales Data**
Import transaction records and sales history.

**Sample JSON Format:**
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
    "Customer_Name": "John Doe",
    "Customer_Phone": "+91-9876543210"
  },
  {
    "Transaction_ID": 2,
    "Date": "2025-12-02",
    "Drug_Name": "Ibuprofen",
    "Qty_Sold": 5,
    "Unit_Price": 6.00,
    "Total_Amount": 30.00,
    "Payment_Method": "card",
    "Customer_Name": "Jane Smith"
  }
]
```

**Supported Field Names:**
- `Transaction_ID`, `transaction_id`, `id`
- `Date`, `sale_date`, `date`
- `Drug_Name`, `medicine_name`, `drug`, `name`
- `Qty_Sold`, `quantity`, `qty`
- `Unit_Price`, `unit_price`, `price`
- `Total_Amount`, `total_price`, `amount`
- `Payment_Method`, `payment_method`
- `Customer_Name`, `customer_name`, `customer`
- `Customer_Phone`, `customer_phone`, `phone`

### **2. Medicines/Inventory**
Import drug information and stock levels.

**Sample JSON Format:**
```json
[
  {
    "Drug_Name": "Paracetamol 500mg",
    "Generic_Name": "Paracetamol",
    "Category": "Pain Relief",
    "Unit_Price": 5.00,
    "Cost_Price": 3.50,
    "Quantity": 100,
    "Min_Stock": 10,
    "Expiry_Date": "2025-12-31",
    "Manufacturer": "GSK",
    "Batch_Number": "PAR001"
  }
]
```

**Supported Field Names:**
- `Drug_Name`, `name`, `medicine_name`
- `Generic_Name`, `generic_name`
- `Category`, `category`
- `Unit_Price`, `unit_price`, `price`
- `Cost_Price`, `cost_price`, `cost`
- `Quantity`, `quantity`, `stock`
- `Min_Stock`, `min_stock_level`
- `Expiry_Date`, `expiry_date`
- `Manufacturer`, `manufacturer`
- `Batch_Number`, `batch_number`

### **3. Purchases**
Import purchase orders and update inventory.

**Sample JSON Format:**
```json
[
  {
    "Drug_Name": "Amoxicillin",
    "Quantity": 50,
    "Unit_Cost": 10.00,
    "Selling_Price": 15.00,
    "Supplier": "MediSupply Co.",
    "Expiry_Date": "2025-06-30",
    "Batch_Number": "AMX001"
  }
]
```

**Supported Field Names:**
- `Drug_Name`, `medicine_name`, `drug`
- `Quantity`, `quantity`
- `Unit_Cost`, `unit_cost`, `cost`
- `Selling_Price`, `selling_price`, `price`
- `Supplier`, `supplier`, `manufacturer`
- `Expiry_Date`, `expiry_date`
- `Batch_Number`, `batch_number`

### **4. Suppliers**
Import supplier contact information.

**Sample JSON Format:**
```json
[
  {
    "Supplier_Name": "MediSupply Co.",
    "Contact_Person": "Rajesh Kumar",
    "Email": "contact@medisupply.com",
    "Phone": "+91-9876543213",
    "Address": "123 Medical Street",
    "City": "Mumbai",
    "State": "Maharashtra",
    "Postal_Code": "400001"
  }
]
```

**Supported Field Names:**
- `Supplier_Name`, `name`, `supplier_name`
- `Contact_Person`, `contact_person`, `contact`
- `Email`, `email`
- `Phone`, `phone`, `contact_number`
- `Address`, `address`
- `City`, `city`
- `State`, `state`
- `Postal_Code`, `postal_code`, `zip`

## 🔧 **Import Methods**

### **Method 1: Web Interface (Recommended)**

1. **Go to Import Page**: http://localhost:3001/import-json-data
2. **Select Data Type**: Choose appropriate type
3. **Load Sample**: Click "Load Sample Format" to see example
4. **Paste Your Data**: Replace sample with your actual JSON
5. **Import**: Click "Import JSON Data"
6. **Verify**: Check results and visit dashboard

### **Method 2: Direct API Call**

```bash
curl -X POST http://localhost:3001/api/import-json \
  -H "Content-Type: application/json" \
  -d '{
    "jsonData": [{"Drug_Name": "Paracetamol", "Qty_Sold": 10}],
    "dataType": "sales"
  }'
```

### **Method 3: Command Line Script (Quick & Easy)**

Use the provided import script for quick imports:

```bash
# Make sure your app is running first
npm run dev

# In another terminal, import your JSON files:
node scripts/import-json-to-supabase.js sales.json sales
node scripts/import-json-to-supabase.js medicines.json medicines
node scripts/import-json-to-supabase.js purchases.json purchases
node scripts/import-json-to-supabase.js suppliers.json suppliers
```

**Script Features:**
- ✅ Validates JSON format before importing
- ✅ Shows progress and results
- ✅ Handles large files automatically
- ✅ Provides helpful error messages

### **Method 4: Custom Node.js Script**

Create your own `import-script.js`:

```javascript
const fs = require('fs')

async function importJsonFile(filePath, dataType) {
  const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  
  const response = await fetch('http://localhost:3001/api/import-json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonData, dataType })
  })
  
  const result = await response.json()
  console.log(result)
}

// Usage
importJsonFile('./sales.json', 'sales')
importJsonFile('./medicines.json', 'medicines')
```

## 📝 **Data Preparation Tips**

### **JSON Format Requirements**
- ✅ Must be a valid JSON array: `[{...}, {...}]`
- ✅ Each item must be an object: `{"field": "value"}`
- ❌ Not a single object: `{"field": "value"}`
- ❌ Not a string or other format

### **Field Name Flexibility**
- Field names are **case-insensitive**
- Multiple formats supported (e.g., `Drug_Name`, `drug_name`, `name`)
- Missing fields use default values
- Extra fields are ignored (won't cause errors)

### **Data Type Conversion**
- Numbers: Automatically parsed from strings
- Dates: Accepts various formats (YYYY-MM-DD, MM/DD/YYYY, etc.)
- Booleans: `true`, `false`, `1`, `0`, `"yes"`, `"no"`
- Text: Trimmed and cleaned automatically

## 🔍 **Validation & Error Handling**

### **Common Issues & Solutions**

**❌ "Invalid JSON format"**
- Check for missing commas, brackets, or quotes
- Use a JSON validator online
- Ensure proper escaping of special characters

**❌ "Medicine not found" (for sales)**
- Import medicines data first
- Or include `Medicine_ID` field in sales data
- System will try to match by drug name

**❌ "Duplicate entries"**
- System allows duplicates by design
- Use unique identifiers if needed
- Check existing data before importing

**❌ "Date format errors"**
- Use ISO format: `2025-12-31`
- Or common formats: `12/31/2025`, `31-Dec-2025`
- Invalid dates default to current date

## 📊 **After Import**

### **Verification Steps**
1. **Check Import Results**: Review success/error counts
2. **Visit Dashboard**: http://localhost:3001/admin/dashboard
3. **Test Connection**: http://localhost:3001/api/test-connection
4. **View Data**: Check specific pages for your data type

### **Dashboard Integration**
- **Sales Data**: Appears in revenue charts and metrics
- **Medicines**: Shows in inventory levels and stock alerts
- **Purchases**: Updates medicine quantities automatically
- **Suppliers**: Available in supplier management pages

## 🚀 **Advanced Usage**

### **Batch Processing Large Files**
For files with 1000+ records:

1. **Split into smaller chunks** (100-500 records each)
2. **Import sequentially** to avoid timeouts
3. **Monitor progress** through the web interface
4. **Verify each batch** before proceeding

### **Custom Field Mapping**
If your JSON has different field names:

1. **Rename fields** in your JSON to match supported names
2. **Or modify the import API** to handle your specific format
3. **Contact support** for custom field mapping

### **Data Migration Workflow**
1. **Backup existing data** (if any)
2. **Test with small sample** first
3. **Import in order**: Suppliers → Medicines → Purchases → Sales
4. **Verify relationships** between data types
5. **Check dashboard** for correct display

## 📞 **Support & Troubleshooting**

### **Getting Help**
- Check browser console (F12) for detailed errors
- Review import results for specific error messages
- Test with sample data first
- Verify JSON format with online validators

### **Common Solutions**
- **Large files**: Split into smaller chunks
- **Special characters**: Ensure proper UTF-8 encoding
- **Date issues**: Use ISO format (YYYY-MM-DD)
- **Missing relationships**: Import related data first

## ✅ **Success Checklist**

- [ ] JSON data is valid array format
- [ ] Data type selected correctly
- [ ] Field names match supported formats
- [ ] Import completed successfully
- [ ] Data appears in dashboard
- [ ] No console errors
- [ ] Relationships work correctly (sales → medicines)

Your JSON data is now ready to import into your Supabase pharmacy database! 🎉