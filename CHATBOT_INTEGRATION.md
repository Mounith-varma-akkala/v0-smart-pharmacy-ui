# Chatbot Webhook Integration

This document explains how the chatbot webhook integration works in the pharmacy application.

## 🤖 **Overview**

The chatbot is integrated with an external AI webhook that processes user messages and returns intelligent responses. The integration handles:

- ✅ Real-time messaging with AI responses
- ✅ Error handling and fallback messages
- ✅ Loading states and user feedback
- ✅ Clean response formatting
- ✅ Webhook communication management

## 🔗 **Webhook Configuration**

**Webhook URL:** `https://shyam.mlritcie.in/webhook/6e594a8e-7463-4151-9412-1335015568a3`

**Request Format:**
```json
{
  "message": "User's question or message",
  "timestamp": "2024-12-20T10:30:00.000Z"
}
```

**Expected Response Format:**
The webhook can return responses in various formats. The system handles:
```json
{
  "response": "Bot's reply text"
}
```

Or:
```json
{
  "message": "Bot's reply text"
}
```

Or simply:
```json
"Bot's reply text"
```

## 📁 **File Structure**

```
├── app/api/chatbot/route.ts          # API endpoint for webhook communication
├── app/test-chatbot/page.tsx         # Test page for webhook integration
├── components/chatbot.tsx            # Main chatbot UI component
├── hooks/use-chatbot.ts              # Chatbot state management hook
└── CHATBOT_INTEGRATION.md            # This documentation
```

## 🛠 **API Endpoint**

### `/api/chatbot` (POST)

**Request Body:**
```typescript
{
  message: string  // User's message
}
```

**Response:**
```typescript
{
  success: boolean
  response: string     // Bot's formatted response
  timestamp: string    // ISO timestamp
  error?: string       // Error message if failed
}
```

## 🎨 **UI Components**

### Chatbot Component (`components/chatbot.tsx`)

Features:
- ✅ Floating chat button
- ✅ Expandable chat panel
- ✅ Message history
- ✅ Loading indicators
- ✅ Error handling
- ✅ Responsive design

### Test Page (`app/test-chatbot/page.tsx`)

Features:
- ✅ Direct webhook testing
- ✅ Sample questions
- ✅ Response display
- ✅ Error debugging
- ✅ Webhook status monitoring

## 🔧 **Usage**

### 1. **Basic Integration**

The chatbot appears as a floating button on all pages:

```tsx
import ChatBot from '@/components/chatbot'

export default function Layout({ children }) {
  return (
    <div>
      {children}
      <ChatBot />
    </div>
  )
}
```

### 2. **Using the Hook**

```tsx
import { useChatbot } from '@/hooks/use-chatbot'

function CustomChatInterface() {
  const { messages, isLoading, sendMessage } = useChatbot()
  
  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.text}</div>
      ))}
      <button onClick={() => sendMessage('Hello')}>
        Send Message
      </button>
    </div>
  )
}
```

### 3. **Testing the Integration**

Visit: `http://localhost:3000/test-chatbot`

This page allows you to:
- Test webhook responses directly
- Try sample questions
- Debug connection issues
- Monitor webhook status

## 🔍 **Response Processing**

The system automatically:

1. **Cleans responses** - Removes HTML tags and excess whitespace
2. **Formats text** - Ensures proper capitalization and punctuation
3. **Handles errors** - Provides fallback messages for failed requests
4. **Validates responses** - Checks for empty or invalid responses

## 🚨 **Error Handling**

The integration handles various error scenarios:

- **Network errors** - Connection issues with the webhook
- **Invalid responses** - Malformed JSON or empty responses
- **Timeout errors** - Slow webhook responses
- **Server errors** - Webhook server issues

Fallback messages are provided for all error cases.

## 🧪 **Testing**

### Sample Questions to Test:

1. "What medicines do you have for headache?"
2. "Tell me about paracetamol dosage"
3. "What are the side effects of ibuprofen?"
4. "Do you have medicines for diabetes?"
5. "What is the price of aspirin?"
6. "Can you help me with cold medicine?"
7. "What medicines are available for blood pressure?"
8. "Tell me about antibiotic medicines"

### Testing Steps:

1. **Start the development server**: `npm run dev`
2. **Visit the test page**: `http://localhost:3000/test-chatbot`
3. **Try sample questions** or enter custom messages
4. **Check the chatbot UI** by clicking the floating bot button
5. **Monitor console logs** for debugging information

## 🔧 **Configuration**

### Webhook URL

To change the webhook URL, update the constant in `/app/api/chatbot/route.ts`:

```typescript
const WEBHOOK_URL = 'your-new-webhook-url'
```

### Response Timeout

The default timeout is handled by the fetch API. To add custom timeout:

```typescript
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 seconds

const response = await fetch(WEBHOOK_URL, {
  method: 'POST',
  signal: controller.signal,
  // ... other options
})
```

## 📊 **Monitoring**

The integration includes logging for:
- ✅ Webhook requests and responses
- ✅ Error messages and stack traces
- ✅ Response processing steps
- ✅ User interaction events

Check the browser console and server logs for debugging information.

## 🚀 **Deployment**

When deploying to production:

1. **Ensure webhook URL is accessible** from your production environment
2. **Test the integration** in the production environment
3. **Monitor error rates** and response times
4. **Set up proper logging** for production debugging

## 🔐 **Security Considerations**

- The webhook URL is exposed in the client-side code
- Consider adding authentication if the webhook supports it
- Validate and sanitize all responses from the webhook
- Implement rate limiting to prevent abuse

## 📈 **Performance**

- Responses are processed and cleaned on the server side
- Loading states provide immediate user feedback
- Error handling prevents UI blocking
- Message history is managed efficiently in memory