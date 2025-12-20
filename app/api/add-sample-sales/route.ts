import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()

    // First, get some medicine IDs to use in sales
    const { data: medicines, error: medicinesError } = await supabase
      .from('medicines')
      .select('id, name, price')
      .limit(5)

    if (medicinesError) {
      throw medicinesError
    }

    if (!medicines || medicines.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No medicines found. Please add some medicines first.'
      }, { status: 400 })
    }

    // Create sample sales data
    const sampleSales = []
    const today = new Date()
    
    for (let i = 0; i < 10; i++) {
      const medicine = medicines[Math.floor(Math.random() * medicines.length)]
      const quantity = Math.floor(Math.random() * 5) + 1 // 1-5 items
      const saleDate = new Date(today)
      saleDate.setDate(today.getDate() - Math.floor(Math.random() * 7)) // Last 7 days
      
      sampleSales.push({
        medicine_id: medicine.id,
        quantity: quantity,
        total_price: quantity * medicine.price,
        sale_date: saleDate.toISOString(),
      })
    }

    // Insert sample sales
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .insert(sampleSales)
      .select()

    if (salesError) {
      throw salesError
    }

    return NextResponse.json({
      success: true,
      message: `Added ${sampleSales.length} sample sales records`,
      data: salesData
    })

  } catch (error) {
    console.error('Error adding sample sales:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}