# Fresh Database Setup Guide

This guide will help you create a completely fresh database for the Pharm application with sample data.

## 🚀 Quick Setup (Recommended)

1. **Start the development server**:
   ```bash
   cd v0-smart-pharmacy-ui
   npm run dev
   ```

2. **Access the setup page**:
   - Go to: http://localhost:3001/setup-fresh-database
   - Click "Create Fresh Database"
   - Wait for the setup to complete

3. **Verify the setup**:
   - Visit: http://localhost:3001/admin/dashboard
   - You should see fresh data with charts and metrics

## 📊 What Gets Created

### Sample Data:
- **10 Medicines**: Paracetamol, Amoxicillin, Cetirizine, Metformin, etc.
- **30+ Sales Records**: Realistic sales data from the last 30 days
- **3 Suppliers**: MediSupply Co., PharmaCorp Ltd., HealthFirst Distributors
- **Multiple Categories**: Pain Relief, Antibiotics, Cardiac, Diabetes, Vitamins

### Database Tables:
- `medicines` - Medicine inventory with pricing and stock levels
- `sales` - Sales transactions with customer and payment details
- `suppliers` - Supplier information and contact details
- `users` - Sample user accounts (admin, manager, staff)
- `low_stock_requests` - Sample stock requests for workflow testing

## 🔧 Manual Setup Options

### Option 1: New Supabase Project

1. **Create new project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy the Project URL and Anon Key

2. **Update environment**:
   ```env
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=https://your-new-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key
   ```

3. **Run setup**:
   - Restart dev server: `npm run dev`
   - Go to: http://localhost:3001/setup-fresh-database
   - Click "Create Fresh Database"

### Option 2: SQL Script

1. **Using Supabase Dashboard**:
   - Go to your Supabase project → SQL Editor
   - Copy contents of `scripts/fresh-database-setup.sql`
   - Paste and run the script

2. **Using CLI**:
   ```bash
   # If you have Supabase CLI installed
   supabase db reset
   supabase db push
   ```

## 🎯 Testing the Setup

After setup, test these features:

1. **Admin Dashboard**: http://localhost:3001/admin/dashboard
   - Should show revenue metrics
   - Sales charts with real data
   - Inventory levels and expiry information

2. **Sales Integration**: http://localhost:3001/test-supabase-sales
   - Should display sales records
   - Add sample sales functionality should work

3. **Populate Data**: http://localhost:3001/populate-data
   - Should show database readiness
   - Can add additional feature data

## 🔍 Verification Checklist

✅ **Dashboard shows real data** (not zeros)  
✅ **Sales charts display properly**  
✅ **Medicine inventory has stock levels**  
✅ **Supplier information is populated**  
✅ **No console errors in browser**  

## 🛠️ Troubleshooting

### Common Issues:

**"No data showing"**
- Wait 30 seconds for data to propagate
- Refresh the browser page
- Check browser console for errors

**"Connection failed"**
- Verify `.env.local` has correct Supabase credentials
- Check that Supabase project is active (not paused)
- Confirm internet connection

**"Permission denied"**
- Make sure RLS (Row Level Security) is disabled during setup
- Use the correct anon key from Supabase dashboard

**"Table already exists"**
- This is normal - the system will clear existing data
- If issues persist, try creating a new Supabase project

### Getting Help:

1. Check browser console (F12) for detailed errors
2. Verify your Supabase project is active
3. Confirm `.env.local` file has the correct values
4. Try the manual SQL script approach if automatic setup fails

## 🎉 Next Steps

After successful setup:

1. **Explore the Admin Dashboard** - See all your fresh data visualized
2. **Test Sales Features** - Add new sales and watch metrics update
3. **Add More Data** - Use the Populate Data page for additional features
4. **Customize** - Modify the sample data to match your needs

Your fresh Pharm database is ready to use! 🚀