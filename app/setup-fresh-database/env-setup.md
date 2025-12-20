# Environment Setup for Fresh Database

## Option 1: Use Existing Supabase Project

If you want to keep your current Supabase project but reset the data:

1. Go to http://localhost:3001/setup-fresh-database
2. Click "Create Fresh Database" 
3. This will clear existing data and create fresh sample data

## Option 2: Create New Supabase Project

### Step 1: Create New Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `pharm-fresh-db` (or any name you prefer)
   - Database Password: Create a strong password
   - Region: Choose closest to your location
6. Click "Create new project"
7. Wait for the project to be created (2-3 minutes)

### Step 2: Get Project Credentials
1. In your new project dashboard, go to Settings → API
2. Copy the following values:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### Step 3: Update Environment File
1. Open `v0-smart-pharmacy-ui/.env.local`
2. Replace the values:

```env
# Supabase Configuration (replace with your new project values)
NEXT_PUBLIC_SUPABASE_URL=https://your-new-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key-here

# MySQL Configuration (optional - can be ignored)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=pharmacy_sales
```

### Step 4: Setup Database Schema
1. Restart your development server: `npm run dev`
2. Go to http://localhost:3001/setup-fresh-database
3. Click "Create Fresh Database"
4. Wait for the setup to complete

### Step 5: Verify Setup
1. Go to http://localhost:3001/admin/dashboard
2. You should see fresh data with:
   - 10 medicines in inventory
   - 30+ sales records
   - 3 suppliers
   - Real charts and metrics

## Option 3: Manual Database Setup

If the automatic setup doesn't work:

### Using Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `scripts/fresh-database-setup.sql`
4. Paste and run the SQL script
5. Check Table Editor to verify tables were created

### Sample Data Verification
After setup, you should have:
- **Medicines**: Paracetamol, Amoxicillin, Cetirizine, Metformin, etc.
- **Sales**: 30+ sales records from the last 30 days
- **Suppliers**: MediSupply Co., PharmaCorp Ltd., HealthFirst Distributors
- **Categories**: Pain Relief, Antibiotics, Cardiac, Diabetes, Vitamins

## Troubleshooting

### Common Issues:

1. **"Table already exists" error**
   - This is normal, the system will clear existing data

2. **"Permission denied" error**
   - Make sure you're using the correct Supabase URL and anon key
   - Check that RLS (Row Level Security) is disabled for setup

3. **"Connection failed" error**
   - Verify your internet connection
   - Check that the Supabase project is active
   - Confirm the project URL is correct

4. **No data showing in dashboard**
   - Wait a few seconds for the data to propagate
   - Refresh the page
   - Check browser console for errors

### Getting Help:
- Check the browser console (F12) for detailed error messages
- Verify your `.env.local` file has the correct values
- Make sure your Supabase project is active and not paused