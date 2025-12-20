import { NextRequest, NextResponse } from 'next/server'

const WEBHOOK_URL = 'https://shyam.mlritcie.in/webhook/6e594a8e-7463-4151-9412-1335015568a3'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    console.log('Sending message to webhook:', message.trim())

    // Send message to the webhook with proper timeout and error handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const webhookResponse = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          timestamp: new Date().toISOString(),
          source: 'pharmacy-chat'
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      console.log('Webhook response status:', webhookResponse.status)
      console.log('Webhook response headers:', Object.fromEntries(webhookResponse.headers.entries()))

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text()
        console.error('Webhook error response:', errorText)
        throw new Error(`Webhook responded with status: ${webhookResponse.status} - ${errorText}`)
      }

      // Get the response text first
      const responseText = await webhookResponse.text()
      console.log('Raw webhook response:', responseText)

      let webhookData
      try {
        // Try to parse as JSON
        webhookData = JSON.parse(responseText)
      } catch (parseError) {
        // If not JSON, treat as plain text
        console.log('Response is not JSON, treating as plain text')
        webhookData = responseText
      }

      console.log('Parsed webhook data:', webhookData)
      
      // Process the webhook response and extract the bot's reply
      let botReply = 'I apologize, but I encountered an issue processing your request.'
      
      // Handle different possible response formats from the webhook
      if (typeof webhookData === 'string') {
        botReply = webhookData
      } else if (webhookData && typeof webhookData === 'object') {
        // Try various common response field names
        botReply = webhookData.response || 
                   webhookData.message || 
                   webhookData.reply || 
                   webhookData.answer || 
                   webhookData.text || 
                   webhookData.output ||
                   webhookData.result ||
                   (webhookData.data && webhookData.data.response) ||
                   (webhookData.data && webhookData.data.message) ||
                   JSON.stringify(webhookData) // Fallback to stringified object
      }

      // Clean up the response text
      botReply = cleanBotResponse(botReply)
      console.log('Final bot reply:', botReply)

      return NextResponse.json({
        success: true,
        response: botReply,
        timestamp: new Date().toISOString(),
        debug: {
          webhookStatus: webhookResponse.status,
          rawResponse: responseText.substring(0, 200), // First 200 chars for debugging
          parsedType: typeof webhookData
        }
      })

    } catch (fetchError) {
      clearTimeout(timeoutId)
      
      if (fetchError.name === 'AbortError') {
        console.error('Webhook request timed out')
        throw new Error('Webhook request timed out after 30 seconds')
      }
      
      console.error('Webhook fetch error:', fetchError)
      throw fetchError
    }

  } catch (error) {
    console.error('Chatbot API Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get response from chatbot',
      response: 'I apologize, but I\'m having trouble connecting to my knowledge base right now. Please try again in a moment.',
      timestamp: new Date().toISOString()
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