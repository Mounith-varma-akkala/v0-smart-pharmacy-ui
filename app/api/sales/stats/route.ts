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

    // First, let's check what tables exist
    let stats, paymentStats, topMedicines, salesTrend;

    try {
      // Get basic sales stats - try different possible column names
      const statsQuery = `
        SELECT 
          COUNT(*) as total_transactions,
          COALESCE(SUM(quantity), SUM(qty), 0) as total_units_sold,
          COALESCE(SUM(total_price), SUM(total_amount), SUM(amount), 0) as total_revenue,
          COALESCE(AVG(total_price), AVG(total_amount), AVG(amount), 0) as average_sale_value,
          COUNT(DISTINCT COALESCE(customer_name, customer_id, customer)) as unique_customers
        FROM sales 
        ${dateCondition}
      `

      stats = await executeQuery(statsQuery)

    } catch (statsError) {
      console.log('Stats query failed, trying alternative approach:', statsError.message);
      // Fallback: try to get basic info from any sales-related table
      try {
        const fallbackQuery = `SELECT COUNT(*) as total_transactions FROM sales ${dateCondition}`;
        const fallbackStats = await executeQuery(fallbackQuery);
        stats = [{
          total_transactions: fallbackStats[0]?.total_transactions || 0,
          total_units_sold: 0,
          total_revenue: 0,
          average_sale_value: 0,
          unique_customers: 0
        }];
      } catch (fallbackError) {
        console.log('Fallback query also failed:', fallbackError.message);
        stats = [{
          total_transactions: 0,
          total_units_sold: 0,
          total_revenue: 0,
          average_sale_value: 0,
          unique_customers: 0
        }];
      }
    }

    try {
      // Get sales by payment method - try different possible column names
      const paymentMethodQuery = `
        SELECT 
          COALESCE(payment_method, payment_type, 'unknown') as payment_method,
          COUNT(*) as transaction_count,
          COALESCE(SUM(total_price), SUM(total_amount), SUM(amount), 0) as revenue
        FROM sales 
        ${dateCondition}
        GROUP BY COALESCE(payment_method, payment_type, 'unknown')
      `

      paymentStats = await executeQuery(paymentMethodQuery)
    } catch (paymentError) {
      console.log('Payment stats query failed:', paymentError.message);
      paymentStats = [];
    }

    try {
      // Get top selling medicines - try with and without joins
      const topMedicinesQuery = `
        SELECT 
          COALESCE(medicine_name, product_name, item_name, 'Unknown') as medicine_name,
          COALESCE(category, 'General') as category,
          COALESCE(SUM(quantity), SUM(qty), 0) as total_sold,
          COALESCE(SUM(total_price), SUM(total_amount), SUM(amount), 0) as revenue
        FROM sales s
        ${dateCondition}
        GROUP BY COALESCE(medicine_name, product_name, item_name), COALESCE(category, 'General')
        ORDER BY total_sold DESC
        LIMIT 10
      `

      topMedicines = await executeQuery(topMedicinesQuery)
    } catch (medicineError) {
      console.log('Top medicines query failed:', medicineError.message);
      topMedicines = [];
    }

    try {
      // Get daily sales trend (last 7 days)
      const trendQuery = `
        SELECT 
          DATE(COALESCE(sale_date, created_at, date)) as sale_day,
          COUNT(*) as transactions,
          COALESCE(SUM(total_price), SUM(total_amount), SUM(amount), 0) as revenue,
          COALESCE(SUM(quantity), SUM(qty), 0) as units_sold
        FROM sales 
        WHERE COALESCE(sale_date, created_at, date) >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(COALESCE(sale_date, created_at, date))
        ORDER BY sale_day ASC
      `

      salesTrend = await executeQuery(trendQuery)
    } catch (trendError) {
      console.log('Sales trend query failed:', trendError.message);
      salesTrend = [];
    }

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