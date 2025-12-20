import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function PATCH(request: NextRequest) {
  try {
    const { medicine_id, threshold } = await request.json()

    // Update the inventory threshold
    const { data, error } = await supabase
      .from('inventory')
      .update({ 
        reorder_threshold: threshold,
        updated_at: new Date().toISOString()
      })
      .eq('medicine_id', medicine_id)
      .select()
      .single()

    if (error) throw error

    // Log the threshold update
    await supabase
      .from('audit_logs')
      .insert([{
        action: 'threshold_updated',
        table_name: 'inventory',
        record_id: data.id,
        user_id: 'system', // In real app, get from auth
        timestamp: new Date().toISOString(),
        details: {
          medicine_id,
          new_threshold: threshold,
          reason: 'demand_pattern_analysis'
        }
      }])

    return NextResponse.json({ 
      success: true, 
      inventory: data 
    })

  } catch (error) {
    console.error('Error updating threshold:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update threshold' },
      { status: 500 }
    )
  }
}