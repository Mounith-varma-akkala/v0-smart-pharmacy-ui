"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bot, X, Send, Loader2 } from "lucide-react"

interface Message {
  id: number
  text: string
  sender: "user" | "bot"
  timestamp: Date
  isLoading?: boolean
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI pharmacy assistant. I can help you with medicine information, stock queries, health advice, and more. How can I assist you today?",
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
      text: "Thinking...",
      sender: "bot",
      timestamp: new Date(),
      isLoading: true,
    }
    setMessages((prev) => [...prev, loadingMessage])

    try {
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

      const data = await response.json()

      // Remove loading message and add bot response
      setMessages((prev) => {
        const withoutLoading = prev.filter(msg => !msg.isLoading)
        const botResponse: Message = {
          id: Date.now() + 2,
          text: data.response || data.error || 'I apologize, but I encountered an issue. Please try again.',
          sender: "bot",
          timestamp: new Date(),
        }
        return [...withoutLoading, botResponse]
      })

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
                        <p className="text-sm">{message.text}</p>
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
                    <p className="text-xs opacity-90">Powered by n8n workflow</p>
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
                      <p className="text-sm">{message.text}</p>
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
                    placeholder="Ask about medicines, stock..."
                    className="flex-1"
                  />
                  <Button type="submit" size="icon">
                    <Send className="w-4 h-4" />
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
