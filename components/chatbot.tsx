"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bot, X, Send, Loader2, ChevronDown, ChevronRight, Calendar, Mail, ExternalLink } from "lucide-react"

interface Message {
  id: number
  text: string
  sender: "user" | "bot"
  timestamp: Date
  isLoading?: boolean
  responseData?: any // For structured JSON data
  isJsonResponse?: boolean
}

// Component to render JSON responses in a user-friendly structured format
function StructuredResponseRenderer({ data }: { data: any }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!data || typeof data !== 'object') {
    return null
  }

  // Function to get an appropriate icon for the field
  const getFieldIcon = (key: string, value: any) => {
    const lowerKey = key.toLowerCase()
    
    if (lowerKey.includes('date') || lowerKey.includes('time') || lowerKey.includes('expir')) {
      return <Calendar className="w-4 h-4 text-blue-500" />
    }
    if (lowerKey.includes('email') || lowerKey.includes('mail')) {
      return <Mail className="w-4 h-4 text-green-500" />
    }
    if (lowerKey.includes('url') || lowerKey.includes('link') || lowerKey.includes('website')) {
      return <ExternalLink className="w-4 h-4 text-purple-500" />
    }
    if (lowerKey.includes('stock') || lowerKey.includes('quantity') || lowerKey.includes('amount')) {
      return <span className="text-orange-500">📦</span>
    }
    if (lowerKey.includes('medicine') || lowerKey.includes('drug') || lowerKey.includes('medication')) {
      return <span className="text-red-500">💊</span>
    }
    if (lowerKey.includes('price') || lowerKey.includes('cost') || lowerKey.includes('money')) {
      return <span className="text-green-500">💰</span>
    }
    if (lowerKey.includes('status') || lowerKey.includes('state')) {
      return <span className="text-blue-500">📊</span>
    }
    
    return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
  }

  // Function to render different types of data in a user-friendly way
  const renderStructuredData = (obj: any): React.ReactNode => {
    if (!obj || typeof obj !== 'object') return null

    return (
      <div className="space-y-3">
        {Object.entries(obj).map(([key, value]) => {
          // Skip null or undefined values
          if (value === null || value === undefined) return null

          // Format the key to be more readable
          const formattedKey = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace(/_/g, ' ')

          return (
            <div key={key} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getFieldIcon(key, value)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    {formattedKey}
                  </h4>
                  <div className="text-sm text-gray-700">
                    {renderValue(value)}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">Not specified</span>
    }

    if (typeof value === 'boolean') {
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Yes' : 'No'}
        </span>
      )
    }

    if (typeof value === 'number') {
      return <span className="font-mono text-blue-600">{value.toLocaleString()}</span>
    }

    if (typeof value === 'string') {
      // Check if it's a date
      if (value.match(/^\d{4}-\d{2}-\d{2}/) || value.match(/^\d{1,2}\/\d{1,2}\/\d{4}/)) {
        try {
          const date = new Date(value)
          if (!isNaN(date.getTime())) {
            return <span className="text-purple-600">{date.toLocaleDateString()}</span>
          }
        } catch {}
      }

      // Check if it's a URL
      if (value.startsWith('http://') || value.startsWith('https://')) {
        return (
          <a href={value} target="_blank" rel="noopener noreferrer" 
             className="text-blue-600 hover:text-blue-800 underline">
            {value}
          </a>
        )
      }

      // Check if it's an email
      if (value.includes('@') && value.includes('.')) {
        return (
          <a href={`mailto:${value}`} className="text-blue-600 hover:text-blue-800 underline">
            {value}
          </a>
        )
      }

      // Regular string - format nicely
      if (value.length > 100) {
        const [showFull, setShowFull] = useState(false)
        return (
          <div>
            <p className="whitespace-pre-wrap">
              {showFull ? value : `${value.substring(0, 100)}...`}
            </p>
            <button
              onClick={() => setShowFull(!showFull)}
              className="text-blue-500 hover:text-blue-700 text-xs mt-1 underline"
            >
              {showFull ? 'Show less' : 'Show more'}
            </button>
          </div>
        )
      }

      return <span className="whitespace-pre-wrap">{value}</span>
    }

    if (Array.isArray(value)) {
      return (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-600 mt-0.5">
                {index + 1}
              </span>
              <div className="flex-1">
                {typeof item === 'object' ? (
                  <div className="bg-gray-50 rounded p-2">
                    {renderStructuredData(item)}
                  </div>
                ) : (
                  renderValue(item)
                )}
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (typeof value === 'object') {
      return (
        <div className="bg-gray-50 rounded-lg p-3 mt-2">
          {renderStructuredData(value)}
        </div>
      )
    }

    return <span>{String(value)}</span>
  }

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 mb-3"
      >
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <span>📋 Detailed Information</span>
      </button>
      
      {isExpanded && (
        <div className="bg-gray-50 rounded-lg p-4">
          {renderStructuredData(data)}
        </div>
      )}
    </div>
  )
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI pharmacy assistant. I can help you with medicine information, stock queries, health advice, and more. How can I assist you today?\n\nNote: I will wait for the AI to fully process your request, so responses may take a moment.",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputValue.trim()
    setInputValue("")
    setIsLoading(true)

    // Add loading message
    const loadingMessage: Message = {
      id: Date.now() + 1,
      text: "Processing your request... Please wait for the AI to respond.",
      sender: "bot",
      timestamp: new Date(),
      isLoading: true,
    }
    setMessages((prev) => [...prev, loadingMessage])

    try {
      console.log('Sending message to API:', currentInput)
      
      // Send message to webhook via our API
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
        }),
      })

      console.log('API response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error response:', errorText)
        throw new Error(`API responded with status: ${response.status}`)
      }

      const data = await response.json()
      console.log('API response data:', data)

      // Remove loading message and add bot response
      setMessages((prev) => {
        const withoutLoading = prev.filter(msg => !msg.isLoading)
        const botResponse: Message = {
          id: Date.now() + 2,
          text: data.response || data.error || 'I apologize, but I encountered an issue. Please try again.',
          sender: "bot",
          timestamp: new Date(),
          responseData: data.responseData, // Include structured data if available
          isJsonResponse: data.isJsonResponse
        }
        return [...withoutLoading, botResponse]
      })

      // Log debug info if available
      if (data.debug) {
        console.log('Debug info:', data.debug)
      }

    } catch (error) {
      console.error('Chat error:', error)
      
      // Remove loading message and add error response
      setMessages((prev) => {
        const withoutLoading = prev.filter(msg => !msg.isLoading)
        const errorResponse: Message = {
          id: Date.now() + 2,
          text: 'I apologize, but I\'m having trouble connecting right now. Please check your internet connection and try again.',
          sender: "bot",
          timestamp: new Date(),
        }
        return [...withoutLoading, errorResponse]
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Chatbot Button */}
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="fixed bottom-6 right-6 z-50">
        <Button onClick={() => setIsOpen(!isOpen)} size="lg" className="w-16 h-16 rounded-full shadow-lg">
          {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
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
              <div className="p-4 border-b border-border bg-primary text-primary-foreground rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Pharmacy Assistant</h3>
                    <p className="text-xs opacity-90">Powered by AI Webhook</p>
                  </div>
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
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {message.isLoading && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                          {/* Render structured data if available */}
                          {message.responseData && message.isJsonResponse && (
                            <StructuredResponseRenderer data={message.responseData} />
                          )}
                        </div>
                      </div>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask about medicines, health advice..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}