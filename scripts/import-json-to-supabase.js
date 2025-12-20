#!/usr/bin/env node

/**
 * Direct JSON Import Script for Supabase
 * 
 * This script allows you to import JSON files directly into your Supabase database
 * without using the web interface.
 * 
 * Usage:
 *   node scripts/import-json-to-supabase.js <json-file-path> <data-type>
 * 
 * Examples:
 *   node scripts/import-json-to-supabase.js sales.json sales
 *   node scripts/import-json-to-supabase.js medicines.json medicines
 *   node scripts/import-json-to-supabase.js purchases.json purchases
 *   node scripts/import-json-to-supabase.js suppliers.json suppliers
 */

const fs = require('fs')
const path = require('path')

// Get command line arguments
const args = process.argv.slice(2)
const jsonFilePath = args[0]
const dataType = args[1]

if (!jsonFilePath || !dataType) {
  console.log('❌ Usage: node scripts/import-json-to-supabase.js <json-file-path> <data-type>')
  console.log('')
  console.log('📋 Supported data types:')
  console.log('  • sales      - Transaction records')
  console.log('  • medicines  - Drug inventory')
  console.log('  • purchases  - Purchase orders')
  console.log('  • suppliers  - Supplier information')
  console.log('')
  console.log('📁 Example:')
  console.log('  node scripts/import-json-to-supabase.js my-sales-data.json sales')
  process.exit(1)
}

// Validate data type
const validTypes = ['sales', 'medicines', 'purchases', 'suppliers']
if (!validTypes.includes(dataType)) {
  console.log(`❌ Invalid data type: ${dataType}`)
  console.log(`✅ Valid types: ${validTypes.join(', ')}`)
  process.exit(1)
}

// Check if file exists
if (!fs.existsSync(jsonFilePath)) {
  console.log(`❌ File not found: ${jsonFilePath}`)
  process.exit(1)
}

async function importJsonData() {
  try {
    console.log('🚀 Starting JSON import...')
    console.log(`📁 File: ${jsonFilePath}`)
    console.log(`📊 Type: ${dataType}`)
    console.log('')

    // Read and parse JSON file
    console.log('📖 Reading JSON file...')
    const jsonContent = fs.readFileSync(jsonFilePath, 'utf8')
    const jsonData = JSON.parse(jsonContent)

    if (!Array.isArray(jsonData)) {
      console.log('❌ JSON data must be an array of objects')
      process.exit(1)
    }

    console.log(`✅ Found ${jsonData.length} records`)
    console.log('')

    // Make API call to import endpoint
    console.log('🔄 Importing to Supabase...')
    const response = await fetch('http://localhost:3001/api/import-json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonData: jsonData,
        dataType: dataType
      })
    })

    const result = await response.json()

    if (result.success) {
      console.log('🎉 Import completed successfully!')
      console.log('')
      console.log('📊 Results:')
      console.log(`  • Total Records: ${result.details.totalRecords}`)
      console.log(`  • Successful: ${result.details.successCount}`)
      console.log(`  • Failed: ${result.details.errorCount}`)
      console.log('')
      
      if (result.details.errorCount > 0) {
        console.log('⚠️  Some records failed to import. Check the web interface for details.')
      }

      console.log('🔗 Next steps:')
      console.log('  • View Dashboard: http://localhost:3001/admin/dashboard')
      console.log('  • Test Sales: http://localhost:3001/test-supabase-sales')
      console.log('  • Import More: http://localhost:3001/import-json-data')
    } else {
      console.log('❌ Import failed:')
      console.log(`   ${result.error}`)
      
      if (result.details) {
        console.log('')
        console.log('📊 Partial Results:')
        console.log(`  • Total Records: ${result.details.totalRecords}`)
        console.log(`  • Successful: ${result.details.successCount}`)
        console.log(`  • Failed: ${result.details.errorCount}`)
      }
    }

  } catch (error) {
    if (error instanceof SyntaxError) {
      console.log('❌ Invalid JSON format in file')
      console.log('💡 Tip: Use a JSON validator to check your file')
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Cannot connect to the application')
      console.log('💡 Make sure your Next.js app is running on http://localhost:3001')
      console.log('   Run: npm run dev')
    } else {
      console.log('❌ Error:', error.message)
    }
    process.exit(1)
  }
}

// Check if we're in a Node.js environment with fetch
if (typeof fetch === 'undefined') {
  // For Node.js versions without fetch, we need to install node-fetch
  console.log('⚠️  This script requires Node.js 18+ or the node-fetch package')
  console.log('💡 Install with: npm install node-fetch')
  console.log('   Or use Node.js 18+')
  process.exit(1)
}

// Run the import
importJsonData()