import { NextRequest, NextResponse } from 'next/server'

const WEBHOOK_URL = 'https://shyam.mlritcie.in/webhook/6e594a8e-7463-4151-9412-1335015568a3'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    console.log('Testing webhook with message:', message)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

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
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    const responseText = await webhookResponse.text()
    
    let parsedResponse
    try {
      parsedResponse = JSON.parse(responseText)
    } catch {
      parsedResponse = responseText
    }

    return NextResponse.json({
      success: true,
      webhookStatus: webhookResponse.status,
      webhookHeaders: Object.fromEntries(webhookResponse.headers.entries()),
      rawResponse: responseText,
      parsedResponse: parsedResponse,
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