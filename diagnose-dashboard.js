// Diagnose dashboard data issues
async function diagnoseDashboard() {
  console.log('🔍 Diagnosing Dashboard Data Issues...\n')

  try {
    // 1. Test basic connection
    console.log('1️⃣ Testing database connection...')
    const connectionResponse = await fetch('http://localhost:3001/api/test-connection')
    const connectionData = await connectionResponse.json()
    
    if (connectionData.success) {
      console.log('✅ Database connection successful')
      console.log(`   Medicines count: ${connectionData.data.medicinesCount}`)
      console.log(`   Has medicines data: ${connectionData.data.hasData.medicines}`)
      console.log(`   Has sales data: ${connectionData.data.hasData.sales}`)
      console.log(`   Has suppliers data: ${connectionData.data.hasData.suppliers}`)
    } else {
      console.log('❌ Database connection failed:', connectionData.error)
      return
    }

    console.log('')

    // 2. Test sales stats API
    console.log('2️⃣ Testing sales stats API...')
    const statsResponse = await fetch('http://localhost:3001/api/sales/stats?period=today')
    const statsData = await statsResponse.json()
    
    if (statsData.success) {
      console.log('✅ Sales stats API working')
      console.log(`   Total transactions: ${statsData.data.summary.total_transactions}`)
      console.log(`   Total revenue: ₹${statsData.data.summary.total_revenue}`)
      console.log(`   Units sold: ${statsData.data.summary.total_units_sold}`)
      console.log(`   Top medicines count: ${statsData.data.topMedicines.length}`)
    } else {
      console.log('❌ Sales stats API failed:', statsData.error)
    }

    console.log('')

    // 3. Check if we have sample data
    if (connectionData.data.medicinesCount === 0) {
      console.log('⚠️  No medicines in database!')
      console.log('💡 Solution: Import sample data or your JSON files')
      console.log('   Option 1: Go to http://localhost:3001/import-json-data')
      console.log('   Option 2: Run the SQL script in Supabase to add sample data')
      console.log('   Option 3: Use the import script: node scripts/import-json-to-supabase.js')
    }

    if (!connectionData.data.hasData.sales) {
      console.log('⚠️  No sales data in database!')
      console.log('💡 Solution: Add some sales data')
      console.log('   Option 1: Import sales JSON data')
      console.log('   Option 2: Go to http://localhost:3001/test-supabase-sales to add test sales')
    }

    console.log('')

    // 4. Test dashboard page directly
    console.log('3️⃣ Dashboard should be available at:')
    console.log('   🔗 http://localhost:3001/admin/dashboard')
    console.log('   🔗 http://localhost:3001/ (main page)')

    console.log('')

    // 5. Recommendations
    console.log('🎯 Recommendations:')
    if (connectionData.data.medicinesCount === 0) {
      console.log('   1. First, create tables in Supabase using scripts/create-supabase-tables.sql')
      console.log('   2. Then import your JSON data or use sample data')
    } else {
      console.log('   1. ✅ Database has medicines data')
    }
    
    if (!connectionData.data.hasData.sales) {
      console.log('   2. Add sales data to see charts and analytics')
    } else {
      console.log('   2. ✅ Database has sales data')
    }

    console.log('   3. Check browser console (F12) for any JavaScript errors')
    console.log('   4. Ensure all components are loading properly')

  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message)
    console.log('\n💡 Make sure your app is running: npm run dev')
  }
}

diagnoseDashboard()