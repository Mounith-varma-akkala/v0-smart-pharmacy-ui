import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'today' // today, week, month, year

    let dateCondition = ''
    const today = new Date().toISOString().split('T')[0]

    switch (period) {
      case 'today':
        dateCondition = `WHERE DATE(sale_date) = '${today}'`
        break
      case 'week':
        dateCondition = `WHERE sale_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
        break
      case 'month':
        dateCondition = `WHERE sale_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
        break
      case 'year':
        dateCondition = `WHERE sale_date >= DATE_SUB(NOW(), INTERVAL 365 DAY)`
        break
    }

    // Get basic sales stats
    const statsQuery = `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(quantity) as total_units_sold,
        SUM(total_price) as total_revenue,
        AVG(total_price) as average_sale_value,
        COUNT(DISTINCT customer_name) as unique_customers
      FROM sales 
      ${dateCondition}
    `

    const stats = await executeQuery(statsQuery)

    // Get sales by payment method
    const paymentMethodQuery = `
      SELECT 
        payment_method,
        COUNT(*) as transaction_count,
        SUM(total_price) as revenue
      FROM sales 
      ${dateCondition}
      GROUP BY payment_method
    `

    const paymentStats = await executeQuery(paymentMethodQuery)

    // Get top selling medicines
    const topMedicinesQuery = `
      SELECT 
        m.name as medicine_name,
        m.category,
        SUM(s.quantity) as total_sold,
        SUM(s.total_price) as revenue
      FROM sales s
      LEFT JOIN medicines m ON s.medicine_id = m.id
      ${dateCondition}
      GROUP BY s.medicine_id, m.name, m.category
      ORDER BY total_sold DESC
      LIMIT 10
    `

    const topMedicines = await executeQuery(topMedicinesQuery)

    // Get daily sales trend (last 7 days)
    const trendQuery = `
      SELECT 
        DATE(sale_date) as sale_day,
        COUNT(*) as transactions,
        SUM(total_price) as revenue,
        SUM(quantity) as units_sold
      FROM sales 
      WHERE sale_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(sale_date)
      ORDER BY sale_day ASC
    `

    const salesTrend = await executeQuery(trendQuery)

    return NextResponse.json({
      success: true,
      data: {
        summary: Array.isArray(stats) ? stats[0] : stats,
        paymentMethods: paymentStats,
        topMedicines: topMedicines,
        salesTrend: salesTrend,
        period: period
      }
    })

  } catch (error) {
    console.error('Sales Stats API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sales statistics' },
      { status: 500 }
    )
  }
}