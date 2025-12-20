import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('medicines')
      .select('count', { count: 'exact', head: true })

    if (connectionError) {
      return NextResponse.json({
        success: false,
        error: 'Connection failed',
        details: connectionError.message,
        suggestion: 'Check your Supabase credentials in .env.local'
      }, { status: 500 })
    }

    // Test if we have data
    const { data: medicines, error: medicinesError } = await supabase
      .from('medicines')
      .select('id, name, category, quantity, unit_price')
      .limit(5)

    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('id, quantity, total_price, sale_date')
      .limit(5)

    const { data: suppliers, error: suppliersError } = await supabase
      .from('suppliers')
      .select('id, name, city')
      .limit(3)

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      connection: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        keyPresent: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0
      },
      data: {
        medicinesCount: connectionTest?.count || 0,
        medicines: medicines || [],
        sales: sales || [],
        suppliers: suppliers || [],
        hasData: {
          medicines: (medicines?.length || 0) > 0,
          sales: (sales?.length || 0) > 0,
          suppliers: (suppliers?.length || 0) > 0
        }
      },
      errors: {
        medicines: medicinesError?.message,
        sales: salesError?.message,
        suppliers: suppliersError?.message
      }
    })

  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Check your environment variables and Supabase project status'
    }, { status: 500 })
  }
}