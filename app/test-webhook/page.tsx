'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function TestWebhookPage() {
  const [message, setMessage] = useState('Hello, can you help me with medicine information?')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testWebhook = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Webhook Test</h1>
        <p className="text-muted-foreground">
          Test the webhook endpoint directly to debug response issues
        </p>
        <Badge variant="outline" className="text-sm">
          https://shyam.mlritcie.in/webhook/6e594a8e-7463-4151-9412-1335015568a3
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Message</CardTitle>
          <CardDescription>
            Send a test message to the webhook and see the raw response
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Message:</label>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter test message..."
            />
          </div>
          
          <Button 
            onClick={testWebhook} 
            disabled={isLoading || !message.trim()}
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Test Webhook'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Test Result
              <Badge variant={result.success ? 'default' : 'destructive'}>
                {result.success ? 'Success' : 'Failed'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Raw webhook response and debugging information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.success && (
                <>
                  <div>
                    <h4 className="font-semibold mb-2">Webhook Status</h4>
                    <Badge variant="outline">{result.webhookStatus}</Badge>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Raw Response</h4>
                    <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                      {result.rawResponse}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Parsed Response</h4>
                    <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                      {JSON.stringify(result.parsedResponse, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Response Headers</h4>
                    <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                      {JSON.stringify(result.webhookHeaders, null, 2)}
                    </pre>
                  </div>
                </>
              )}

              {!result.success && (
                <div>
                  <h4 className="font-semibold mb-2 text-red-600">Error</h4>
                  <pre className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-800">
                    {result.error}
                  </pre>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Timestamp: {result.timestamp}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Debugging Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>1. Check webhook status:</strong> Should return 200 for successful requests</p>
            <p><strong>2. Examine raw response:</strong> See exactly what the webhook returns</p>
            <p><strong>3. Check response format:</strong> Verify if it's JSON, plain text, or other format</p>
            <p><strong>4. Look for response fields:</strong> Common fields are 'response', 'message', 'reply', 'answer'</p>
            <p><strong>5. Check headers:</strong> Verify content-type and other response headers</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}