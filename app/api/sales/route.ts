import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '100')

    let salesQuery = supabase
      .from('sales')
      .select(`
        id,
        medicine_id,
        quantity,
        unit_price,
        total_price,
        sale_date,
        payment_method,
        customer_name,
        customer_phone,
        user_id,
        medicines (
          name,
          category
        )
      `)
      .order('sale_date', { ascending: false })
      .limit(limit)

    if (startDate) {
      salesQuery = salesQuery.gte('sale_date', startDate)
    }

    if (endDate) {
      salesQuery = salesQuery.lte('sale_date', endDate)
    }

    const { data: sales, error } = await salesQuery

    if (error) {
      console.error('Supabase sales query error:', error)
      throw error
    }

    // Transform the data to match the expected format
    const transformedSales = sales?.map(sale => {
      const medicines = sale.medicines as any // Type assertion for the relation
      return {
        id: sale.id,
        medicine_id: sale.medicine_id,
        quantity: sale.quantity,
        unit_price: sale.unit_price,
        total_price: sale.total_price, // Use total_price directly
        sale_date: sale.sale_date,
        payment_method: sale.payment_method,
        customer_name: sale.customer_name,
        customer_phone: sale.customer_phone,
        user_id: sale.user_id,
        medicine_name: medicines?.name || 'Unknown Medicine',
        medicine_category: medicines?.category || 'General'
      }
    }) || []

    return NextResponse.json({ 
      success: true, 
      data: transformedSales,
      count: transformedSales.length
    })

  } catch (error) {
    console.error('Sales API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sales data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      medicine_id,
      quantity,
      unit_price,
      total_price,
      payment_method,
      customer_name,
      customer_phone,
      user_id
    } = body

    // Validate required fields
    if (!medicine_id || !quantity || !unit_price) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: medicine_id, quantity, unit_price' },
        { status: 400 }
      )
    }

    const saleData = {
      medicine_id,
      quantity,
      unit_price,
      total_price: total_price || (quantity * unit_price), // Use total_price instead of total_amount
      payment_method: payment_method || 'cash',
      customer_name: customer_name || null,
      customer_phone: customer_phone || null,
      user_id,
      sale_date: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('sales')
      .insert([saleData])
      .select()

    if (error) {
      console.error('Supabase insert error:', error)
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      data: data[0],
      message: 'Sale recorded successfully'
    })

  } catch (error) {
    console.error('Sales POST Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to record sale', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}