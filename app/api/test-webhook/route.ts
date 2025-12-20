import { NextRequest, NextResponse } from 'next/server'

const WEBHOOK_URL = 'https://shyam.mlritcie.in/webhook/6e594a8e-7463-4151-9412-1335015568a3'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    console.log('Testing webhook with message:', message)
    
    // No timeout - wait indefinitely for webhook response
    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        message: message || 'Hello, this is a test message',
        timestamp: new Date().toISOString(),
        source: 'webhook-test'
      })
      // No timeout - wait as long as needed
    })

    const responseText = await webhookResponse.text()
    
    let parsedResponse
    let isJsonResponse = false
    
    try {
      parsedResponse = JSON.parse(responseText)
      isJsonResponse = true
    } catch {
      parsedResponse = responseText
      isJsonResponse = false
    }

    return NextResponse.json({
      success: true,
      webhookStatus: webhookResponse.status,
      webhookHeaders: Object.fromEntries(webhookResponse.headers.entries()),
      rawResponse: responseText,
      parsedResponse: parsedResponse,
      isJsonResponse: isJsonResponse,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Webhook test error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Webhook test endpoint',
    webhookUrl: WEBHOOK_URL,
    usage: 'POST with { "message": "your test message" }'
  })
}