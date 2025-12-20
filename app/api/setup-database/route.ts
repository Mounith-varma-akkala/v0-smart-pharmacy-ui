import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    switch (action) {
      case 'check_readiness':
        return await checkDatabaseReadiness()
      case 'setup_sample_data':
        return await setupSampleData()
      case 'verify_schema':
        return await verifySchema()
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json({ error: 'Database setup failed' }, { status: 500 })
  }
}

async function checkDatabaseReadiness() {
  try {
    const checks = []

    // Check if basic tables exist
    const basicTables = ['medicines', 'inventory', 'sales', 'alerts']
    for (const table of basicTables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })

        checks.push({
          table,
          exists: !error,
          count: count || 0,
          status: !error ? 'ready' : 'missing'
        })
      } catch (err) {
        checks.push({
          table,
          exists: false,
          count: 0,
          status: 'error'
        })
      }
    }

    // Check if smart pharmacy tables exist
    const smartTables = ['suppliers', 'inventory_batches', 'drug_substitutes', 'low_stock_requests']
    for (const table of smartTables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })

        checks.push({
          table,
          exists: !error,
          count: count || 0,
          status: !error ? 'ready' : 'missing'
        })
      } catch (err) {
        checks.push({
          table,
          exists: false,
          count: 0,
          status: 'error'
        })
      }
    }

    const readyTables = checks.filter(c => c.status === 'ready').length
    const totalTables = checks.length
    const isReady = readyTables >= basicTables.length // At least basic tables should exist

    return NextResponse.json({
      success: true,
      isReady,
      readiness: `${readyTables}/${totalTables} tables ready`,
      checks,
      recommendations: getRecommendations(checks)
    })

  } catch (error) {
    console.error('Error checking database readiness:', error)
    return NextResponse.json({ error: 'Failed to check database readiness' }, { status: 500 })
  }
}

async function setupSampleData() {
  try {
    const results = []

    // 1. Create sample medicines if none exist
    const { data: existingMedicines } = await supabase
      .from('medicines')
      .select('id')
      .limit(1)

    if (!existingMedicines || existingMedicines.length === 0) {
      const sampleMedicines = [
        {
          name: 'Paracetamol 500mg',
          composition: 'Paracetamol 500mg',
          price: 25,
          description: 'Pain reliever and fever reducer',
          requires_prescription: false
        },
        {
          name: 'Amoxicillin 250mg',
          composition: 'Amoxicillin 250mg',
          price: 85,
          description: 'Antibiotic for bacterial infections',
          requires_prescription: true
        },
        {
          name: 'Ibuprofen 400mg',
          composition: 'Ibuprofen 400mg',
          price: 35,
          description: 'Anti-inflammatory pain reliever',
          requires_prescription: false
        },
        {
          name: 'Metformin 500mg',
          composition: 'Metformin HCl 500mg',
          price: 45,
          description: 'Diabetes medication',
          requires_prescription: true
        },
        {
          name: 'Omeprazole 20mg',
          composition: 'Omeprazole 20mg',
          price: 65,
          description: 'Proton pump inhibitor for acid reflux',
          requires_prescription: true
        },
        {
          name: 'Cetirizine 10mg',
          composition: 'Cetirizine HCl 10mg',
          price: 15,
          description: 'Antihistamine for allergies',
          requires_prescription: false
        },
        {
          name: 'Atorvastatin 20mg',
          composition: 'Atorvastatin 20mg',
          price: 125,
          description: 'Cholesterol-lowering medication',
          requires_prescription: true
        },
        {
          name: 'Aspirin 75mg',
          composition: 'Acetylsalicylic Acid 75mg',
          price: 20,
          description: 'Blood thinner and pain reliever',
          requires_prescription: false
        }
      ]

      const { data: insertedMedicines, error: medicinesError } = await supabase
        .from('medicines')
        .insert(sampleMedicines)
        .select()

      if (medicinesError) throw medicinesError

      results.push(`Created ${insertedMedicines.length} sample medicines`)
    } else {
      results.push('Medicines already exist, skipping creation')
    }

    // 2. Create inventory records
    const { data: medicines } = await supabase
      .from('medicines')
      .select('id')
      .limit(10)

    if (medicines && medicines.length > 0) {
      const inventoryData = medicines.map(medicine => ({
        medicine_id: medicine.id,
        quantity: Math.floor(Math.random() * 200) + 50,
        reorder_level: Math.floor(Math.random() * 30) + 20,
        last_updated: new Date().toISOString()
      }))

      // Check if inventory already exists
      const { data: existingInventory } = await supabase
        .from('inventory')
        .select('medicine_id')
        .in('medicine_id', medicines.map(m => m.id))

      const existingMedicineIds = existingInventory?.map(i => i.medicine_id) || []
      const newInventoryData = inventoryData.filter(i => !existingMedicineIds.includes(i.medicine_id))

      if (newInventoryData.length > 0) {
        const { error: inventoryError } = await supabase
          .from('inventory')
          .insert(newInventoryData)

        if (inventoryError) throw inventoryError
        results.push(`Created ${newInventoryData.length} inventory records`)
      } else {
        results.push('Inventory records already exist')
      }
    }

    // 3. Create sample sales data
    const { data: inventory } = await supabase
      .from('inventory')
      .select(`
        medicine_id,
        medicines (id, name, price)
      `)
      .limit(8)

    if (inventory && inventory.length > 0) {
      const salesData = []
      const customers = ['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Lisa Brown', 'David Lee']

      for (const item of inventory) {
        // Create 3-5 sales records per medicine
        const salesCount = Math.floor(Math.random() * 3) + 3
        
        for (let i = 0; i < salesCount; i++) {
          const quantity = Math.floor(Math.random() * 5) + 1
          const saleDate = new Date()
          saleDate.setDate(saleDate.getDate() - Math.floor(Math.random() * 90))

          salesData.push({
            medicine_id: item.medicine_id,
            quantity,
            unit_price: item.medicines.price,
            total_amount: quantity * item.medicines.price,
            sale_date: saleDate.toISOString(),
            customer_name: customers[Math.floor(Math.random() * customers.length)],
            prescription_required: Math.random() > 0.5
          })
        }
      }

      const { error: salesError } = await supabase
        .from('sales')
        .insert(salesData)

      if (salesError) throw salesError
      results.push(`Created ${salesData.length} sales records`)
    }

    // 4. Create low stock alerts
    const { data: lowStockItems } = await supabase
      .from('inventory')
      .select(`
        medicine_id,
        quantity,
        reorder_level,
        medicines (name)
      `)
      .lt('quantity', 50)
      .limit(5)

    if (lowStockItems && lowStockItems.length > 0) {
      const alertsData = lowStockItems.map(item => ({
        type: 'low_stock',
        message: `Low stock alert: ${item.medicines.name} has only ${item.quantity} units remaining`,
        severity: item.quantity <= 10 ? 'high' : item.quantity <= 20 ? 'medium' : 'low',
        is_read: false,
        medicine_id: item.medicine_id,
        created_at: new Date().toISOString()
      }))

      const { error: alertsError } = await supabase
        .from('alerts')
        .insert(alertsData)

      if (alertsError) throw alertsError
      results.push(`Created ${alertsData.length} low stock alerts`)
    }

    return NextResponse.json({
      success: true,
      message: 'Sample data setup completed successfully',
      results
    })

  } catch (error) {
    console.error('Error setting up sample data:', error)
    return NextResponse.json({ error: 'Failed to setup sample data' }, { status: 500 })
  }
}

async function verifySchema() {
  try {
    const requiredTables = [
      'medicines', 'inventory', 'sales', 'alerts',
      'suppliers', 'supplier_medicines', 'supplier_orders',
      'inventory_batches', 'drug_substitutes', 'drug_substitution_logs',
      'low_stock_requests', 'supply_requests', 'purchase_orders', 'audit_logs'
    ]

    const tableStatus = []

    for (const table of requiredTables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })

        tableStatus.push({
          table,
          exists: !error,
          count: count || 0,
          required: ['medicines', 'inventory', 'sales', 'alerts'].includes(table)
        })
      } catch (err) {
        tableStatus.push({
          table,
          exists: false,
          count: 0,
          required: ['medicines', 'inventory', 'sales', 'alerts'].includes(table)
        })
      }
    }

    const existingTables = tableStatus.filter(t => t.exists).length
    const requiredTablesExist = tableStatus.filter(t => t.required && t.exists).length === 4

    return NextResponse.json({
      success: true,
      schemaReady: requiredTablesExist,
      tablesFound: `${existingTables}/${requiredTables.length}`,
      tableStatus,
      message: requiredTablesExist 
        ? 'Database schema is ready for smart pharmacy features'
        : 'Please run the pharmacy_features_schema.sql script first'
    })

  } catch (error) {
    console.error('Error verifying schema:', error)
    return NextResponse.json({ error: 'Failed to verify schema' }, { status: 500 })
  }
}

function getRecommendations(checks: any[]) {
  const recommendations = []
  
  const missingBasicTables = checks.filter(c => 
    ['medicines', 'inventory', 'sales', 'alerts'].includes(c.table) && c.status !== 'ready'
  )

  const missingSmartTables = checks.filter(c => 
    ['suppliers', 'inventory_batches', 'drug_substitutes', 'low_stock_requests'].includes(c.table) && c.status !== 'ready'
  )

  if (missingBasicTables.length > 0) {
    recommendations.push('Run the basic database schema setup first')
  }

  if (missingSmartTables.length > 0) {
    recommendations.push('Run scripts/pharmacy_features_schema.sql to create smart pharmacy tables')
  }

  const emptyTables = checks.filter(c => c.exists && c.count === 0)
  if (emptyTables.length > 0) {
    recommendations.push('Use the "Setup Sample Data" button to populate basic data')
  }

  if (recommendations.length === 0) {
    recommendations.push('Database is ready! You can now populate smart pharmacy features.')
  }

  return recommendations
}

export async function GET() {
  return NextResponse.json({
    message: 'Database Setup API',
    endpoints: {
      'POST /api/setup-database': 'Setup database and sample data',
      'body': {
        'action': 'check_readiness | setup_sample_data | verify_schema'
      }
    }
  })
}