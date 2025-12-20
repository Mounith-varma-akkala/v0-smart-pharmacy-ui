import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const alertDays = parseInt(searchParams.get('alert_days') || '30')

    const { data: batches, error } = await supabase
      .from('inventory_batches')
      .select(`
        *,
        medicines (name),
        suppliers (name)
      `)
      .order('expiry_date', { ascending: true }) // FEFO ordering

    if (error) throw error

    const currentDate = new Date()
    
    const processedBatches = batches?.map(batch => {
      const expiryDate = new Date(batch.expiry_date)
      const daysToExpiry = Math.ceil((expiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
      
      let expiryStatus: 'expired' | 'critical' | 'warning' | 'safe'
      if (daysToExpiry < 0) {
        expiryStatus = 'expired'
      } else if (daysToExpiry <= 7) {
        expiryStatus = 'critical'
      } else if (daysToExpiry <= alertDays) {
        expiryStatus = 'warning'
      } else {
        expiryStatus = 'safe'
      }

      return {
        id: batch.id,
        medicine_name: batch.medicines?.name || 'Unknown Medicine',
        batch_number: batch.batch_number,
        expiry_date: batch.expiry_date,
        quantity: batch.quantity,
        cost_price: batch.cost_price,
        supplier_name: batch.suppliers?.name || 'Unknown Supplier',
        days_to_expiry: daysToExpiry,
        expiry_status: expiryStatus,
        suggested_for_sale: expiryStatus === 'warning' || expiryStatus === 'critical'
      }
    }) || []

    return NextResponse.json({ 
      success: true, 
      batches: processedBatches 
    })

  } catch (error) {
    console.error('Error fetching inventory batches:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory batches' },
      { status: 500 }
    )
  }
}

// FEFO Logic - Get next batch to sell for a medicine
export async function POST(request: NextRequest) {
  try {
    const { medicine_id, quantity_needed } = await request.json()

    const { data: batches, error } = await supabase
      .from('inventory_batches')
      .select('*')
      .eq('medicine_id', medicine_id)
      .gt('quantity', 0)
      .order('expiry_date', { ascending: true }) // FEFO: earliest expiry first

    if (error) throw error

    let remainingQuantity = quantity_needed
    const selectedBatches = []

    for (const batch of batches || []) {
      if (remainingQuantity <= 0) break

      const quantityFromBatch = Math.min(batch.quantity, remainingQuantity)
      selectedBatches.push({
        batch_id: batch.id,
        batch_number: batch.batch_number,
        quantity: quantityFromBatch,
        expiry_date: batch.expiry_date
      })

      remainingQuantity -= quantityFromBatch
    }

    return NextResponse.json({ 
      success: true, 
      selected_batches: selectedBatches,
      remaining_quantity: remainingQuantity
    })

  } catch (error) {
    console.error('Error applying FEFO logic:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to apply FEFO logic' },
      { status: 500 }
    )
  }
}