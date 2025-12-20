import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Create a supply request
    const { data: supplyRequest, error } = await supabase
      .from('supply_requests')
      .insert([{
        supplier_id: params.id,
        requested_by: 'current_user', // In real app, get from auth
        request_date: new Date().toISOString(),
        status: 'pending',
        notes: 'Supply request from admin panel'
      }])
      .select()
      .single()

    if (error) throw error

    // Log the request for audit trail
    await supabase
      .from('audit_logs')
      .insert([{
        action: 'supply_request_created',
        table_name: 'supply_requests',
        record_id: supplyRequest.id,
        user_id: 'current_user',
        timestamp: new Date().toISOString(),
        details: { supplier_id: params.id }
      }])

    return NextResponse.json({ 
      success: true, 
      request: supplyRequest 
    })

  } catch (error) {
    console.error('Error creating supply request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create supply request' },
      { status: 500 }
    )
  }
}