import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = searchParams.get('limit') || '100'

    let query = `
      SELECT 
        s.id,
        s.medicine_id,
        s.quantity,
        s.unit_price,
        s.total_price,
        s.sale_date,
        s.payment_method,
        s.customer_name,
        s.customer_phone,
        s.user_id,
        m.name as medicine_name,
        m.category as medicine_category
      FROM sales s
      LEFT JOIN medicines m ON s.medicine_id = m.id
      WHERE 1=1
    `
    
    const params: any[] = []

    if (startDate) {
      query += ' AND s.sale_date >= ?'
      params.push(startDate)
    }

    if (endDate) {
      query += ' AND s.sale_date <= ?'
      params.push(endDate)
    }

    query += ' ORDER BY s.sale_date DESC LIMIT ?'
    params.push(parseInt(limit))

    const sales = await executeQuery(query, params)

    return NextResponse.json({ 
      success: true, 
      data: sales,
      count: Array.isArray(sales) ? sales.length : 0
    })

  } catch (error) {
    console.error('Sales API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sales data' },
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

    const query = `
      INSERT INTO sales (
        medicine_id, quantity, unit_price, total_price, 
        payment_method, customer_name, customer_phone, user_id, sale_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `

    const params = [
      medicine_id,
      quantity,
      unit_price,
      total_price,
      payment_method || 'cash',
      customer_name || null,
      customer_phone || null,
      user_id
    ]

    const result = await executeQuery(query, params)

    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Sale recorded successfully'
    })

  } catch (error) {
    console.error('Sales POST Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to record sale' },
      { status: 500 }
    )
  }
}