import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Get historical sales and price data
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select(`
        *,
        medicines (name, current_price)
      `)
      .gte('created_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()) // Last 6 months

    if (salesError) throw salesError

    // Get current inventory levels
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select('medicine_id, quantity')

    if (inventoryError) throw inventoryError

    // Process data to generate forecasts
    const medicineMap = new Map()
    
    salesData?.forEach(sale => {
      const medicineId = sale.medicine_id
      const medicineName = sale.medicines?.name
      const price = sale.medicines?.current_price || sale.unit_price
      const date = new Date(sale.created_at).toISOString().split('T')[0]

      if (!medicineMap.has(medicineId)) {
        medicineMap.set(medicineId, {
          id: medicineId,
          name: medicineName,
          current_price: price,
          sales_history: [],
          price_history: []
        })
      }

      const medicine = medicineMap.get(medicineId)
      medicine.sales_history.push({
        date,
        quantity: sale.quantity,
        price: sale.unit_price
      })
    })

    const forecasts = Array.from(medicineMap.values()).map(medicine => {
      // Simple price surge prediction algorithm
      const recentPrices = medicine.sales_history
        .slice(-30) // Last 30 transactions
        .map(s => s.price)
      
      const avgRecentPrice = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length
      const priceVolatility = calculateVolatility(recentPrices)
      
      // Predict price surge based on volatility and trend
      const priceTrend = calculateTrend(recentPrices)
      const surgeProbability = Math.min(95, Math.max(5, 
        (priceVolatility * 100) + (priceTrend > 0 ? 30 : 0)
      ))
      
      const predictedPriceIncrease = surgeProbability > 50 ? 
        (surgeProbability / 100) * 0.3 * medicine.current_price : 0
      
      const predictedPrice = medicine.current_price + predictedPriceIncrease
      const priceChangePercent = ((predictedPrice - medicine.current_price) / medicine.current_price) * 100

      // Calculate recommended stock quantity
      const avgMonthlySales = medicine.sales_history
        .slice(-30)
        .reduce((sum, s) => sum + s.quantity, 0)
      
      const currentStock = inventoryData?.find(inv => inv.medicine_id === medicine.id)?.quantity || 0
      const recommendedStock = surgeProbability > 60 ? 
        Math.max(0, (avgMonthlySales * 2) - currentStock) : 0

      // Generate historical data for chart
      const historicalData = generateHistoricalData(medicine.sales_history)

      // Determine contributing factors
      const factors = []
      if (priceVolatility > 0.1) factors.push('High price volatility detected')
      if (priceTrend > 0.05) factors.push('Upward price trend observed')
      if (avgMonthlySales > 100) factors.push('High demand volume')
      if (currentStock < avgMonthlySales) factors.push('Low current stock levels')
      factors.push('Seasonal demand patterns')
      factors.push('Market supply constraints')

      return {
        id: medicine.id,
        medicine_name: medicine.name,
        current_price: medicine.current_price,
        predicted_price: Math.round(predictedPrice * 100) / 100,
        price_change_percent: Math.round(priceChangePercent * 100) / 100,
        surge_probability: Math.round(surgeProbability),
        recommended_stock_quantity: recommendedStock,
        current_stock: currentStock,
        forecast_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        historical_data: historicalData,
        factors: factors.slice(0, 4) // Top 4 factors
      }
    })

    // Sort by surge probability (highest first)
    forecasts.sort((a, b) => b.surge_probability - a.surge_probability)

    return NextResponse.json({ 
      success: true, 
      forecasts: forecasts.slice(0, 20) // Top 20 medicines
    })

  } catch (error) {
    console.error('Error generating price forecasts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate price forecasts' },
      { status: 500 }
    )
  }
}

function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0
  
  const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length
  const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length
  return Math.sqrt(variance) / mean // Coefficient of variation
}

function calculateTrend(prices: number[]): number {
  if (prices.length < 2) return 0
  
  const n = prices.length
  const sumX = (n * (n - 1)) / 2
  const sumY = prices.reduce((sum, p) => sum + p, 0)
  const sumXY = prices.reduce((sum, p, i) => sum + (i * p), 0)
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  return slope / (sumY / n) // Normalized slope
}

function generateHistoricalData(salesHistory: any[]): any[] {
  const monthlyData = new Map()
  
  salesHistory.forEach(sale => {
    const month = sale.date.substring(0, 7) // YYYY-MM
    if (!monthlyData.has(month)) {
      monthlyData.set(month, { price: [], volume: 0 })
    }
    monthlyData.get(month).price.push(sale.price)
    monthlyData.get(month).volume += sale.quantity
  })
  
  return Array.from(monthlyData.entries())
    .map(([month, data]) => ({
      date: month + '-01',
      price: data.price.reduce((sum, p) => sum + p, 0) / data.price.length,
      sales_volume: data.volume
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-6) // Last 6 months
}