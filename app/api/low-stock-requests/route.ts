import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { data: requests, error } = await supabase
      .from('low_stock_requests')
      .select(`
        *,
        medicines (name),
        inventory (quantity)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    const processedRequests = requests?.map(request => ({
      id: request.id,
      medicine_name: request.medicines?.name || 'Unknown Medicine',
      current_stock: request.inventory?.quantity || 0,
      requested_quantity: request.requested_quantity,
      reason: request.reason,
      urgency: request.urgency,
      status: request.status,
      requested_by: request.requested_by,
      requested_at: request.created_at,
      reviewed_by: request.reviewed_by,
      reviewed_at: request.reviewed_at,
      review_notes: request.review_notes
    })) || []

    return NextResponse.json({ 
      success: true, 
      requests: processedRequests 
    })

  } catch (error) {
    console.error('Error fetching low stock requests:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch requests' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { medicine_id, requested_quantity, reason, urgency } = await request.json()

    // Validate stock levels first
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('quantity, reorder_threshold')
      .eq('medicine_id', medicine_id)
      .single()

    if (inventoryError) {
      return NextResponse.json(
        { success: false, error: 'Medicine not found in inventory' },
        { status: 404 }
      )
    }

    // Check if stock is actually low
    if (inventory.quantity > inventory.reorder_threshold) {
      return NextResponse.json(
        { success: false, error: 'Stock levels are above reorder threshold' },
        { status: 400 }
      )
    }

    // Create the request
    const { data: newRequest, error: requestError } = await supabase
      .from('low_stock_requests')
      .insert([{
        medicine_id,
        requested_quantity,
        reason,
        urgency,
        status: 'pending',
        requested_by: 'current_user', // In real app, get from auth
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (requestError) throw requestError

    // Log the request creation
    await supabase
      .from('audit_logs')
      .insert([{
        action: 'low_stock_request_created',
        table_name: 'low_stock_requests',
        record_id: newRequest.id,
        user_id: 'current_user',
        timestamp: new Date().toISOString(),
        details: {
          medicine_id,
          requested_quantity,
          urgency,
          current_stock: inventory.quantity
        }
      }])

    return NextResponse.json({ 
      success: true, 
      request: newRequest 
    })

  } catch (error) {
    console.error('Error creating low stock request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create request' },
      { status: 500 }
    )
  }
}