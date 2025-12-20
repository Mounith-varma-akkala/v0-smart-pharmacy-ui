import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { enabled } = await request.json()
    
    const { data, error } = await supabase
      .from('suppliers')
      .update({ auto_reorder_enabled: enabled })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      supplier: data 
    })

  } catch (error) {
    console.error('Error updating auto-reorder:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update auto-reorder setting' },
      { status: 500 }
    )
  }
}