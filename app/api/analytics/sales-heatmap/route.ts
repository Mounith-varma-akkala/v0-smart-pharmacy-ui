import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Get sales data from last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    const { data: salesData, error } = await supabase
      .from('sales')
      .select('created_at, quantity')
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (error) throw error

    // Initialize heatmap data structure
    const heatmapData = []
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    // Initialize all day-hour combinations
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      for (let hour = 0; hour < 24; hour++) {
        heatmapData.push({
          day: days[dayIndex],
          hour: hour,
          sales: 0
        })
      }
    }

    // Process sales data
    salesData?.forEach(sale => {
      const saleDate = new Date(sale.created_at)
      const dayOfWeek = saleDate.getDay() // 0 = Sunday
      const hour = saleDate.getHours()
      
      const dataPoint = heatmapData.find(d => 
        d.day === days[dayOfWeek] && d.hour === hour
      )
      
      if (dataPoint) {
        dataPoint.sales += sale.quantity
      }
    })

    return NextResponse.json({ 
      success: true, 
      heatmap: heatmapData 
    })

  } catch (error) {
    console.error('Error generating sales heatmap:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate sales heatmap' },
      { status: 500 }
    )
  }
}