'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2, Send, Bot } from 'lucide-react'

export default function TestChatbotPage() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')

  const testWebhook = async () => {
    if (!message.trim()) return

    setLoading(true)
    setError('')
    setResponse('')
    setWebhookStatus('testing')

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
        }),
      })

      const data = await res.json()

      if (data.success) {
        setResponse(data.response)
        setWebhookStatus('success')
      } else {
        setError(data.error || 'Unknown error')
        setWebhookStatus('error')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
      setWebhookStatus('error')
    } finally {
      setLoading(false)
    }
  }

  const testQuestions = [
    "What medicines do you have for headache?",
    "Tell me about paracetamol dosage",
    "What are the side effects of ibuprofen?",
    "Do you have medicines for diabetes?",
    "What is the price of aspirin?",
    "Can you help me with cold medicine?",
    "What medicines are available for blood pressure?",
    "Tell me about antibiotic medicines"
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Chatbot Webhook Test</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Test Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Webhook Test
            </CardTitle>
            <CardDescription>
              Test the chatbot webhook integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Test Message:</label>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your question..."
                onKeyDown={(e) => e.key === 'Enter' && !loading && testWebhook()}
              />
            </div>

            <Button 
              onClick={testWebhook} 
              disabled={loading || !message.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send to Webhook
                </>
              )}
            </Button>

            {/* Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                webhookStatus === 'idle' ? 'bg-gray-400' :
                webhookStatus === 'testing' ? 'bg-yellow-500' :
                webhookStatus === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-sm">
                {webhookStatus === 'idle' ? 'Ready to test' :
                 webhookStatus === 'testing' ? 'Testing webhook...' :
                 webhookStatus === 'success' ? 'Webhook responded successfully' :
                 'Webhook test failed'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Response Display */}
        <Card>
          <CardHeader>
            <CardTitle>Webhook Response</CardTitle>
            <CardDescription>Response from the chatbot webhook</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {response && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <h4 className="font-medium text-green-800 mb-2">Bot Response:</h4>
                <p className="text-sm text-green-700 whitespace-pre-wrap">{response}</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <h4 className="font-medium text-red-800 mb-2">Error:</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {!response && !error && !loading && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-center">
                <p className="text-sm text-gray-600">No response yet. Send a message to test the webhook.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sample Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Sample Questions</CardTitle>
          <CardDescription>Click on any question to test it quickly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {testQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setMessage(question)}
                className="text-left justify-start h-auto p-3"
              >
                {question}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Webhook Information */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
          <CardDescription>Current webhook settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Webhook URL:</span>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
              https://shyam.mlritcie.in/webhook/6e594a8e-7463-4151-9412-1335015568a3
            </code>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Method:</span>
            <span className="text-sm">POST</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Content-Type:</span>
            <span className="text-sm">application/json</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}