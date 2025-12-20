'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bot, X, Send, Loader2, AlertTriangle, CheckCircle, Pill } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ChatMessage {
  id: number
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  isLoading?: boolean
  intent?: string
  confidence?: number
  isPharmacyRelated?: boolean
}

const PHARMACY_INTENTS = [
  'inventory_check',
  'expiry_management',
  'supplier_info',
  'reorder_status',
  'sales_reports',
  'drug_information',
  'stock_levels',
  'price_inquiry',
  'substitution_query',
  'demand_forecast'
]

const QUICK_ACTIONS = [
  { label: 'Check Stock Levels', query: 'Show me current stock levels for critical medicines' },
  { label: 'Expiry Alerts', query: 'What medicines are expiring soon?' },
  { label: 'Reorder Status', query: 'Show me pending reorder requests' },
  { label: 'Sales Report', query: 'Generate today\'s sales summary' },
  { label: 'Supplier Info', query: 'List top performing suppliers' },
  { label: 'Drug Information', query: 'I need information about a specific medicine' }
]

export default function PharmacyChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "Hello! I'm your pharmacy assistant. I can help you with inventory, expiry management, suppliers, reports, and drug information. How can I assist you today?",
      sender: "bot",
      timestamp: new Date(),
      isPharmacyRelated: true
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (messageText?: string) => {
    const message = messageText || inputValue.trim()
    if (!message || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: message,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: Date.now() + 1,
      text: "Analyzing your pharmacy query...",
      sender: "bot",
      timestamp: new Date(),
      isLoading: true,
    }
    setMessages((prev) => [...prev, loadingMessage])

    try {
      // First, check if the query is pharmacy-related
      const intentResponse = await fetch('/api/chatbot/pharmacy-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })

      const intentData = await intentResponse.json()

      if (!intentData.isPharmacyRelated) {
        // Remove loading message and add rejection response
        setMessages((prev) => {
          const withoutLoading = prev.filter(msg => !msg.isLoading)
          const rejectionResponse: ChatMessage = {
            id: Date.now() + 2,
            text: "I'm sorry, but I can only assist with pharmacy-related queries such as inventory management, expiry tracking, supplier information, reorders, and drug information. Please ask me something related to pharmacy operations.",
            sender: "bot",
            timestamp: new Date(),
            isPharmacyRelated: false
          }
          return [...withoutLoading, rejectionResponse]
        })
        return
      }

      // If pharmacy-related, process with the main chatbot
      const response = await fetch('/api/chatbot/pharmacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message,
          intent: intentData.intent,
          confidence: intentData.confidence
        })
      })

      const data = await response.json()

      // Remove loading message and add bot response
      setMessages((prev) => {
        const withoutLoading = prev.filter(msg => !msg.isLoading)
        const botResponse: ChatMessage = {
          id: Date.now() + 2,
          text: data.response || 'I apologize, but I encountered an issue processing your pharmacy query. Please try again.',
          sender: "bot",
          timestamp: new Date(),
          intent: intentData.intent,
          confidence: intentData.confidence,
          isPharmacyRelated: true
        }
        return [...withoutLoading, botResponse]
      })

    } catch (error) {
      console.error('Pharmacy chatbot error:', error)
      
      setMessages((prev) => {
        const withoutLoading = prev.filter(msg => !msg.isLoading)
        const errorResponse: ChatMessage = {
          id: Date.now() + 2,
          text: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.',
          sender: "bot",
          timestamp: new Date(),
        }
        return [...withoutLoading, errorResponse]
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage()
  }

  const getIntentColor = (intent?: string) => {
    const colors = {
      inventory_check: 'bg-blue-100 text-blue-800',
      expiry_management: 'bg-red-100 text-red-800',
      supplier_info: 'bg-green-100 text-green-800',
      reorder_status: 'bg-yellow-100 text-yellow-800',
      sales_reports: 'bg-purple-100 text-purple-800',
      drug_information: 'bg-pink-100 text-pink-800'
    }
    return colors[intent as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <>
      {/* Chatbot Button */}
      <motion.div 
        initial={{ scale: 0 }} 
        animate={{ scale: 1 }} 
        className="fixed bottom-6 right-6 z-50"
      >
        <Button 
          onClick={() => setIsOpen(!isOpen)} 
          size="lg" 
          className="w-16 h-16 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Pill className="w-6 h-6" />}
        </Button>
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)]"
          >
            <Card className="flex flex-col h-[600px] max-h-[calc(100vh-8rem)] shadow-2xl">
              {/* Header */}
              <CardHeader className="p-4 border-b bg-blue-600 text-white rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Pill className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Pharmacy Assistant</CardTitle>
                    <CardDescription className="text-blue-100 text-sm">
                      Pharmacy operations only
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              {/* Quick Actions */}
              <div className="p-3 border-b bg-gray-50">
                <p className="text-xs text-gray-600 mb-2">Quick Actions:</p>
                <div className="flex flex-wrap gap-1">
                  {QUICK_ACTIONS.slice(0, 3).map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs h-6 px-2"
                      onClick={() => sendMessage(action.query)}
                      disabled={isLoading}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl ${
                        message.sender === "user" 
                          ? "bg-blue-600 text-white" 
                          : message.isPharmacyRelated === false
                          ? "bg-red-100 border border-red-200"
                          : "bg-gray-100"
                      }`}
                    >
                      <div className="space-y-2">
                        {message.isLoading && (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Processing...</span>
                          </div>
                        )}
                        
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        
                        {message.intent && (
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${getIntentColor(message.intent)}`}>
                              {message.intent.replace('_', ' ').toUpperCase()}
                            </Badge>
                            {message.confidence && (
                              <span className="text-xs text-gray-500">
                                {Math.round(message.confidence * 100)}% confidence
                              </span>
                            )}
                          </div>
                        )}

                        {message.isPharmacyRelated === false && (
                          <Alert className="mt-2">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                              Non-pharmacy query detected
                            </AlertDescription>
                          </Alert>
                        )}

                        {message.isPharmacyRelated === true && message.sender === "bot" && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            <span>Pharmacy-verified response</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask about inventory, expiry, suppliers..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                <div className="mt-2 flex flex-wrap gap-1">
                  {QUICK_ACTIONS.slice(3).map((action, index) => (
                    <Button
                      key={index + 3}
                      variant="ghost"
                      size="sm"
                      className="text-xs h-6 px-2 text-gray-600 hover:text-gray-900"
                      onClick={() => sendMessage(action.query)}
                      disabled={isLoading}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}