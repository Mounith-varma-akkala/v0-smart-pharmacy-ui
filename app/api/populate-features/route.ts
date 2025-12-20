import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { feature } = await request.json()

    switch (feature) {
      case 'suppliers':
        return await populateSuppliers()
      case 'inventory_batches':
        return await populateInventoryBatches()
      case 'drug_substitutes':
        return await populateDrugSubstitutes()
      case 'demand_patterns':
        return await populateDemandPatterns()
      case 'price_forecasts':
        return await populatePriceForecasts()
      case 'low_stock_requests':
        return await populateLowStockRequests()
      case 'all':
        return await populateAllFeatures()
      default:
        return NextResponse.json({ error: 'Invalid feature' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error populating features:', error)
    return NextResponse.json({ error: 'Failed to populate features' }, { status: 500 })
  }
}

async function populateSuppliers() {
  try {
    // Get existing medicines to create supplier relationships
    const { data: medicines } = await supabase
      .from('medicines')
      .select('id, name')
      .limit(20)

    if (!medicines || medicines.length === 0) {
      return NextResponse.json({ error: 'No medicines found. Please add medicines first.' }, { status: 400 })
    }

    // Create suppliers based on real pharmaceutical companies
    const suppliersData = [
      {
        name: 'Sun Pharmaceutical Industries',
        contact_person: 'Rajesh Kumar',
        email: 'rajesh@sunpharma.com',
        phone: '+91-22-4324-4324',
        address: 'Sun House, 201 B/1, Western Express Highway, Goregaon (E), Mumbai - 400063',
        lead_time_days: 5,
        reliability_rating: 4.8,
        price_trend: 'stable',
        auto_reorder_enabled: true
      },
      {
        name: 'Dr. Reddys Laboratories',
        contact_person: 'Priya Sharma',
        email: 'priya@drreddys.com',
        phone: '+91-40-4900-2900',
        address: '8-2-337, Road No. 3, Banjara Hills, Hyderabad - 500034',
        lead_time_days: 7,
        reliability_rating: 4.6,
        price_trend: 'up',
        auto_reorder_enabled: true
      },
      {
        name: 'Cipla Limited',
        contact_person: 'Amit Patel',
        email: 'amit@cipla.com',
        phone: '+91-22-2482-1234',
        address: 'Cipla House, Peninsula Business Park, Ganpatrao Kadam Marg, Mumbai - 400013',
        lead_time_days: 6,
        reliability_rating: 4.7,
        price_trend: 'down',
        auto_reorder_enabled: false
      },
      {
        name: 'Lupin Pharmaceuticals',
        contact_person: 'Sneha Gupta',
        email: 'sneha@lupin.com',
        phone: '+91-22-6640-2323',
        address: '159, CST Road, Kalina, Santacruz (E), Mumbai - 400098',
        lead_time_days: 8,
        reliability_rating: 4.4,
        price_trend: 'stable',
        auto_reorder_enabled: true
      },
      {
        name: 'Aurobindo Pharma',
        contact_person: 'Vikram Singh',
        email: 'vikram@aurobindo.com',
        phone: '+91-40-6672-5000',
        address: 'Plot No. 2, Maitrivihar, Ameerpet, Hyderabad - 500038',
        lead_time_days: 9,
        reliability_rating: 4.2,
        price_trend: 'up',
        auto_reorder_enabled: false
      }
    ]

    // Insert suppliers
    const { data: insertedSuppliers, error: supplierError } = await supabase
      .from('suppliers')
      .insert(suppliersData)
      .select()

    if (supplierError) throw supplierError

    // Create supplier-medicine relationships
    const supplierMedicines = []
    for (const supplier of insertedSuppliers) {
      // Assign random medicines to each supplier
      const assignedMedicines = medicines.slice(0, Math.floor(Math.random() * 8) + 3)
      
      for (const medicine of assignedMedicines) {
        supplierMedicines.push({
          supplier_id: supplier.id,
          medicine_id: medicine.id,
          medicine_name: medicine.name,
          unit_price: Math.floor(Math.random() * 500) + 50,
          minimum_order_quantity: Math.floor(Math.random() * 50) + 10
        })
      }
    }

    const { error: medicineError } = await supabase
      .from('supplier_medicines')
      .insert(supplierMedicines)

    if (medicineError) throw medicineError

    // Create supplier orders for performance tracking
    const supplierOrders = []
    for (const supplier of insertedSuppliers) {
      for (let i = 0; i < Math.floor(Math.random() * 10) + 5; i++) {
        const orderDate = new Date()
        orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 90))
        
        const deliveredDate = new Date(orderDate)
        deliveredDate.setDate(deliveredDate.getDate() + supplier.lead_time_days + Math.floor(Math.random() * 3))
        
        const onTime = deliveredDate.getTime() <= (orderDate.getTime() + (supplier.lead_time_days * 24 * 60 * 60 * 1000))

        supplierOrders.push({
          supplier_id: supplier.id,
          order_date: orderDate.toISOString(),
          delivered_date: deliveredDate.toISOString(),
          delivered_on_time: onTime,
          total_amount: Math.floor(Math.random() * 50000) + 10000
        })
      }
    }

    const { error: ordersError } = await supabase
      .from('supplier_orders')
      .insert(supplierOrders)

    if (ordersError) throw ordersError

    return NextResponse.json({ 
      success: true, 
      message: `Created ${insertedSuppliers.length} suppliers with ${supplierMedicines.length} medicine relationships and ${supplierOrders.length} order records`
    })

  } catch (error) {
    console.error('Error populating suppliers:', error)
    throw error
  }
}

async function populateInventoryBatches() {
  try {
    // Get existing inventory
    const { data: inventory } = await supabase
      .from('inventory')
      .select(`
        id,
        medicine_id,
        quantity,
        medicines (id, name)
      `)
      .limit(15)

    if (!inventory || inventory.length === 0) {
      return NextResponse.json({ error: 'No inventory found. Please add inventory first.' }, { status: 400 })
    }

    // Get suppliers for batch assignment
    const { data: suppliers } = await supabase
      .from('suppliers')
      .select('id')

    const batchesData = []
    
    for (const item of inventory) {
      // Create 2-4 batches per inventory item
      const batchCount = Math.floor(Math.random() * 3) + 2
      
      for (let i = 0; i < batchCount; i++) {
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + Math.floor(Math.random() * 730) + 30) // 30 days to 2 years
        
        const batchQuantity = Math.floor(item.quantity / batchCount) + Math.floor(Math.random() * 20)
        
        batchesData.push({
          medicine_id: item.medicine_id,
          batch_number: `BATCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          expiry_date: expiryDate.toISOString().split('T')[0],
          quantity: batchQuantity,
          cost_price: Math.floor(Math.random() * 300) + 20,
          supplier_id: suppliers?.[Math.floor(Math.random() * suppliers.length)]?.id || null,
          received_date: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString()
        })
      }
    }

    const { data: insertedBatches, error } = await supabase
      .from('inventory_batches')
      .insert(batchesData)
      .select()

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      message: `Created ${insertedBatches.length} inventory batches for FEFO management`
    })

  } catch (error) {
    console.error('Error populating inventory batches:', error)
    throw error
  }
}

async function populateDrugSubstitutes() {
  try {
    // Get medicines for substitution mapping
    const { data: medicines } = await supabase
      .from('medicines')
      .select('id, name, composition')
      .limit(20)

    if (!medicines || medicines.length < 4) {
      return NextResponse.json({ error: 'Need at least 4 medicines for substitution mapping.' }, { status: 400 })
    }

    const substitutesData = []
    
    // Create substitution pairs
    for (let i = 0; i < medicines.length - 1; i += 2) {
      const original = medicines[i]
      const substitute = medicines[i + 1]
      
      substitutesData.push({
        original_medicine_id: original.id,
        substitute_medicine_id: substitute.id,
        equivalency_score: Math.floor(Math.random() * 30) + 70, // 70-100%
        notes: `Generic equivalent of ${original.name}`,
        contraindications: ['pregnancy', 'liver_disease'].slice(0, Math.floor(Math.random() * 2) + 1),
        is_active: true,
        created_by: 'system'
      })

      // Create reverse substitution
      substitutesData.push({
        original_medicine_id: substitute.id,
        substitute_medicine_id: original.id,
        equivalency_score: Math.floor(Math.random() * 25) + 75, // 75-100%
        notes: `Brand equivalent of ${substitute.name}`,
        contraindications: ['kidney_disease'].slice(0, Math.floor(Math.random() * 2)),
        is_active: true,
        created_by: 'system'
      })
    }

    const { data: insertedSubstitutes, error } = await supabase
      .from('drug_substitutes')
      .insert(substitutesData)
      .select()

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      message: `Created ${insertedSubstitutes.length} drug substitution mappings`
    })

  } catch (error) {
    console.error('Error populating drug substitutes:', error)
    throw error
  }
}

async function populateDemandPatterns() {
  try {
    // Get existing sales data to create patterns
    const { data: sales } = await supabase
      .from('sales')
      .select('medicine_id, quantity, sale_date')
      .order('sale_date', { ascending: false })
      .limit(100)

    if (!sales || sales.length === 0) {
      return NextResponse.json({ error: 'No sales data found for pattern analysis.' }, { status: 400 })
    }

    // Group sales by medicine
    const medicinesSales = sales.reduce((acc, sale) => {
      if (!acc[sale.medicine_id]) {
        acc[sale.medicine_id] = []
      }
      acc[sale.medicine_id].push(sale)
      return acc
    }, {})

    // Create sample heatmap data
    const heatmapData = []
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
    for (const day of days) {
      for (let hour = 0; hour < 24; hour++) {
        heatmapData.push({
          day,
          hour,
          sales: Math.floor(Math.random() * 50) + 5
        })
      }
    }

    // Store heatmap data (you might want to create a separate table for this)
    // For now, we'll return the analysis

    return NextResponse.json({ 
      success: true, 
      message: `Analyzed ${Object.keys(medicinesSales).length} medicines for demand patterns`,
      heatmapData,
      patternsFound: Object.keys(medicinesSales).length
    })

  } catch (error) {
    console.error('Error populating demand patterns:', error)
    throw error
  }
}

async function populatePriceForecasts() {
  try {
    // Get medicines for price forecasting
    const { data: medicines } = await supabase
      .from('medicines')
      .select('id, name, price')
      .limit(10)

    if (!medicines || medicines.length === 0) {
      return NextResponse.json({ error: 'No medicines found for price forecasting.' }, { status: 400 })
    }

    // Create sample price forecast data
    const forecastsData = medicines.map(medicine => {
      const currentPrice = medicine.price || Math.floor(Math.random() * 500) + 50
      const priceChange = (Math.random() - 0.5) * 0.4 // -20% to +20%
      const predictedPrice = Math.floor(currentPrice * (1 + priceChange))
      
      return {
        medicine_id: medicine.id,
        medicine_name: medicine.name,
        current_price: currentPrice,
        predicted_price: predictedPrice,
        price_change_percent: Math.floor(priceChange * 100),
        surge_probability: Math.floor(Math.random() * 100),
        recommended_stock_quantity: Math.floor(Math.random() * 200) + 50,
        current_stock: Math.floor(Math.random() * 100) + 20,
        forecast_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        factors: ['seasonal_demand', 'supply_chain_issues', 'market_trends'].slice(0, Math.floor(Math.random() * 3) + 1)
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: `Generated price forecasts for ${forecastsData.length} medicines`,
      forecasts: forecastsData
    })

  } catch (error) {
    console.error('Error populating price forecasts:', error)
    throw error
  }
}

async function populateLowStockRequests() {
  try {
    // Get medicines with low stock
    const { data: inventory } = await supabase
      .from('inventory')
      .select(`
        medicine_id,
        quantity,
        medicines (id, name)
      `)
      .lt('quantity', 50)
      .limit(8)

    if (!inventory || inventory.length === 0) {
      return NextResponse.json({ error: 'No low stock items found.' }, { status: 400 })
    }

    const requestsData = inventory.map(item => ({
      medicine_id: item.medicine_id,
      requested_quantity: Math.floor(Math.random() * 100) + 50,
      reason: `Current stock is ${item.quantity} units, below minimum threshold`,
      urgency: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
      status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
      requested_by: 'manager@pharmacy.com',
      created_at: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString()
    }))

    const { data: insertedRequests, error } = await supabase
      .from('low_stock_requests')
      .insert(requestsData)
      .select()

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      message: `Created ${insertedRequests.length} low stock requests`
    })

  } catch (error) {
    console.error('Error populating low stock requests:', error)
    throw error
  }
}

async function populateAllFeatures() {
  try {
    const results = []
    
    // Populate in order of dependencies
    results.push(await populateSuppliers())
    results.push(await populateInventoryBatches())
    results.push(await populateDrugSubstitutes())
    results.push(await populateLowStockRequests())
    
    return NextResponse.json({ 
      success: true, 
      message: 'All features populated successfully',
      results: results.map(r => r.json())
    })

  } catch (error) {
    console.error('Error populating all features:', error)
    throw error
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Smart Pharmacy Features Data Population API',
    endpoints: {
      'POST /api/populate-features': 'Populate feature data',
      'body': {
        'feature': 'suppliers | inventory_batches | drug_substitutes | demand_patterns | price_forecasts | low_stock_requests | all'
      }
    }
  })
}