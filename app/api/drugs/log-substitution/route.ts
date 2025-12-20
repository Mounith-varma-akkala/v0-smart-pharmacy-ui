import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { 
      original_drug_id, 
      substitute_drug_id, 
      quantity, 
      pharmacist_confirmed, 
      reason 
    } = await request.json()

    // Log the substitution in the audit trail
    const { data: substitutionLog, error: logError } = await supabase
      .from('drug_substitution_logs')
      .insert([{
        original_medicine_id: original_drug_id,
        substitute_medicine_id: substitute_drug_id,
        quantity,
        pharmacist_confirmed,
        reason,
        substitution_date: new Date().toISOString(),
        pharmacist_id: 'current_user', // In real app, get from auth
        notes: `Substitution confirmed due to ${reason}`
      }])
      .select()
      .single()

    if (logError) throw logError

    // Also log in general audit logs
    await supabase
      .from('audit_logs')
      .insert([{
        action: 'drug_substitution',
        table_name: 'drug_substitution_logs',
        record_id: substitutionLog.id,
        user_id: 'current_user',
        timestamp: new Date().toISOString(),
        details: {
          original_drug_id,
          substitute_drug_id,
          quantity,
          reason
        }
      }])

    return NextResponse.json({ 
      success: true, 
      substitution_log: substitutionLog 
    })

  } catch (error) {
    console.error('Error logging substitution:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to log substitution' },
      { status: 500 }
    )
  }
}