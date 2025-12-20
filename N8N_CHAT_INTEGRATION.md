# n8n Chat Integration for Smart Pharmacy

This guide shows how to integrate the customized n8n chat widget into your pharmacy application.

## 🚀 **Quick Start**

### **Option 1: Simple HTML Integration**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Smart Pharmacy</title>
</head>
<body>
    <!-- Your page content -->
    
    <!-- Chat widget container -->
    <div id="pharmacy-chat-widget"></div>
    
    <!-- Load n8n chat script -->
    <script src="https://cdn.jsdelivr.net/npm/@n8n/chat@latest/dist/chat.bundle.js"></script>
    
    <!-- Load pharmacy chat configuration -->
    <script src="js/pharmacy-chat-config.js"></script>
    
    <!-- Initialize chat -->
    <script>
        initPharmacyChat('floating');
    </script>
</body>
</html>
```

### **Option 2: Auto-Initialize with Data Attributes**

```html
<!-- Add this to any page for auto-initialization -->
<div data-pharmacy-chat="auto" data-mode="floating"></div>

<!-- Load scripts -->
<script src="https://cdn.jsdelivr.net/npm/@n8n/chat@latest/dist/chat.bundle.js"></script>
<script src="js/pharmacy-chat-config.js"></script>
```

### **Option 3: React Component**

```jsx
import N8nChatbot from '@/components/n8n-chatbot'

export default function MyPage() {
  return (
    <div>
      {/* Your page content */}
      <N8nChatbot />
    </div>
  )
}
```

## 🎨 **Chat Modes**

### **1. Floating Chat (Default)**
```javascript
initPharmacyChat('floating');
```
- Appears as a floating button in bottom-right corner
- Opens in a popup window when clicked
- Best for general website integration

### **2. Embedded Chat**
```javascript
initPharmacyChat('embedded');
```
- Embeds directly into a page element
- Great for product pages or dedicated support sections
- Requires a container: `<div id="embedded-pharmacy-chat"></div>`

### **3. Fullscreen Chat**
```javascript
initPharmacyChat('fullscreen');
```
- Takes up the entire screen
- Ideal for mobile devices
- Provides immersive chat experience

## ⚙️ **Configuration Options**

### **Basic Configuration**
```javascript
const customConfig = {
    webhookUrl: 'https://shyam.mlritcie.in/webhook/6e594a8e-7463-4151-9412-1335015568a3',
    initialMessages: [
        'Welcome to Smart Pharmacy! 💊',
        'How can I help you today?'
    ],
    i18n: {
        en: {
            title: 'Smart Pharmacy Assistant',
            inputPlaceholder: 'Ask about medicines...'
        }
    }
};

initPharmacyChat('floating', customConfig);
```

### **Advanced Configuration**
```javascript
const advancedConfig = {
    // Webhook settings
    webhookUrl: 'your-webhook-url',
    webhookConfig: {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer your-token' // If needed
        }
    },
    
    // UI customization
    showWelcomeScreen: true,
    loadPreviousSession: true,
    enableStreaming: false,
    
    // Metadata for analytics
    metadata: {
        source: 'pharmacy-website',
        page: window.location.pathname,
        user_id: 'user-123' // If available
    },
    
    // Custom styling
    theme: {
        primaryColor: '#3b82f6',
        backgroundColor: '#ffffff'
    }
};
```

## 🎯 **Quick Actions**

Add quick action buttons to help users get started:

```html
<div id="quick-actions"></div>

<script>
    // This will create quick action buttons
    PharmacyChat.createQuickActions('quick-actions');
</script>
```

Or create custom quick actions:

```html
<div class="pharmacy-quick-actions">
    <button onclick="PharmacyChat.sendQuickMessage('What is the dosage for paracetamol?')">
        💊 Medicine Dosage
    </button>
    <button onclick="PharmacyChat.sendQuickMessage('What are the side effects?')">
        ⚠️ Side Effects
    </button>
    <button onclick="PharmacyChat.sendQuickMessage('Can I take this with other medicines?')">
        🔄 Drug Interactions
    </button>
</div>
```

## 📱 **Mobile Optimization**

The chat automatically adapts to mobile devices:

```javascript
// Detect mobile and use appropriate mode
const isMobile = window.innerWidth <= 768;
const mode = isMobile ? 'fullscreen' : 'floating';
initPharmacyChat(mode);
```

## 🎨 **Custom Styling**

### **CSS Variables**
```css
:root {
    --pharmacy-chat-primary: #3b82f6;
    --pharmacy-chat-secondary: #f8fafc;
    --pharmacy-chat-accent: #10b981;
    --pharmacy-chat-text: #1f2937;
    --pharmacy-chat-border: #e2e8f0;
}
```

### **Custom CSS Classes**
```css
/* Override default styling */
.n8n-chat-button {
    background: var(--pharmacy-chat-primary) !important;
    border-radius: 50% !important;
}

.n8n-chat-window {
    border: 2px solid var(--pharmacy-chat-border) !important;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
}

.n8n-chat-message-bot {
    background: var(--pharmacy-chat-secondary) !important;
    border-left: 3px solid var(--pharmacy-chat-accent) !important;
}
```

## 🔧 **Event Handling**

```javascript
const configWithEvents = {
    ...PHARMACY_CHAT_CONFIG,
    
    // Custom event handlers
    onMessageSent: function(message) {
        console.log('User sent:', message);
        // Track analytics
        gtag('event', 'chat_message_sent', {
            message_length: message.length
        });
    },
    
    onMessageReceived: function(response) {
        console.log('Bot responded:', response);
        // Handle special responses
        if (response.includes('emergency')) {
            alert('For medical emergencies, please call 911');
        }
    },
    
    onChatStarted: function() {
        console.log('Chat session started');
        // Initialize session tracking
    },
    
    onChatEnded: function() {
        console.log('Chat session ended');
        // Save session data
    }
};
```

## 🌐 **Multi-language Support**

```javascript
const multiLangConfig = {
    defaultLanguage: 'en',
    i18n: {
        en: {
            title: 'Smart Pharmacy Assistant',
            subtitle: 'Get help with medicines and health advice',
            inputPlaceholder: 'Ask about medicines...'
        },
        es: {
            title: 'Asistente de Farmacia Inteligente',
            subtitle: 'Obtén ayuda con medicinas y consejos de salud',
            inputPlaceholder: 'Pregunta sobre medicinas...'
        },
        fr: {
            title: 'Assistant Pharmacie Intelligent',
            subtitle: 'Obtenez de l\'aide avec les médicaments',
            inputPlaceholder: 'Demandez à propos des médicaments...'
        }
    }
};
```

## 📊 **Analytics Integration**

```javascript
// Google Analytics
function trackChatEvent(action, message) {
    gtag('event', action, {
        event_category: 'chat',
        event_label: message.substring(0, 50)
    });
}

// Custom analytics
const analyticsConfig = {
    onMessageSent: (message) => trackChatEvent('message_sent', message),
    onMessageReceived: (response) => trackChatEvent('message_received', response),
    onChatStarted: () => trackChatEvent('chat_started', ''),
    onChatEnded: () => trackChatEvent('chat_ended', '')
};
```

## 🔒 **Security & Privacy**

```javascript
const secureConfig = {
    // Disable session storage for sensitive data
    loadPreviousSession: false,
    
    // Add security headers
    webhookConfig: {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    },
    
    // Sanitize user input
    onMessageSent: function(message) {
        // Remove potential XSS content
        const sanitized = message.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        return sanitized;
    }
};
```

## 🚀 **Production Deployment**

### **1. Environment Variables**
```javascript
const config = {
    webhookUrl: process.env.NEXT_PUBLIC_CHAT_WEBHOOK_URL,
    metadata: {
        environment: process.env.NODE_ENV,
        version: process.env.NEXT_PUBLIC_APP_VERSION
    }
};
```

### **2. Error Handling**
```javascript
const productionConfig = {
    onError: function(error) {
        console.error('Chat error:', error);
        
        // Send to error tracking service
        if (window.Sentry) {
            Sentry.captureException(error);
        }
        
        // Show user-friendly message
        alert('Chat temporarily unavailable. Please try again later.');
    }
};
```

### **3. Performance Optimization**
```javascript
// Lazy load chat widget
function loadChatWhenNeeded() {
    const chatButton = document.createElement('div');
    chatButton.innerHTML = '💬 Chat';
    chatButton.onclick = function() {
        // Load chat scripts dynamically
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@n8n/chat@latest/dist/chat.bundle.js';
        script.onload = () => initPharmacyChat();
        document.head.appendChild(script);
        
        // Remove the placeholder button
        chatButton.remove();
    };
    document.body.appendChild(chatButton);
}
```

## 📋 **Testing**

### **Test Configuration**
```javascript
const testConfig = {
    webhookUrl: 'https://webhook.site/your-test-id', // Use webhook.site for testing
    metadata: {
        environment: 'test',
        user_id: 'test-user'
    },
    onMessageSent: (message) => console.log('TEST - Sent:', message),
    onMessageReceived: (response) => console.log('TEST - Received:', response)
};
```

### **Manual Testing Checklist**
- [ ] Chat button appears and is clickable
- [ ] Chat window opens and displays welcome message
- [ ] User can type and send messages
- [ ] Bot responses are displayed correctly
- [ ] Chat can be minimized and reopened
- [ ] Mobile responsiveness works
- [ ] Quick actions function properly
- [ ] Error handling works when webhook is down

## 🎯 **Best Practices**

1. **Performance**: Load chat scripts asynchronously
2. **Accessibility**: Ensure chat is keyboard navigable
3. **Mobile**: Test on various mobile devices
4. **Privacy**: Don't store sensitive medical information
5. **Analytics**: Track user interactions for improvements
6. **Error Handling**: Provide fallback options when chat fails
7. **Testing**: Test with various message types and lengths

Your pharmacy chat assistant is now ready to help customers 24/7! 🎉