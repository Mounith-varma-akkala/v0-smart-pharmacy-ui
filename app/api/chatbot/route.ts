import { NextRequest, NextResponse } from 'next/server'

const WEBHOOK_URL = 'https://shyam.mlritcie.in/webhook/223b953b-ef97-4800-a1be-8b05890044c1/chat'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    // Send message to the webhook
    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message.trim(),
        timestamp: new Date().toISOString(),
      }),
    })

    if (!webhookResponse.ok) {
      throw new Error(`Webhook responded with status: ${webhookResponse.status}`)
    }

    const webhookData = await webhookResponse.json()
    
    // Process the webhook response and extract the bot's reply
    let botReply = 'I apologize, but I encountered an issue processing your request.'
    
    // Handle different possible response formats from the webhook
    if (typeof webhookData === 'string') {
      botReply = webhookData
    } else if (webhookData.response) {
      botReply = webhookData.response
    } else if (webhookData.message) {
      botReply = webhookData.message
    } else if (webhookData.reply) {
      botReply = webhookData.reply
    } else if (webhookData.answer) {
      botReply = webhookData.answer
    } else if (webhookData.text) {
      botReply = webhookData.text
    } else if (webhookData.data && webhookData.data.response) {
      botReply = webhookData.data.response
    }

    // Clean up the response text
    botReply = cleanBotResponse(botReply)

    return NextResponse.json({
      success: true,
      response: botReply,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Chatbot API Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get response from chatbot',
      response: 'I apologize, but I\'m having trouble connecting to my knowledge base right now. Please try again in a moment.',
    }, { status: 500 })
  }
}

// Function to clean and format the bot response
function cleanBotResponse(response: string): string {
  if (typeof response !== 'string') {
    return 'I apologize, but I received an unexpected response format.'
  }

  // Remove any HTML tags
  let cleaned = response.replace(/<[^>]*>/g, '')
  
  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  
  // Remove any JSON-like formatting if present
  cleaned = cleaned.replace(/^\{.*?\}$/, (match) => {
    try {
      const parsed = JSON.parse(match)
      return parsed.message || parsed.response || parsed.text || match
    } catch {
      return match
    }
  })

  // Ensure the response isn't empty
  if (!cleaned || cleaned.length < 3) {
    return 'I understand your question, but I need a bit more information to provide a helpful response.'
  }

  // Capitalize first letter if needed
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
  
  // Ensure it ends with proper punctuation
  if (!/[.!?]$/.test(cleaned)) {
    cleaned += '.'
  }

  return cleaned
}