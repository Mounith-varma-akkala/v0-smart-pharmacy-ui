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
    const { action, review_notes } = await request.json()

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      )
    }

    const status = action === 'approve' ? 'approved' : 'rejected'

    // Update the request
    const { data: updatedRequest, error: updateError } = await supabase
      .from('low_stock_requests')
      .update({
        status,
        reviewed_by: 'current_admin', // In real app, get from auth
        reviewed_at: new Date().toISOString(),
        review_notes
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) throw updateError

    // If approved, create a purchase order or update inventory threshold
    if (action === 'approve') {
      // Get request details
      const { data: requestDetails, error: detailsError } = await supabase
        .from('low_stock_requests')
        .select(`
          *,
          medicines (name, current_price),
          inventory (quantity, reorder_threshold)
        `)
        .eq('id', params.id)
        .single()

      if (!detailsError && requestDetails) {
        // Create a purchase order
        await supabase
          .from('purchase_orders')
          .insert([{
            medicine_id: requestDetails.medicine_id,
            quantity: requestDetails.requested_quantity,
            unit_price: requestDetails.medicines?.current_price || 0,
            total_amount: (requestDetails.medicines?.current_price || 0) * requestDetails.requested_quantity,
            order_type: 'low_stock_replenishment',
            status: 'pending',
            created_by: 'current_admin',
            notes: `Approved low stock request: ${review_notes}`
          }])

        // Update inventory threshold if needed
        const newThreshold = Math.max(
          requestDetails.inventory?.reorder_threshold || 0,
          requestDetails.requested_quantity
        )

        await supabase
          .from('inventory')
          .update({ reorder_threshold: newThreshold })
          .eq('medicine_id', requestDetails.medicine_id)
      }
    }

    // Log the review action
    await supabase
      .from('audit_logs')
      .insert([{
        action: `low_stock_request_${action}d`,
        table_name: 'low_stock_requests',
        record_id: params.id,
        user_id: 'current_admin',
        timestamp: new Date().toISOString(),
        details: {
          action,
          review_notes,
          request_id: params.id
        }
      }])

    return NextResponse.json({ 
      success: true, 
      request: updatedRequest 
    })

  } catch (error) {
    console.error('Error reviewing request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to review request' },
      { status: 500 }
    )
  }
}