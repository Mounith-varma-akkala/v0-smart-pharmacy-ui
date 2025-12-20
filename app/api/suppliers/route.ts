import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select(`
        *,
        supplier_medicines (
          medicine_name
        ),
        supplier_orders (
          id,
          order_date,
          delivered_on_time
        )
      `)
      .order('name')

    if (error) throw error

    // Process the data to match frontend expectations
    const processedSuppliers = suppliers?.map(supplier => ({
      id: supplier.id,
      name: supplier.name,
      contact_person: supplier.contact_person,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      medicines_supplied: supplier.supplier_medicines?.map((sm: any) => sm.medicine_name) || [],
      lead_time_days: supplier.lead_time_days,
      reliability_rating: supplier.reliability_rating,
      price_trend: supplier.price_trend,
      last_order_date: supplier.last_order_date,
      total_orders: supplier.supplier_orders?.length || 0,
      on_time_delivery_rate: supplier.supplier_orders?.length > 0 
        ? Math.round((supplier.supplier_orders.filter((order: any) => order.delivered_on_time).length / supplier.supplier_orders.length) * 100)
        : 0,
      auto_reorder_enabled: supplier.auto_reorder_enabled
    })) || []

    return NextResponse.json({ 
      success: true, 
      suppliers: processedSuppliers 
    })

  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch suppliers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { data: supplier, error } = await supabase
      .from('suppliers')
      .insert([{
        name: body.name,
        contact_person: body.contact_person,
        email: body.email,
        phone: body.phone,
        address: body.address,
        lead_time_days: body.lead_time_days,
        reliability_rating: body.reliability_rating || 0,
        price_trend: body.price_trend || 'stable',
        auto_reorder_enabled: body.auto_reorder_enabled || false
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      supplier 
    })

  } catch (error) {
    console.error('Error creating supplier:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create supplier' },
      { status: 500 }
    )
  }
}