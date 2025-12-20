// n8n Chat Widget Configuration for Pharmacy Application
export const pharmacyChatConfig = {
  webhookUrl: 'https://shyam.mlritcie.in/webhook/223b953b-ef97-4800-a1be-8b05890044c1/chat',
  webhookConfig: {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  },
  target: '#pharmacy-chat-widget',
  mode: 'window', // Options: 'window', 'fullscreen', 'embedded'
  chatInputKey: 'message', // Key for the user message in the webhook payload
  chatSessionKey: 'sessionId',
  loadPreviousSession: true,
  metadata: {
    source: 'pharmacy-website',
    version: '1.0.0',
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
  },
  showWelcomeScreen: true,
  defaultLanguage: 'en',
  initialMessages: [
    'Welcome to Smart Pharmacy! 💊',
    'I\'m your AI pharmacy assistant. I can help you with:',
    '• Medicine information and dosages',
    '• Drug interactions and side effects', 
    '• Health advice and recommendations',
    '• Prescription queries',
    '• Stock availability',
    'How can I assist you today?'
  ],
  i18n: {
    en: {
      title: 'Smart Pharmacy Assistant 💊',
      subtitle: 'Get instant help with medicines, health advice, and pharmacy services. Available 24/7.',
      footer: 'Powered by AI • Smart Pharmacy',
      getStarted: 'Start Conversation',
      inputPlaceholder: 'Ask about medicines, dosages, side effects...',
      sendButton: 'Send',
      closeButton: 'Close Chat',
      minimizeButton: 'Minimize',
      typingIndicator: 'Assistant is typing...',
      connectionError: 'Connection lost. Trying to reconnect...',
      retryButton: 'Retry',
      clearChat: 'Clear Conversation',
      downloadChat: 'Download Chat History'
    }
  },
  enableStreaming: false, // Set to true if your webhook supports streaming responses
  
  // Pharmacy-specific styling and behavior
  theme: {
    primaryColor: '#0ea5e9', // Medical blue
    secondaryColor: '#f0f9ff',
    accentColor: '#10b981', // Success green
    textColor: '#1f2937',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  
  // Custom message types for pharmacy
  messageTypes: {
    medicine_info: {
      icon: '💊',
      color: '#3b82f6'
    },
    dosage_info: {
      icon: '📋',
      color: '#8b5cf6'
    },
    side_effects: {
      icon: '⚠️',
      color: '#f59e0b'
    },
    health_advice: {
      icon: '🩺',
      color: '#10b981'
    },
    prescription: {
      icon: '📝',
      color: '#6366f1'
    },
    emergency: {
      icon: '🚨',
      color: '#ef4444'
    }
  },
  
  // Quick action buttons for common pharmacy queries
  quickActions: [
    {
      label: 'Medicine Info',
      message: 'I need information about a specific medicine',
      icon: '💊'
    },
    {
      label: 'Dosage Help',
      message: 'How should I take my medication?',
      icon: '📋'
    },
    {
      label: 'Side Effects',
      message: 'What are the side effects of my medicine?',
      icon: '⚠️'
    },
    {
      label: 'Drug Interactions',
      message: 'Can I take these medicines together?',
      icon: '🔄'
    },
    {
      label: 'Health Advice',
      message: 'I need general health advice',
      icon: '🩺'
    },
    {
      label: 'Store Hours',
      message: 'What are your pharmacy hours?',
      icon: '🕒'
    }
  ],
  
  // Auto-suggestions based on common pharmacy queries
  suggestions: [
    'What is the dosage for paracetamol?',
    'Can I take ibuprofen with other medicines?',
    'What are the side effects of antibiotics?',
    'Do you have medicines for diabetes?',
    'How to store insulin properly?',
    'What medicines are safe during pregnancy?',
    'Can I get a prescription refill?',
    'What are your pharmacy hours?'
  ],
  
  // Validation and error handling
  validation: {
    maxMessageLength: 500,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf'], // For prescription uploads
    maxFileSize: 5 * 1024 * 1024, // 5MB
  },
  
  // Privacy and compliance settings
  privacy: {
    enableDataCollection: true,
    enableAnalytics: false, // HIPAA compliance consideration
    enableCookies: true,
    privacyPolicyUrl: '/privacy-policy',
    termsOfServiceUrl: '/terms-of-service'
  },
  
  // Custom event handlers
  onMessageSent: (message: string) => {
    console.log('Message sent:', message);
    // Track user interactions for analytics
  },
  
  onMessageReceived: (response: any) => {
    console.log('Response received:', response);
    // Handle special response types (e.g., prescription reminders)
  },
  
  onChatStarted: () => {
    console.log('Chat session started');
    // Initialize session tracking
  },
  
  onChatEnded: () => {
    console.log('Chat session ended');
    // Clean up session data
  },
  
  onError: (error: any) => {
    console.error('Chat error:', error);
    // Handle errors gracefully
  }
};

// Alternative configuration for embedded mode (e.g., in product pages)
export const embeddedChatConfig = {
  ...pharmacyChatConfig,
  mode: 'embedded',
  target: '#embedded-chat',
  showWelcomeScreen: false,
  initialMessages: [
    'Hi! I can help you with this medicine. What would you like to know?'
  ],
  i18n: {
    en: {
      ...pharmacyChatConfig.i18n.en,
      title: 'Medicine Assistant',
      subtitle: 'Ask me anything about this product',
      inputPlaceholder: 'Ask about this medicine...'
    }
  }
};

// Configuration for mobile-optimized chat
export const mobileChatConfig = {
  ...pharmacyChatConfig,
  mode: 'fullscreen',
  theme: {
    ...pharmacyChatConfig.theme,
    borderRadius: '0px', // Full screen on mobile
    fontSize: '16px' // Prevent zoom on iOS
  }
};

// Helper function to detect device and return appropriate config
export function getChatConfig() {
  if (typeof window === 'undefined') {
    return pharmacyChatConfig; // Server-side default
  }
  
  const isMobile = window.innerWidth <= 768;
  const isEmbedded = window.location.pathname.includes('/product/');
  
  if (isEmbedded) {
    return embeddedChatConfig;
  } else if (isMobile) {
    return mobileChatConfig;
  } else {
    return pharmacyChatConfig;
  }
}

// TypeScript interfaces for type safety
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type?: keyof typeof pharmacyChatConfig.messageTypes;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  startTime: Date;
  endTime?: Date;
  metadata: Record<string, any>;
}

export interface ChatConfig {
  webhookUrl: string;
  webhookConfig: {
    method: string;
    headers: Record<string, string>;
  };
  target: string;
  mode: 'window' | 'fullscreen' | 'embedded';
  chatInputKey: string;
  chatSessionKey: string;
  loadPreviousSession: boolean;
  metadata: Record<string, any>;
  showWelcomeScreen: boolean;
  defaultLanguage: string;
  initialMessages: string[];
  i18n: Record<string, any>;
  enableStreaming: boolean;
}