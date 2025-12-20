import { NextRequest, NextResponse } from 'next/server'

const PHARMACY_KEYWORDS = [
  // Inventory related
  'stock', 'inventory', 'quantity', 'available', 'out of stock', 'restock',
  // Medicines and drugs
  'medicine', 'drug', 'medication', 'tablet', 'capsule', 'syrup', 'injection',
  'paracetamol', 'aspirin', 'antibiotic', 'prescription', 'dosage',
  // Expiry related
  'expiry', 'expire', 'expired', 'expiration', 'shelf life', 'batch',
  // Suppliers
  'supplier', 'vendor', 'manufacturer', 'order', 'purchase', 'delivery',
  // Reports and analytics
  'sales', 'report', 'analytics', 'revenue', 'profit', 'demand',
  // Pharmacy operations
  'pharmacy', 'pharmacist', 'dispensing', 'patient', 'customer',
  'reorder', 'threshold', 'alert', 'notification'
]

const PHARMACY_INTENTS = {
  inventory_check: ['stock', 'inventory', 'available', 'quantity', 'check stock'],
  expiry_management: ['expiry', 'expire', 'expired', 'expiration', 'batch'],
  supplier_info: ['supplier', 'vendor', 'manufacturer', 'delivery'],
  reorder_status: ['reorder', 'order', 'purchase', 'request'],
  sales_reports: ['sales', 'report', 'revenue', 'analytics'],
  drug_information: ['medicine', 'drug', 'medication', 'dosage', 'information']
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 })
    }

    const lowerMessage = message.toLowerCase()
    
    // Check if message contains pharmacy-related keywords
    const pharmacyKeywordCount = PHARMACY_KEYWORDS.filter(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    ).length

    // Determine if the message is pharmacy-related
    const isPharmacyRelated = pharmacyKeywordCount > 0

    // Determine specific intent
    let detectedIntent = 'general_pharmacy'
    let maxScore = 0

    for (const [intent, keywords] of Object.entries(PHARMACY_INTENTS)) {
      const score = keywords.filter(keyword => 
        lowerMessage.includes(keyword.toLowerCase())
      ).length
      
      if (score > maxScore) {
        maxScore = score
        detectedIntent = intent
      }
    }

    // Calculate confidence score
    const confidence = isPharmacyRelated ? 
      Math.min(0.95, 0.3 + (pharmacyKeywordCount * 0.15)) : 0.1

    return NextResponse.json({
      success: true,
      isPharmacyRelated,
      intent: detectedIntent,
      confidence,
      keywordMatches: pharmacyKeywordCount
    })

  } catch (error) {
    console.error('Error analyzing pharmacy intent:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to analyze intent'
    }, { status: 500 })
  }
}