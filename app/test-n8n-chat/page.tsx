'use client'

import { useState } from 'react'
import N8nChatbot, { PharmacyQuickActions, EmbeddedPharmacyChat } from '@/components/n8n-chatbot'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function TestN8nChatPage() {
  const [activeMode, setActiveMode] = useState<'floating' | 'embedded' | 'none'>('none')

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">n8n Chat Integration Test</h1>
        <p className="text-muted-foreground">
          Test the customized n8n chat widget for Smart Pharmacy
        </p>
        <Badge variant="outline" className="text-sm">
          Webhook: https://shyam.mlritcie.in/webhook/223b953b-ef97-4800-a1be-8b05890044c1/chat
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Floating Chat Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💬 Floating Chat Widget
              {activeMode === 'floating' && <Badge variant="default">Active</Badge>}
            </CardTitle>
            <CardDescription>
              Traditional floating chat button in bottom-right corner
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p><strong>Features:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Floating button with pharmacy branding</li>
                <li>Custom welcome messages</li>
                <li>Quick action buttons</li>
                <li>Pharmacy-specific styling</li>
                <li>Mobile responsive</li>
              </ul>
            </div>
            <Button 
              onClick={() => setActiveMode(activeMode === 'floating' ? 'none' : 'floating')}
              variant={activeMode === 'floating' ? 'destructive' : 'default'}
            >
              {activeMode === 'floating' ? 'Hide Floating Chat' : 'Show Floating Chat'}
            </Button>
          </CardContent>
        </Card>

        {/* Embedded Chat Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📱 Embedded Chat Widget
              {activeMode === 'embedded' && <Badge variant="default">Active</Badge>}
            </CardTitle>
            <CardDescription>
              Embedded chat for product pages and dedicated support sections
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p><strong>Features:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Inline integration</li>
                <li>Product-specific context</li>
                <li>No welcome screen</li>
                <li>Focused medicine assistance</li>
              </ul>
            </div>
            <Button 
              onClick={() => setActiveMode(activeMode === 'embedded' ? 'none' : 'embedded')}
              variant={activeMode === 'embedded' ? 'destructive' : 'default'}
            >
              {activeMode === 'embedded' ? 'Hide Embedded Chat' : 'Show Embedded Chat'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Details */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Configuration Details</CardTitle>
          <CardDescription>
            Current n8n chat configuration for Smart Pharmacy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Webhook Configuration</h4>
              <div className="text-sm space-y-1">
                <p><strong>URL:</strong> https://shyam.mlritcie.in/webhook/...</p>
                <p><strong>Method:</strong> POST</p>
                <p><strong>Content-Type:</strong> application/json</p>
                <p><strong>Input Key:</strong> message</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Pharmacy Features</h4>
              <div className="text-sm space-y-1">
                <p>• Medicine information & dosages</p>
                <p>• Drug interactions & side effects</p>
                <p>• Health advice & recommendations</p>
                <p>• Prescription queries</p>
                <p>• Stock availability</p>
                <p>• Store hours & location</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Demo */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Quick Actions Demo</CardTitle>
          <CardDescription>
            Pharmacy-specific quick action buttons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PharmacyQuickActions 
            onActionClick={(message) => {
              alert(`Quick action clicked: "${message}"\n\nThis would send the message to the chat widget.`)
            }} 
          />
        </CardContent>
      </Card>

      {/* Embedded Chat Demo */}
      {activeMode === 'embedded' && (
        <Card>
          <CardHeader>
            <CardTitle>💊 Embedded Chat Demo</CardTitle>
            <CardDescription>
              Example of embedded chat for a medicine page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmbeddedPharmacyChat productName="Paracetamol 500mg" />
          </CardContent>
        </Card>
      )}

      {/* Floating Chat Widget */}
      {activeMode === 'floating' && <N8nChatbot />}

      {/* Integration Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Integration Instructions</CardTitle>
          <CardDescription>
            How to use the n8n chat widget in your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">React Component Usage</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`import N8nChatbot from '@/components/n8n-chatbot'

// Floating chat
<N8nChatbot />

// Embedded chat
<N8nChatbot embedded={true} />

// Custom configuration
<N8nChatbot config={customConfig} />`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">HTML Integration</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`<!-- Load n8n chat script -->
<script src="https://cdn.jsdelivr.net/npm/@n8n/chat@latest/dist/chat.bundle.js"></script>

<!-- Load pharmacy configuration -->
<script src="js/pharmacy-chat-config.js"></script>

<!-- Initialize chat -->
<script>initPharmacyChat('floating');</script>`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>✅ Testing Checklist</CardTitle>
          <CardDescription>
            Verify these features are working correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Basic Functionality</h4>
              <ul className="text-sm space-y-1">
                <li>□ Chat button appears and is clickable</li>
                <li>□ Chat window opens with welcome message</li>
                <li>□ User can type and send messages</li>
                <li>□ Webhook receives messages correctly</li>
                <li>□ Bot responses are displayed properly</li>
                <li>□ Chat can be minimized and reopened</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Advanced Features</h4>
              <ul className="text-sm space-y-1">
                <li>□ Quick actions work correctly</li>
                <li>□ Custom styling is applied</li>
                <li>□ Mobile responsiveness works</li>
                <li>□ Error handling functions properly</li>
                <li>□ Session persistence works</li>
                <li>□ Embedded mode displays correctly</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}