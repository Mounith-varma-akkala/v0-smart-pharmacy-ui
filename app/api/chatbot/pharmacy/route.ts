import { NextRequest, NextResponse } from 'next/server'

const WEBHOOK_URL = 'https://shyam.mlritcie.in/webhook/6e594a8e-7463-4151-9412-1335015568a3'

export async function POST(request: NextRequest) {
  try {
    const { message, intent, confidence } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 })
    }

    console.log('Processing pharmacy query:', message, 'Intent:', intent)

    // Send to webhook with pharmacy context
    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        message: message.trim(),
        context: 'pharmacy_operations',
        intent: intent,
        confidence: confidence,
        timestamp: new Date().toISOString(),
        source: 'pharmacy-chatbot'
      })
    })

    console.log('Webhook response status:', webhookResponse.status)

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text()
      console.error('Webhook error:', errorText)
      throw new Error(`Webhook responded with status: ${webhookResponse.status}`)
    }

    const responseText = await webhookResponse.text()
    console.log('Raw webhook response:', responseText)

    let webhookData
    let isJsonResponse = false
    
    try {
      webhookData = JSON.parse(responseText)
      isJsonResponse = true
    } catch {
      webhookData = responseText
    }

    // Extract response
    let botReply = 'I apologize, but I encountered an issue processing your pharmacy query.'
    
    if (isJsonResponse && webhookData && typeof webhookData === 'object') {
      botReply = webhookData.response || 
                 webhookData.message || 
                 webhookData.reply || 
                 webhookData.answer || 
                 webhookData.text || 
                 webhookData.output ||
                 JSON.stringify(webhookData, null, 2)
    } else if (typeof webhookData === 'string') {
      botReply = webhookData
    }

    return NextResponse.json({
      success: true,
      response: botReply,
      intent: intent,
      confidence: confidence,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Pharmacy chatbot error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process pharmacy query',
      response: 'I apologize, but I\'m having trouble processing your pharmacy query right now. Please try again in a moment.',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}