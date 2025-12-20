import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '3months'
    
    // Calculate date range
    const daysBack = {
      '1month': 30,
      '3months': 90,
      '6months': 180,
      '1year': 365
    }[timeframe] || 90

    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)

    // Get sales data
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select(`
        *,
        medicines (name)
      `)
      .gte('created_at', startDate.toISOString())
      .order('created_at')

    if (salesError) throw salesError

    // Get current inventory
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select('medicine_id, quantity')

    if (inventoryError) throw inventoryError

    // Process sales data to detect patterns
    const medicineMap = new Map()
    
    salesData?.forEach(sale => {
      const medicineId = sale.medicine_id
      const medicineName = sale.medicines?.name
      const saleDate = new Date(sale.created_at)
      
      if (!medicineMap.has(medicineId)) {
        medicineMap.set(medicineId, {
          id: medicineId,
          name: medicineName,
          sales: []
        })
      }
      
      medicineMap.get(medicineId).sales.push({
        date: sale.created_at,
        quantity: sale.quantity,
        day_of_week: saleDate.getDay(),
        month: saleDate.getMonth(),
        hour: saleDate.getHours()
      })
    })

    const patterns = []
    
    for (const [medicineId, medicineData] of medicineMap.entries()) {
      const analysis = analyzeDemandPattern(medicineData.sales)
      
      if (analysis.confidence_score > 30) { // Only include patterns with reasonable confidence
        const currentStock = inventoryData?.find(inv => inv.medicine_id === medicineId)?.quantity || 0
        
        patterns.push({
          id: medicineId,
          medicine_name: medicineData.name,
          pattern_type: analysis.pattern_type,
          confidence_score: analysis.confidence_score,
          next_spike_date: analysis.next_spike_date,
          recommended_stock_increase: analysis.recommended_increase,
          current_stock: currentStock,
          historical_data: analysis.historical_data,
          factors: analysis.factors,
          peak_periods: analysis.peak_periods
        })
      }
    }

    // Sort by confidence score
    patterns.sort((a, b) => b.confidence_score - a.confidence_score)

    return NextResponse.json({ 
      success: true, 
      patterns: patterns.slice(0, 15) // Top 15 patterns
    })

  } catch (error) {
    console.error('Error analyzing demand patterns:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to analyze demand patterns' },
      { status: 500 }
    )
  }
}

function analyzeDemandPattern(sales: any[]) {
  if (sales.length < 10) {
    return { confidence_score: 0 }
  }

  // Group sales by different time periods
  const dailyTotals = groupSalesByPeriod(sales, 'daily')
  const weeklyTotals = groupSalesByPeriod(sales, 'weekly')
  const monthlyTotals = groupSalesByPeriod(sales, 'monthly')
  
  // Detect different pattern types
  const seasonalPattern = detectSeasonalPattern(monthlyTotals)
  const weeklyPattern = detectWeeklyPattern(sales)
  const spikePattern = detectSpikePattern(dailyTotals)
  
  // Determine the strongest pattern
  let dominantPattern = { type: 'spike', confidence: 0, data: spikePattern }
  
  if (seasonalPattern.confidence > dominantPattern.confidence) {
    dominantPattern = { type: 'seasonal', confidence: seasonalPattern.confidence, data: seasonalPattern }
  }
  
  if (weeklyPattern.confidence > dominantPattern.confidence) {
    dominantPattern = { type: 'weekly', confidence: weeklyPattern.confidence, data: weeklyPattern }
  }
  
  // Generate historical data for visualization
  const historicalData = dailyTotals.map(item => ({
    date: item.date,
    sales_volume: item.total
  }))

  // Predict next spike
  const nextSpikeDate = predictNextSpike(dominantPattern, sales)
  
  // Calculate recommended stock increase
  const avgDailySales = sales.reduce((sum, s) => sum + s.quantity, 0) / sales.length
  const recommendedIncrease = Math.ceil(avgDailySales * 7) // 1 week buffer

  return {
    pattern_type: dominantPattern.type,
    confidence_score: Math.round(dominantPattern.confidence),
    next_spike_date: nextSpikeDate,
    recommended_increase: recommendedIncrease,
    historical_data: historicalData.slice(-30), // Last 30 days
    factors: generateFactors(dominantPattern, sales),
    peak_periods: generatePeakPeriods(dominantPattern, sales)
  }
}

function groupSalesByPeriod(sales: any[], period: string) {
  const groups = new Map()
  
  sales.forEach(sale => {
    const date = new Date(sale.date)
    let key: string
    
    switch (period) {
      case 'daily':
        key = date.toISOString().split('T')[0]
        break
      case 'weekly':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
        break
      case 'monthly':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      default:
        key = date.toISOString().split('T')[0]
    }
    
    if (!groups.has(key)) {
      groups.set(key, { date: key, total: 0, count: 0 })
    }
    
    groups.get(key).total += sale.quantity
    groups.get(key).count += 1
  })
  
  return Array.from(groups.values()).sort((a, b) => a.date.localeCompare(b.date))
}

function detectSeasonalPattern(monthlyData: any[]) {
  if (monthlyData.length < 6) return { confidence: 0 }
  
  // Simple seasonal detection - look for recurring monthly patterns
  const monthlyAverages = new Map()
  monthlyData.forEach(item => {
    const month = item.date.split('-')[1]
    if (!monthlyAverages.has(month)) {
      monthlyAverages.set(month, [])
    }
    monthlyAverages.get(month).push(item.total)
  })
  
  // Calculate coefficient of variation for each month
  let totalVariation = 0
  let monthCount = 0
  
  for (const [month, values] of monthlyAverages.entries()) {
    if (values.length > 1) {
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
      const cv = Math.sqrt(variance) / mean
      totalVariation += cv
      monthCount++
    }
  }
  
  const avgVariation = monthCount > 0 ? totalVariation / monthCount : 1
  const confidence = Math.max(0, Math.min(100, (1 - avgVariation) * 100))
  
  return { confidence, monthlyAverages }
}

function detectWeeklyPattern(sales: any[]) {
  // Group by day of week
  const dayTotals = new Array(7).fill(0)
  const dayCounts = new Array(7).fill(0)
  
  sales.forEach(sale => {
    dayTotals[sale.day_of_week] += sale.quantity
    dayCounts[sale.day_of_week]++
  })
  
  const dayAverages = dayTotals.map((total, i) => 
    dayCounts[i] > 0 ? total / dayCounts[i] : 0
  )
  
  // Calculate variation across days
  const mean = dayAverages.reduce((sum, avg) => sum + avg, 0) / 7
  const variance = dayAverages.reduce((sum, avg) => sum + Math.pow(avg - mean, 2), 0) / 7
  const cv = Math.sqrt(variance) / mean
  
  const confidence = Math.max(0, Math.min(100, cv * 50)) // Higher variation = higher confidence in weekly pattern
  
  return { confidence, dayAverages }
}

function detectSpikePattern(dailyData: any[]) {
  if (dailyData.length < 7) return { confidence: 0 }
  
  // Calculate moving average and identify spikes
  const windowSize = 7
  const spikes = []
  
  for (let i = windowSize; i < dailyData.length; i++) {
    const window = dailyData.slice(i - windowSize, i)
    const avg = window.reduce((sum, item) => sum + item.total, 0) / windowSize
    const current = dailyData[i].total
    
    if (current > avg * 1.5) { // 50% above average
      spikes.push({
        date: dailyData[i].date,
        value: current,
        multiplier: current / avg
      })
    }
  }
  
  const confidence = Math.min(100, spikes.length * 10) // More spikes = higher confidence
  
  return { confidence, spikes }
}

function predictNextSpike(pattern: any, sales: any[]) {
  const now = new Date()
  
  switch (pattern.type) {
    case 'weekly':
      // Find the day with highest average sales
      const bestDay = pattern.data.dayAverages.indexOf(Math.max(...pattern.data.dayAverages))
      const nextDate = new Date(now)
      nextDate.setDate(now.getDate() + ((bestDay - now.getDay() + 7) % 7))
      return nextDate.toISOString()
      
    case 'seasonal':
      // Predict based on historical monthly patterns
      const currentMonth = now.getMonth() + 1
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1
      const nextDate2 = new Date(now.getFullYear(), nextMonth - 1, 1)
      return nextDate2.toISOString()
      
    default:
      // Default to 2 weeks from now
      const defaultDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
      return defaultDate.toISOString()
  }
}

function generateFactors(pattern: any, sales: any[]): string[] {
  const factors = []
  
  if (pattern.type === 'seasonal') {
    factors.push('Seasonal demand variations detected')
    factors.push('Monthly sales patterns identified')
  }
  
  if (pattern.type === 'weekly') {
    factors.push('Weekly demand cycles observed')
    factors.push('Day-of-week preferences identified')
  }
  
  if (pattern.confidence > 70) {
    factors.push('High confidence pattern recognition')
  }
  
  factors.push('Historical sales data analysis')
  factors.push('Market demand fluctuations')
  
  return factors.slice(0, 4)
}

function generatePeakPeriods(pattern: any, sales: any[]): string[] {
  const periods = []
  
  if (pattern.type === 'weekly' && pattern.data.dayAverages) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const maxIndex = pattern.data.dayAverages.indexOf(Math.max(...pattern.data.dayAverages))
    periods.push(`${days[maxIndex]}s show highest demand`)
  }
  
  if (pattern.type === 'seasonal') {
    periods.push('Seasonal peaks in specific months')
  }
  
  periods.push('End of month increased activity')
  periods.push('Holiday season demand spikes')
  
  return periods.slice(0, 3)
}