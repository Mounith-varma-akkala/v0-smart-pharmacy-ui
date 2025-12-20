import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'today' // today, week, month, year

    let dateFilter = ''
    const today = new Date().toISOString().split('T')[0]

    switch (period) {
      case 'today':
        dateFilter = `sale_date.gte.${today}T00:00:00,sale_date.lte.${today}T23:59:59`
        break
      case 'week':
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        dateFilter = `sale_date.gte.${weekAgo.toISOString()}`
        break
      case 'month':
        const monthAgo = new Date()
        monthAgo.setDate(monthAgo.getDate() - 30)
        dateFilter = `sale_date.gte.${monthAgo.toISOString()}`
        break
      case 'year':
        const yearAgo = new Date()
        yearAgo.setFullYear(yearAgo.getFullYear() - 1)
        dateFilter = `sale_date.gte.${yearAgo.toISOString()}`
        break
    }

    // Get basic sales stats
    let salesQuery = supabase
      .from('sales')
      .select('quantity, total_price, customer_name, sale_date')

    if (dateFilter) {
      const [field, operator, value] = dateFilter.split('.')
      if (operator === 'gte') {
        salesQuery = salesQuery.gte(field, value)
      } else if (operator === 'lte') {
        salesQuery = salesQuery.lte(field, value)
      }
    }

    const { data: salesData, error: salesError } = await salesQuery

    if (salesError) {
      console.error('Sales query error:', salesError)
      throw salesError
    }

    // Calculate stats
    const totalTransactions = salesData?.length || 0
    const totalUnits = salesData?.reduce((sum, sale) => sum + (sale.quantity || 0), 0) || 0
    const totalRevenue = salesData?.reduce((sum, sale) => sum + (sale.total_price || 0), 0) || 0
    const averageSale = totalTransactions > 0 ? totalRevenue / totalTransactions : 0
    const uniqueCustomers = new Set(salesData?.map(sale => sale.customer_name).filter(Boolean)).size

    // Get top medicines (need to join with medicines table or use medicine names from sales)
    const { data: topMedicinesData, error: topMedicinesError } = await supabase
      .from('sales')
      .select(`
        medicine_id,
        quantity,
        total_price,
        medicines (name, category)
      `)
      .order('quantity', { ascending: false })
      .limit(10)

    if (topMedicinesError) {
      console.error('Top medicines query error:', topMedicinesError)
    }

    // Group top medicines by medicine_id
    const medicineMap = new Map()
    topMedicinesData?.forEach(sale => {
      const medicineId = sale.medicine_id
      const medicines = sale.medicines as any // Type assertion for the relation
      const medicineName = medicines?.name || 'Unknown Medicine'
      const category = medicines?.category || 'General'
      
      if (medicineMap.has(medicineId)) {
        const existing = medicineMap.get(medicineId)
        existing.total_sold += sale.quantity || 0
        existing.revenue += sale.total_price || 0
      } else {
        medicineMap.set(medicineId, {
          medicine_name: medicineName,
          category: category,
          total_sold: sale.quantity || 0,
          revenue: sale.total_price || 0
        })
      }
    })

    const topMedicines = Array.from(medicineMap.values())
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, 10)

    // Get daily sales trend (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: trendData, error: trendError } = await supabase
      .from('sales')
      .select('sale_date, quantity, total_price')
      .gte('sale_date', sevenDaysAgo.toISOString())
      .order('sale_date', { ascending: true })

    if (trendError) {
      console.error('Trend query error:', trendError)
    }

    // Group trend data by day
    const trendMap = new Map()
    trendData?.forEach(sale => {
      const day = sale.sale_date.split('T')[0] // Get just the date part
      
      if (trendMap.has(day)) {
        const existing = trendMap.get(day)
        existing.transactions += 1
        existing.revenue += sale.total_price || 0
        existing.units_sold += sale.quantity || 0
      } else {
        trendMap.set(day, {
          sale_day: day,
          transactions: 1,
          revenue: sale.total_price || 0,
          units_sold: sale.quantity || 0
        })
      }
    })

    const salesTrend = Array.from(trendMap.values()).sort((a, b) => 
      new Date(a.sale_day).getTime() - new Date(b.sale_day).getTime()
    )

    // Mock payment methods data (since we don't have this field in current schema)
    const paymentMethods = [
      { payment_method: 'Cash', transaction_count: Math.floor(totalTransactions * 0.6), revenue: totalRevenue * 0.6 },
      { payment_method: 'Card', transaction_count: Math.floor(totalTransactions * 0.3), revenue: totalRevenue * 0.3 },
      { payment_method: 'UPI', transaction_count: Math.floor(totalTransactions * 0.1), revenue: totalRevenue * 0.1 }
    ]

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_transactions: totalTransactions,
          total_units_sold: totalUnits,
          total_revenue: totalRevenue,
          average_sale_value: averageSale,
          unique_customers: uniqueCustomers
        },
        paymentMethods: paymentMethods,
        topMedicines: topMedicines,
        salesTrend: salesTrend,
        period: period
      }
    })

  } catch (error) {
    console.error('Sales Stats API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sales statistics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}