// Check actual Supabase table schema
async function checkSchema() {
  try {
    console.log('🔍 Checking Supabase table schema...\n')
    
    // Try to insert a minimal record to see what columns are required
    const testMedicine = {
      name: 'Test Medicine',
      category: 'Test',
      unit_price: 10,
      quantity: 100
    }
    
    const response = await fetch('http://localhost:3001/api/import-json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonData: [testMedicine],
        dataType: 'medicines'
      })
    })

    const result = await response.json()
    console.log('Import result:', JSON.stringify(result, null, 2))
    
    if (!result.success && result.results && result.results[0]) {
      const error = result.results[0].error
      console.log('\n❌ Error:', error)
      
      if (error.includes('column')) {
        console.log('\n💡 The table is missing expected columns.')
        console.log('You need to create the tables in Supabase with the correct schema.')
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

checkSchema()