import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { medicine_id, quantity } = await request.json()

    // Get medicine details
    const { data: medicine, error: medicineError } = await supabase
      .from('medicines')
      .select('*, suppliers(*)')
      .eq('id', medicine_id)
      .single()

    if (medicineError) throw medicineError

    // Create a purchase order
    const { data: purchaseOrder, error: orderError } = await supabase
      .from('purchase_orders')
      .insert([{
        medicine_id,
        supplier_id: medicine.suppliers?.id,
        quantity,
        unit_price: medicine.current_price,
        total_amount: quantity * medicine.current_price,
        order_type: 'price_surge_prevention',
        status: 'pending',
        created_by: 'system', // In real app, get from auth
        notes: `Automated order to prevent price surge. Forecasted price increase expected.`
      }])
      .select()
      .single()

    if (orderError) throw orderError

    // Log the action
    await supabase
      .from('audit_logs')
      .insert([{
        action: 'price_surge_order_created',
        table_name: 'purchase_orders',
        record_id: purchaseOrder.id,
        user_id: 'system',
        timestamp: new Date().toISOString(),
        details: {
          medicine_id,
          quantity,
          reason: 'price_surge_prevention'
        }
      }])

    return NextResponse.json({ 
      success: true, 
      order: purchaseOrder 
    })

  } catch (error) {
    console.error('Error executing recommendation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to execute recommendation' },
      { status: 500 }
    )
  }
}