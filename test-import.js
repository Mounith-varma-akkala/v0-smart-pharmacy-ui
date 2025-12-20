// Quick test script to verify JSON import functionality
const testData = {
  sales: [
    {
      "Transaction_ID": 1,
      "Date": "2025-12-20",
      "Drug_Name": "Paracetamol",
      "Qty_Sold": 5,
      "Unit_Price": 10.00,
      "Total_Amount": 50.00,
      "Payment_Method": "cash",
      "Customer_Name": "Test Customer"
    }
  ],
  medicines: [
    {
      "Drug_Name": "Test Medicine",
      "Generic_Name": "Test Generic",
      "Category": "Test Category",
      "Unit_Price": 15.00,
      "Cost_Price": 10.00,
      "Quantity": 100,
      "Expiry_Date": "2025-12-31",
      "Manufacturer": "Test Pharma"
    }
  ]
}

async function testImport(dataType) {
  try {
    console.log(`Testing ${dataType} import...`)
    
    const response = await fetch('http://localhost:3001/api/import-json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonData: testData[dataType],
        dataType: dataType
      })
    })

    const result = await response.json()
    console.log(`${dataType} result:`, result)
    return result.success
  } catch (error) {
    console.error(`${dataType} error:`, error.message)
    return false
  }
}

async function runTests() {
  console.log('🧪 Testing JSON Import Functionality...\n')
  
  // Test medicines first (needed for sales)
  const medicinesSuccess = await testImport('medicines')
  console.log('')
  
  // Then test sales
  const salesSuccess = await testImport('sales')
  console.log('')
  
  if (medicinesSuccess && salesSuccess) {
    console.log('✅ All tests passed! Import functionality is working.')
    console.log('🎉 You can now import your JSON files!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Go to: http://localhost:3001/import-json-data')
    console.log('2. Or use: node scripts/import-json-to-supabase.js your-file.json sales')
  } else {
    console.log('❌ Some tests failed. Check the errors above.')
  }
}

runTests()