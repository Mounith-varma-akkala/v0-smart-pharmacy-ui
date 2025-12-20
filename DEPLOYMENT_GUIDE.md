# Deployment Guide

This guide helps you deploy the pharmacy application successfully.

## 🚀 **Quick Deployment Fix**

### **1. Environment Variables Setup**

Create a `.env.local` file (for local development) or set environment variables in your deployment platform:

```env
# Required: Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ltxmhawsjyjshnmtqgsx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key_here

# Optional: MySQL Configuration (not needed if using only Supabase)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=pharmacy_sales
```

### **2. Get Your Supabase Keys**

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/ltxmhawsjyjshnmtqgsx
2. Go to **Settings** → **API**
3. Copy the **anon/public** key
4. Replace `your_actual_supabase_anon_key_here` with your actual key

### **3. Platform-Specific Deployment**

#### **Vercel Deployment:**
```bash
# Set environment variables in Vercel dashboard or via CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Deploy
vercel --prod
```

#### **Netlify Deployment:**
1. Go to Site Settings → Environment Variables
2. Add the environment variables
3. Redeploy the site

#### **Other Platforms:**
Set the environment variables in your platform's configuration panel.

## 🔧 **Common Deployment Issues & Fixes**

### **Issue 1: "Invalid supabaseUrl" Error**
**Fix:** Ensure `NEXT_PUBLIC_SUPABASE_URL` is set to a valid HTTPS URL:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ltxmhawsjyjshnmtqgsx.supabase.co
```

### **Issue 2: MySQL Connection Errors**
**Fix:** The app now uses Supabase by default. MySQL is optional and disabled in production.

### **Issue 3: Build Errors**
**Fix:** Run these commands to check for issues:
```bash
npm run build
npm run start
```

### **Issue 4: Missing Environment Variables**
**Fix:** Ensure all required environment variables are set in your deployment platform.

## 📋 **Pre-Deployment Checklist**

- [ ] ✅ Supabase URL is set correctly
- [ ] ✅ Supabase anon key is set correctly
- [ ] ✅ Environment variables are configured in deployment platform
- [ ] ✅ Build passes locally (`npm run build`)
- [ ] ✅ No TypeScript errors
- [ ] ✅ All dependencies are installed

## 🧪 **Testing After Deployment**

1. **Visit your deployed URL**
2. **Check the dashboards** - Admin and Manager dashboards should load
3. **Test the chatbot** - Click the floating bot button
4. **Check sales data** - Visit `/test-supabase-sales` to verify data connection
5. **Test API endpoints** - Visit `/api/chatbot` (should return method not allowed for GET)

## 🔐 **Security Notes**

- Never commit `.env.local` to version control
- Use environment variables for all sensitive data
- Supabase keys are safe to expose on the client side (they're designed for it)
- The chatbot webhook URL is public (this is intentional)

## 📞 **Support**

If deployment still fails:

1. **Check the build logs** for specific error messages
2. **Verify environment variables** are set correctly
3. **Test locally first** with `npm run build && npm run start`
4. **Check Supabase connection** by visiting your Supabase dashboard

## 🎯 **Quick Test Commands**

```bash
# Test build locally
npm run build

# Test production build locally
npm run start

# Check for TypeScript errors
npx tsc --noEmit

# Test environment variables
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

Your pharmacy application should now deploy successfully! 🎉