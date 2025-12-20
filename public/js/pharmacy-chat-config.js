/**
 * Smart Pharmacy Chat Configuration
 * Customized n8n chat widget for pharmacy applications
 * 
 * Usage:
 * 1. Include n8n chat script: <script src="https://cdn.jsdelivr.net/npm/@n8n/chat@latest/dist/chat.bundle.js"></script>
 * 2. Include this file: <script src="js/pharmacy-chat-config.js"></script>
 * 3. Call: initPharmacyChat()
 */

// Main pharmacy chat configuration
const PHARMACY_CHAT_CONFIG = {
    webhookUrl: 'https://shyam.mlritcie.in/webhook/223b953b-ef97-4800-a1be-8b05890044c1/chat',
    webhookConfig: {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    },
    target: '#pharmacy-chat-widget',
    mode: 'window', // 'window', 'fullscreen', or 'embedded'
    chatInputKey: 'message',
    chatSessionKey: 'sessionId',
    loadPreviousSession: true,
    metadata: {
        source: 'pharmacy-website',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    },
    showWelcomeScreen: true,
    defaultLanguage: 'en',
    initialMessages: [
        'Welcome to Smart Pharmacy! 💊',
        'I\'m your AI pharmacy assistant. I can help you with:',
        '• Medicine information and dosages 💊',
        '• Drug interactions and side effects ⚠️', 
        '• Health advice and recommendations 🩺',
        '• Prescription queries 📝',
        '• Stock availability 📦',
        '',
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
    enableStreaming: false
};

// Quick action messages for common pharmacy queries
const QUICK_ACTIONS = [
    {
        label: 'Medicine Info',
        message: 'I need information about a specific medicine',
        icon: '💊',
        category: 'medicine'
    },
    {
        label: 'Dosage Help',
        message: 'How should I take my medication?',
        icon: '📋',
        category: 'dosage'
    },
    {
        label: 'Side Effects',
        message: 'What are the side effects of my medicine?',
        icon: '⚠️',
        category: 'safety'
    },
    {
        label: 'Drug Interactions',
        message: 'Can I take these medicines together?',
        icon: '🔄',
        category: 'interactions'
    },
    {
        label: 'Health Advice',
        message: 'I need general health advice',
        icon: '🩺',
        category: 'health'
    },
    {
        label: 'Store Hours',
        message: 'What are your pharmacy hours and location?',
        icon: '🕒',
        category: 'store'
    },
    {
        label: 'Prescription Refill',
        message: 'How can I refill my prescription?',
        icon: '🔄',
        category: 'prescription'
    },
    {
        label: 'Emergency Help',
        message: 'I need urgent medical advice',
        icon: '🚨',
        category: 'emergency'
    }
];

// Common pharmacy-related suggestions
const SUGGESTIONS = [
    'What is the dosage for paracetamol?',
    'Can I take ibuprofen with other medicines?',
    'What are the side effects of antibiotics?',
    'Do you have medicines for diabetes?',
    'How to store insulin properly?',
    'What medicines are safe during pregnancy?',
    'Can I get a prescription refill?',
    'What are your pharmacy hours?',
    'How long does it take for antibiotics to work?',
    'Can I take medicine with food?',
    'What should I do if I miss a dose?',
    'Are there generic alternatives available?'
];

// Configuration for different modes
const CHAT_MODES = {
    // Default floating chat widget
    floating: {
        ...PHARMACY_CHAT_CONFIG,
        mode: 'window',
        target: '#pharmacy-chat-widget'
    },
    
    // Embedded chat for product pages
    embedded: {
        ...PHARMACY_CHAT_CONFIG,
        mode: 'embedded',
        target: '#embedded-pharmacy-chat',
        showWelcomeScreen: false,
        initialMessages: [
            'Hi! I can help you with this medicine. What would you like to know?'
        ],
        i18n: {
            en: {
                ...PHARMACY_CHAT_CONFIG.i18n.en,
                title: 'Medicine Assistant',
                subtitle: 'Ask me anything about this product',
                inputPlaceholder: 'Ask about this medicine...'
            }
        }
    },
    
    // Fullscreen chat for mobile
    fullscreen: {
        ...PHARMACY_CHAT_CONFIG,
        mode: 'fullscreen'
    }
};

// Utility functions
const PharmacyChat = {
    // Initialize the chat widget
    init: function(mode = 'floating', customConfig = {}) {
        const config = {
            ...CHAT_MODES[mode],
            ...customConfig
        };
        
        if (typeof createChat === 'function') {
            createChat(config);
            this.addCustomStyling();
            console.log('Pharmacy chat initialized in', mode, 'mode');
        } else {
            console.error('n8n createChat function not available. Make sure to load the n8n chat script first.');
        }
    },
    
    // Add custom styling to the chat widget
    addCustomStyling: function() {
        const style = document.createElement('style');
        style.textContent = `
            /* Custom pharmacy chat styling */
            .n8n-chat-button {
                background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
                transition: all 0.3s ease !important;
            }
            
            .n8n-chat-button:hover {
                transform: scale(1.05) !important;
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4) !important;
            }
            
            .n8n-chat-window {
                border-radius: 12px !important;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
                font-family: 'Inter', system-ui, sans-serif !important;
            }
            
            .n8n-chat-header {
                background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
                color: white !important;
                border-radius: 12px 12px 0 0 !important;
            }
            
            .n8n-chat-message-user {
                background: #3b82f6 !important;
                color: white !important;
                border-radius: 18px 18px 4px 18px !important;
            }
            
            .n8n-chat-message-bot {
                background: #f8fafc !important;
                border: 1px solid #e2e8f0 !important;
                border-radius: 18px 18px 18px 4px !important;
                color: #1f2937 !important;
            }
            
            .n8n-chat-input {
                border: 2px solid #e2e8f0 !important;
                border-radius: 8px !important;
                padding: 12px !important;
                font-size: 14px !important;
            }
            
            .n8n-chat-input:focus {
                border-color: #3b82f6 !important;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
                outline: none !important;
            }
            
            .n8n-chat-send-button {
                background: #3b82f6 !important;
                border-radius: 6px !important;
                color: white !important;
                border: none !important;
                padding: 8px 12px !important;
                margin-left: 8px !important;
            }
            
            .n8n-chat-send-button:hover {
                background: #2563eb !important;
            }
            
            .n8n-chat-typing {
                color: #6b7280 !important;
                font-style: italic !important;
            }
            
            /* Mobile responsive */
            @media (max-width: 768px) {
                .n8n-chat-window {
                    width: 100vw !important;
                    height: 100vh !important;
                    border-radius: 0 !important;
                    bottom: 0 !important;
                    right: 0 !important;
                }
            }
        `;
        document.head.appendChild(style);
    },
    
    // Send a predefined message
    sendQuickMessage: function(message) {
        // This would interact with the n8n chat instance
        // Implementation depends on n8n chat API
        console.log('Quick message:', message);
    },
    
    // Get configuration for specific mode
    getConfig: function(mode = 'floating') {
        return CHAT_MODES[mode] || CHAT_MODES.floating;
    },
    
    // Create quick action buttons
    createQuickActions: function(containerId = 'quick-actions') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = QUICK_ACTIONS.map(action => `
            <button class="pharmacy-quick-action" onclick="PharmacyChat.sendQuickMessage('${action.message}')">
                <span class="action-icon">${action.icon}</span>
                <span class="action-label">${action.label}</span>
            </button>
        `).join('');
        
        // Add styling for quick actions
        const style = document.createElement('style');
        style.textContent = `
            .pharmacy-quick-action {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 12px;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 12px;
                min-width: 100px;
            }
            
            .pharmacy-quick-action:hover {
                background: #f3f4f6;
                border-color: #3b82f6;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
            }
            
            .action-icon {
                font-size: 20px;
                margin-bottom: 6px;
            }
            
            .action-label {
                color: #374151;
                font-weight: 500;
                text-align: center;
                line-height: 1.2;
            }
        `;
        document.head.appendChild(style);
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Check if we should auto-initialize
    const autoInit = document.querySelector('[data-pharmacy-chat="auto"]');
    if (autoInit) {
        const mode = autoInit.getAttribute('data-mode') || 'floating';
        PharmacyChat.init(mode);
    }
});

// Global function for easy initialization
function initPharmacyChat(mode = 'floating', customConfig = {}) {
    PharmacyChat.init(mode, customConfig);
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PharmacyChat,
        PHARMACY_CHAT_CONFIG,
        QUICK_ACTIONS,
        SUGGESTIONS,
        initPharmacyChat
    };
}