# 🔄 New Database Connection & Setup Guide

## ✅ **Database Connection Updated**

Your application is now connected to the new Supabase database:
- **Project URL**: `https://ltxmhawsjyjshnmtqgsx.supabase.co`
- **Status**: Connected and ready to use

## 🚀 **Quick Setup Steps**

### **Step 1: Setup Fresh Database**

1. **Open the setup page**: http://localhost:3001/setup-fresh-database
2. **Click "Create Fresh Database"**
3. **Wait for completion** (takes 10-30 seconds)

This will create:
- ✅ 10 medicines with realistic data
- ✅ 30+ sales records from last 30 days
- ✅ 3 suppliers with contact information
- ✅ All necessary database tables

### **Step 2: Verify Data**

1. **Check Admin Dashboard**: http://localhost:3001/admin/dashboard
   - Should show revenue metrics
   - Sales charts with real data
   - Inventory levels

2. **Check Sales Data**: http://localhost:3001/test-supabase-sales
   - Should display sales records
   - Can add more sample sales

## 📊 **What Data Will Be Created**

### **Medicines (10 items)**:
- Paracetamol 500mg - Pain Relief
- Amoxicillin 250mg - Antibiotics
- Cetirizine 10mg - Antihistamine
- Metformin 500mg - Diabetes
- Atorvastatin 20mg - Cardiac
- Vitamin D3 60000 IU - Vitamins
- Omeprazole 20mg - Gastric
- Aspirin 75mg - Cardiac
- Ibuprofen 400mg - Pain Relief
- Azithromycin 500mg - Antibiotics

### **Sales Records (30+)**:
- Random sales from last 30 days
- Multiple customers (Rahul, Priya, Amit, etc.)
- Various payment methods (cash, card, UPI, insurance)
- Realistic quantities and pricing

### **Suppliers (3)**:
- MediSupply Co. - Mumbai
- PharmaCorp Ltd. - Delhi
- HealthFirst Distributors - Bangalore

## 🔧 **Alternative Setup Methods**

### **Method 1: Using Supabase Dashboard (Manual)**

1. Go to your Supabase project: https://supabase.com/dashboard/project/ltxmhawsjyjshnmtqgsx
2. Navigate to **SQL Editor**
3. Copy the contents of `scripts/fresh-database-setup.sql`
4. Paste and run the SQL script
5. Verify tables in **Table Editor**

### **Method 2: Using API Endpoint**

```bash
# Using curl or Postman
POST http://localhost:3001/api/reset-database
```

## 🔍 **Verify Connection**

### **Test Database Connection**:

1. Open browser console (F12)
2. Go to http://localhost:3001/admin/dashboard
3. Check for any errors in console
4. Data should load within 2-3 seconds

### **Expected Results**:
- ✅ Dashboard shows real numbers (not zeros)
- ✅ Charts display with data
- ✅ No console errors
- ✅ Sales stats update in real-time

## 🛡️ **Security Recommendations**

### **Important Security Steps**:

1. **Enable Row Level Security (RLS)** in Supabase:
   ```sql
   -- Go to Supabase SQL Editor and run:
   ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
   ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
   ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
   
   -- Create policies for public access (adjust as needed)
   CREATE POLICY "Allow public read" ON medicines FOR SELECT USING (true);
   CREATE POLICY "Allow public read" ON sales FOR SELECT USING (true);
   CREATE POLICY "Allow public read" ON suppliers FOR SELECT USING (true);
   ```

2. **Rotate API Keys Regularly**:
   - Go to Project Settings → API
   - Click "Rotate" next to Anon key
   - Update `.env.local` with new key
   - Restart dev server

3. **Never Commit `.env.local`**:
   - Already in `.gitignore`
   - Double-check before pushing to GitHub

## 📱 **Access Points**

After setup, access your application at:

- **Admin Dashboard**: http://localhost:3001/admin/dashboard
- **Manager Dashboard**: http://localhost:3001/manager/dashboard
- **Fresh DB Setup**: http://localhost:3001/setup-fresh-database
- **Populate Data**: http://localhost:3001/populate-data
- **Test Sales**: http://localhost:3001/test-supabase-sales

## 🔄 **Data Management**

### **Add More Sample Data**:
1. Go to http://localhost:3001/test-supabase-sales
2. Click "Add Sample Sales"
3. Repeat as needed

### **Populate Additional Features**:
1. Go to http://localhost:3001/populate-data
2. Click "Populate All Features"
3. Wait for completion

### **Reset Database**:
1. Go to http://localhost:3001/setup-fresh-database
2. Click "Create Fresh Database"
3. All data will be replaced with fresh samples

## 🐛 **Troubleshooting**

### **Issue: No data showing**
- Wait 30 seconds for data to propagate
- Refresh browser page
- Check browser console for errors
- Verify Supabase project is active

### **Issue: Connection errors**
- Confirm `.env.local` has correct credentials
- Check internet connection
- Verify Supabase project is not paused
- Restart dev server: `npm run dev`

### **Issue: Permission denied**
- Enable RLS policies in Supabase
- Check API key is correct
- Verify project URL matches

### **Issue: Old data still showing**
- Clear browser cache
- Run fresh database setup again
- Check you're connected to correct database

## 📞 **Support**

If you encounter issues:
1. Check browser console (F12) for detailed errors
2. Verify Supabase dashboard shows tables created
3. Confirm environment variables are loaded
4. Try manual SQL setup method

## ✅ **Success Checklist**

- [ ] Environment variables updated in `.env.local`
- [ ] Dev server restarted successfully
- [ ] Fresh database setup completed
- [ ] Admin dashboard shows real data
- [ ] Sales charts display properly
- [ ] No console errors
- [ ] RLS policies configured (optional but recommended)

Your new database is ready to use! 🎉