import { useState, useCallback } from 'react'

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  isLoading?: boolean
}

interface ChatbotState {
  messages: Message[]
  isLoading: boolean
  error: string | null
}

export function useChatbot() {
  const [state, setState] = useState<ChatbotState>({
    messages: [
      {
        id: 1,
        text: "Hello! I'm your AI pharmacy assistant. I can help you with medicine information, stock queries, health advice, and more. How can I assist you today?",
        sender: 'bot',
        timestamp: new Date(),
      },
    ],
    isLoading: false,
    error: null,
  })

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || state.isLoading) return

    const userMessage: Message = {
      id: Date.now(),
      text: message.trim(),
      sender: 'user',
      timestamp: new Date(),
    }

    // Add user message
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }))

    // Add loading message
    const loadingMessage: Message = {
      id: Date.now() + 1,
      text: 'Thinking...',
      sender: 'bot',
      timestamp: new Date(),
      isLoading: true,
    }

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, loadingMessage],
    }))

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message.trim() }),
      })

      const data = await response.json()

      // Remove loading message and add bot response
      setState(prev => {
        const withoutLoading = prev.messages.filter(msg => !msg.isLoading)
        const botResponse: Message = {
          id: Date.now() + 2,
          text: data.response || data.error || 'I apologize, but I encountered an issue. Please try again.',
          sender: 'bot',
          timestamp: new Date(),
        }
        return {
          ...prev,
          messages: [...withoutLoading, botResponse],
          isLoading: false,
          error: data.success ? null : (data.error || 'Unknown error'),
        }
      })

    } catch (error) {
      console.error('Chat error:', error)
      
      // Remove loading message and add error response
      setState(prev => {
        const withoutLoading = prev.messages.filter(msg => !msg.isLoading)
        const errorResponse: Message = {
          id: Date.now() + 2,
          text: 'I apologize, but I\'m having trouble connecting right now. Please check your internet connection and try again.',
          sender: 'bot',
          timestamp: new Date(),
        }
        return {
          ...prev,
          messages: [...withoutLoading, errorResponse],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Network error',
        }
      })
    }
  }, [state.isLoading])

  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [prev.messages[0]], // Keep only the initial greeting
      error: null,
    }))
  }, [])

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    sendMessage,
    clearMessages,
  }
}