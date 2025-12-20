import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the original drug details
    const { data: originalDrug, error: drugError } = await supabase
      .from('medicines')
      .select('*')
      .eq('id', params.id)
      .single()

    if (drugError) throw drugError

    // Find substitutes based on composition similarity
    const { data: substitutes, error: substitutesError } = await supabase
      .from('drug_substitutes')
      .select(`
        *,
        substitute_medicine:medicines!substitute_medicine_id (
          id,
          name,
          composition,
          manufacturer,
          current_price,
          form,
          strength,
          requires_prescription
        ),
        inventory (
          quantity
        )
      `)
      .eq('original_medicine_id', params.id)
      .eq('is_active', true)
      .order('equivalency_score', { ascending: false })

    if (substitutesError) throw substitutesError

    // Process and format the substitutes data
    const processedSubstitutes = substitutes?.map(sub => ({
      id: sub.substitute_medicine.id,
      name: sub.substitute_medicine.name,
      manufacturer: sub.substitute_medicine.manufacturer,
      composition: sub.substitute_medicine.composition,
      strength: sub.substitute_medicine.strength,
      form: sub.substitute_medicine.form,
      price: sub.substitute_medicine.current_price,
      stock_quantity: sub.inventory?.quantity || 0,
      equivalency_score: sub.equivalency_score,
      substitution_notes: sub.notes,
      contraindications: sub.contraindications || [],
      requires_prescription: sub.substitute_medicine.requires_prescription
    })) || []

    // If no direct substitutes found, try to find by composition similarity
    if (processedSubstitutes.length === 0) {
      const { data: similarDrugs, error: similarError } = await supabase
        .from('medicines')
        .select(`
          *,
          inventory (quantity)
        `)
        .ilike('composition', `%${originalDrug.composition.split(' ')[0]}%`)
        .neq('id', params.id)
        .gt('inventory.quantity', 0)
        .limit(5)

      if (!similarError && similarDrugs) {
        const similarSubstitutes = similarDrugs.map(drug => ({
          id: drug.id,
          name: drug.name,
          manufacturer: drug.manufacturer,
          composition: drug.composition,
          strength: drug.strength,
          form: drug.form,
          price: drug.current_price,
          stock_quantity: drug.inventory?.quantity || 0,
          equivalency_score: calculateCompositionSimilarity(originalDrug.composition, drug.composition),
          substitution_notes: 'Similar composition detected. Please verify clinical equivalency.',
          contraindications: [],
          requires_prescription: drug.requires_prescription
        }))

        return NextResponse.json({ 
          success: true, 
          substitutes: similarSubstitutes 
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      substitutes: processedSubstitutes 
    })

  } catch (error) {
    console.error('Error fetching drug substitutes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch drug substitutes' },
      { status: 500 }
    )
  }
}

function calculateCompositionSimilarity(comp1: string, comp2: string): number {
  // Simple composition similarity calculation
  const words1 = comp1.toLowerCase().split(/[\s,+]+/)
  const words2 = comp2.toLowerCase().split(/[\s,+]+/)
  
  const commonWords = words1.filter(word => words2.includes(word))
  const totalWords = new Set([...words1, ...words2]).size
  
  return Math.round((commonWords.length / totalWords) * 100)
}