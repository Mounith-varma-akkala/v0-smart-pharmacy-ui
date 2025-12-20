// Setup database tables and sample data
console.log('🚀 Setting up Supabase Database...\n')

console.log('📋 STEP 1: Create Tables in Supabase')
console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard')
console.log('2. Select your project: ltxmhawsjyjshnmtqgsx')
console.log('3. Open SQL Editor (left sidebar)')
console.log('4. Copy and paste the contents of: scripts/create-supabase-tables.sql')
console.log('5. Click "Run" to create all tables')
console.log('')

console.log('📊 STEP 2: Import Your Data')
console.log('After creating tables, you can:')
console.log('• Go to: http://localhost:3001/import-json-data')
console.log('• Or use: node scripts/import-json-to-supabase.js your-file.json sales')
console.log('')

console.log('✅ STEP 3: Verify Setup')
console.log('• Dashboard: http://localhost:3001/admin/dashboard')
console.log('• Test Connection: http://localhost:3001/api/test-connection')
console.log('')

console.log('🔧 Current Status:')
console.log('❌ Tables not created yet (run SQL script first)')
console.log('❌ No data imported yet')
console.log('')

console.log('💡 Quick Fix:')
console.log('1. Run the SQL script in Supabase')
console.log('2. Import your JSON data')
console.log('3. Refresh the dashboard')
console.log('')

console.log('🎯 The SQL script will create:')
console.log('• suppliers table')
console.log('• medicines table') 
console.log('• sales table')
console.log('• purchases table')
console.log('• low_stock_requests table')
console.log('• Sample data for testing')
console.log('')

console.log('📁 SQL Script Location: scripts/create-supabase-tables.sql')
console.log('📖 Full Guide: QUICK_SETUP_GUIDE.md')

async function testConnection() {
  try {
    const response = await fetch('http://localhost:3001/api/test-connection')
    const data = await response.json()
    
    if (data.success && data.data.medicinesCount > 0) {
      console.log('\n🎉 SUCCESS! Database is set up and has data!')
      console.log('✅ You can now use the dashboard with real-time data')
    } else {
      console.log('\n⚠️  Database connection works but no data found')
      console.log('💡 Run the SQL script and import data to see the dashboard working')
    }
  } catch (error) {
    console.log('\n❌ Cannot connect to app. Make sure it\'s running: npm run dev')
  }
}

testConnection()