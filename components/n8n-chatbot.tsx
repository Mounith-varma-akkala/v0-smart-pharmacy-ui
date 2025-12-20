'use client'

import { useEffect, useRef, useState } from 'react'
import { pharmacyChatConfig, getChatConfig } from '@/lib/chatbot/n8n-config'

// Declare global n8n chat function
declare global {
  interface Window {
    createChat?: (config: any) => void;
    n8nChat?: any;
  }
}

interface N8nChatbotProps {
  config?: any;
  embedded?: boolean;
  className?: string;
}

export default function N8nChatbot({ 
  config = null, 
  embedded = false, 
  className = '' 
}: N8nChatbotProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load n8n chat script dynamically
    const loadN8nScript = () => {
      return new Promise<void>((resolve, reject) => {
        // Check if script is already loaded
        if (window.createChat) {
          resolve()
          return
        }

        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/@n8n/chat@latest/dist/chat.bundle.js'
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Failed to load n8n chat script'))
        
        document.head.appendChild(script)
      })
    }

    const initializeChat = async () => {
      try {
        await loadN8nScript()
        
        // Get the appropriate configuration
        const chatConfig = config || getChatConfig()
        
        // Update target to match our container
        const containerId = embedded ? 'embedded-pharmacy-chat' : 'pharmacy-chat-widget'
        const updatedConfig = {
          ...chatConfig,
          target: `#${containerId}`
        }

        // Initialize the chat
        if (window.createChat) {
          window.createChat(updatedConfig)
          setIsLoaded(true)
        } else {
          throw new Error('createChat function not available')
        }
      } catch (err) {
        console.error('Failed to initialize n8n chat:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    initializeChat()

    // Cleanup function
    return () => {
      // Clean up chat instance if needed
      if (window.n8nChat && window.n8nChat.destroy) {
        window.n8nChat.destroy()
      }
    }
  }, [config, embedded])

  if (error) {
    return (
      <div className={`n8n-chat-error ${className}`}>
        <div className="error-message">
          <p>Chat temporarily unavailable</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={chatContainerRef}
      className={`n8n-chat-container ${className}`}
    >
      <div 
        id={embedded ? 'embedded-pharmacy-chat' : 'pharmacy-chat-widget'}
        className={embedded ? 'embedded-chat' : 'floating-chat'}
      />
      
      {!isLoaded && (
        <div className="chat-loading">
          <div className="loading-spinner" />
          <p>Loading pharmacy assistant...</p>
        </div>
      )}
      
      <style jsx>{`
        .n8n-chat-container {
          position: relative;
        }
        
        .floating-chat {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
        }
        
        .embedded-chat {
          width: 100%;
          height: 500px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .chat-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          color: #6b7280;
        }
        
        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 10px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .n8n-chat-error {
          padding: 20px;
          text-align: center;
          color: #ef4444;
        }
        
        .retry-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 10px;
        }
        
        .retry-button:hover {
          background: #2563eb;
        }
        
        /* Custom styling for n8n chat widget */
        :global(.n8n-chat) {
          font-family: 'Inter', system-ui, sans-serif !important;
        }
        
        :global(.n8n-chat-button) {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
        }
        
        :global(.n8n-chat-button:hover) {
          transform: scale(1.05) !important;
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4) !important;
        }
        
        :global(.n8n-chat-window) {
          border-radius: 12px !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }
        
        :global(.n8n-chat-header) {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
          color: white !important;
        }
        
        :global(.n8n-chat-message-user) {
          background: #3b82f6 !important;
          color: white !important;
        }
        
        :global(.n8n-chat-message-bot) {
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
        }
        
        :global(.n8n-chat-input) {
          border: 2px solid #e2e8f0 !important;
          border-radius: 8px !important;
        }
        
        :global(.n8n-chat-input:focus) {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
        
        :global(.n8n-chat-send-button) {
          background: #3b82f6 !important;
          border-radius: 6px !important;
        }
        
        :global(.n8n-chat-send-button:hover) {
          background: #2563eb !important;
        }
      `}</style>
    </div>
  )
}

// Quick Actions Component for pharmacy-specific queries
export function PharmacyQuickActions({ onActionClick }: { onActionClick: (message: string) => void }) {
  const quickActions = pharmacyChatConfig.quickActions

  return (
    <div className="pharmacy-quick-actions">
      <h3>Quick Help</h3>
      <div className="actions-grid">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => onActionClick(action.message)}
            className="action-button"
          >
            <span className="action-icon">{action.icon}</span>
            <span className="action-label">{action.label}</span>
          </button>
        ))}
      </div>
      
      <style jsx>{`
        .pharmacy-quick-actions {
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
          margin-bottom: 16px;
        }
        
        .pharmacy-quick-actions h3 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }
        
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 8px;
        }
        
        .action-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 8px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 12px;
        }
        
        .action-button:hover {
          background: #f3f4f6;
          border-color: #3b82f6;
          transform: translateY(-1px);
        }
        
        .action-icon {
          font-size: 18px;
          margin-bottom: 4px;
        }
        
        .action-label {
          color: #374151;
          font-weight: 500;
          text-align: center;
          line-height: 1.2;
        }
      `}</style>
    </div>
  )
}

// Embedded chat component for product pages
export function EmbeddedPharmacyChat({ productName }: { productName?: string }) {
  const embeddedConfig = {
    ...pharmacyChatConfig,
    mode: 'embedded',
    target: '#embedded-pharmacy-chat',
    showWelcomeScreen: false,
    initialMessages: productName 
      ? [`Hi! I can help you with ${productName}. What would you like to know?`]
      : ['Hi! I can help you with this medicine. What would you like to know?'],
    i18n: {
      en: {
        ...pharmacyChatConfig.i18n.en,
        title: 'Medicine Assistant',
        subtitle: productName ? `Ask about ${productName}` : 'Ask about this medicine',
        inputPlaceholder: 'Ask about dosage, side effects, interactions...'
      }
    }
  }

  return (
    <div className="embedded-pharmacy-chat-wrapper">
      <N8nChatbot config={embeddedConfig} embedded={true} />
    </div>
  )
}