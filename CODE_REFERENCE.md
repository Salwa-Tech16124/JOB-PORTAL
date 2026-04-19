# Code Reference: Gemini API Integration

## 📌 QUICK CODE SNIPPETS

### Backend Endpoint (server.js)

```javascript
// New endpoint for Gemini-powered coaching
app.post('/api/coach/message', async (req, res) => {
  try {
    const { message, conversationHistory, userContext } = req.body;

    if (!message || !message.trim()) {
      return standardResponse(res, false, null, 'Message cannot be empty', 400);
    }

    // Get user context for personalization
    const { name = 'User', skills = [], experience = '', goal = '' } = userContext || {};
    
    // Build conversation history for context (last 10 messages)
    const recentMessages = (conversationHistory || []).slice(-10).map(msg => ({
      role: msg.type === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Build system prompt with user context
    const systemPrompt = `You are an expert AI Career Coach with deep knowledge of tech careers, skill development, and professional growth. 
Your goal is to provide personalized, actionable advice.

User Profile:
- Name: ${name}
- Skills: ${skills.length > 0 ? skills.join(', ') : 'Not specified yet'}
- Experience: ${experience || 'Not specified yet'}
- Career Goal: ${goal || 'General career growth'}

Guidelines for responses:
1. Be specific and actionable - provide concrete steps, not generic advice
2. Consider the user's current skills and experience level
3. Mention relevant technologies, tools, or frameworks when appropriate
4. Include realistic timelines and milestones
5. Be encouraging and motivating while being honest
6. Keep responses concise (2-3 paragraphs max)
7. Ask clarifying questions if needed to give better advice`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const chat = model.startChat({
      history: recentMessages,
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    const result = await chat.sendMessage(message);
    const aiResponse = result.response.text();

    return standardResponse(res, true, { 
      message: aiResponse,
      model: 'gemini-pro'
    }, 'AI response generated', 200);

  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Fallback response if API fails
    const fallbackResponses = [
      "I appreciate your question! While I'm having trouble connecting to my AI service right now, I can suggest checking out resources like LeetCode for technical prep, or Glassdoor for career insights. Try again in a moment!",
      "Great question! The key to career growth is continuous learning and networking. Focus on building projects, contributing to open source, and connecting with mentors. Let's try this conversation again when my AI service is back online.",
      "That's an important career consideration! Based on general best practices, I'd recommend documenting your achievements and learning in-demand skills. Please try your question again - my AI service should be available shortly."
    ];

    const fallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    return standardResponse(res, false, { 
      message: fallback,
      error: error.message 
    }, 'Using fallback response - AI service temporarily unavailable', 200);
  }
});
```

---

### Frontend Integration (Coach.jsx)

```javascript
// Get AI response from Gemini API
const getAIResponse = async (userMessage) => {
  try {
    // Get last 5 messages for context
    const conversationHistory = messages.slice(-5);

    // Prepare user context
    const userContext = {
      name: userData.name || 'User',
      skills: Array.isArray(userData.skills) ? userData.skills : [],
      experience: userData.experience || '',
      goal: userData.bio || ''
    };

    // Call backend endpoint
    const response = await fetch('http://localhost:5000/api/coach/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        conversationHistory,
        userContext
      })
    });

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        content: data.data.message
      };
    } else {
      // Use fallback response from API
      return {
        success: true,
        content: data.data.message || 'Let me help you with that. Please try rephrasing your question or contact support if the issue persists.',
        isFallback: true
      };
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    // Fallback responses for network errors
    const fallbackResponses = [
      "I'm having trouble connecting to my AI service right now. However, I recommend checking out resources like LeetCode for technical practice, Coursera for learning new skills, or Glassdoor for career insights. Please try your question again!",
      "I apologize for the technical difficulty. While I work on reconnecting, remember that the best career growth comes from continuous learning, building projects, networking with peers, and seeking mentorship. What specific area would you like help with when I'm back online?",
      "Experiencing a temporary connection issue! In the meantime, here's some universal advice: Document your achievements, stay up-to-date with industry trends, build a strong professional network, and never stop learning. Try your question again shortly!"
    ];
    
    return {
      success: false,
      content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      isFallback: true
    };
  }
};

// Updated message handler
const handleSendMessage = async (e) => {
  e.preventDefault();
  
  if (!inputValue.trim()) {
    toast.warning('Please type a message', 'Empty Message');
    return;
  }

  const userMessage = {
    id: messages.length + 1,
    type: 'user',
    content: inputValue,
    timestamp: new Date()
  };

  setMessages(prev => [...prev, userMessage]);
  setInputValue('');
  setLoading(true);

  try {
    const result = await getAIResponse(inputValue);

    const aiMessage = {
      id: messages.length + 2,
      type: 'ai',
      content: result.content,
      timestamp: new Date(),
      isFallback: result.isFallback
    };

    setMessages(prev => [...prev, aiMessage]);
    
    if (result.success || result.isFallback) {
      toast.success(
        result.isFallback ? 'Using fallback response' : 'AI response generated!',
        'Got It'
      );
    }
  } catch (error) {
    toast.error('Failed to get AI response', 'Error');
    console.error('Error:', error);
  } finally {
    setLoading(false);
  }
};
```

---

### Message Rendering with Fallback Indicator

```jsx
{messages.map((message, index) => (
  <motion.div
    key={message.id}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ delay: index * 0.05 }}
    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
  >
    <div
      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
        message.type === 'user'
          ? 'bg-primary text-primary-foreground rounded-tr-none'
          : message.isFallback
            ? 'bg-yellow-500/10 border border-yellow-500/30 rounded-tl-none'
            : 'bg-background/50 border border-border rounded-tl-none'
      }`}
    >
      <p className="text-sm leading-relaxed">{message.content}</p>
      
      {/* Show fallback indicator */}
      {message.isFallback && (
        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2 font-medium">
          ⚠️ Fallback response - AI service temporarily unavailable
        </p>
      )}
      
      {/* Copy button for AI messages */}
      {message.type === 'ai' && (
        <button
          onClick={() => handleCopyMessage(message.id, message.content)}
          className="mt-2 text-xs opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1"
        >
          {copiedId === message.id ? (
            <>
              <Check className="w-3 h-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" /> Copy
            </>
          )}
        </button>
      )}

      <span className="text-xs opacity-50 mt-1 block">
        {message.timestamp.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </span>
    </div>
  </motion.div>
))}
```

---

### Environment Configuration (.env)

```bash
# Gemini API Configuration
GEMINI_API_KEY=AIzaSyDUa_Ht8yfn6HjSxK_-e8cJ-7-zZfCj3R8

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=secret-key-123
```

---

### Import Statements

**Backend (server.js)**
```javascript
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
```

**Frontend (Coach.jsx)**
```javascript
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Lightbulb, MessageSquare, Trash2, Loader2, 
  Copy, Check, MapPin, CheckCircle2, BookOpen, ArrowRight 
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
```

---

## 🔄 REQUEST/RESPONSE FLOW

### POST /api/coach/message

**Request:**
```json
{
  "message": "I have React and TypeScript skills, what should I learn next?",
  "conversationHistory": [
    {
      "type": "user",
      "content": "Hi, I'm a developer"
    },
    {
      "type": "ai",
      "content": "Welcome! Tell me more about your background..."
    }
  ],
  "userContext": {
    "name": "John Doe",
    "skills": ["React", "TypeScript"],
    "experience": "5 years",
    "goal": "Become a tech lead"
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "message": "Based on your React and TypeScript background, here are the most valuable next steps:\n\n1. **Backend Development** - Learn Node.js to become full-stack...",
    "model": "gemini-pro"
  },
  "message": "AI response generated"
}
```

**Response (Fallback):**
```json
{
  "success": false,
  "data": {
    "message": "I'm having trouble connecting to my AI service right now. However, I recommend checking out resources like LeetCode...",
    "error": "API rate limit exceeded"
  },
  "message": "Using fallback response - AI service temporarily unavailable"
}
```

---

## 🧪 TESTING WITH CURL

### Test the Endpoint

```bash
curl -X POST http://localhost:5000/api/coach/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What skills should I learn?",
    "conversationHistory": [],
    "userContext": {
      "name": "Test User",
      "skills": ["React", "Node.js"],
      "experience": "3 years",
      "goal": "Senior Developer"
    }
  }'
```

---

## 🔧 CONFIGURATION OPTIONS

### Gemini Model Selection
```javascript
// Current: gemini-pro
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Available models:
// - gemini-pro (text)
// - gemini-pro-vision (text + images)
```

### Response Token Limits
```javascript
generationConfig: {
  maxOutputTokens: 500,  // Current: 500 tokens (~150-200 words)
  temperature: 0.7,       // Optional: 0-1, higher = more creative
  topP: 0.95,            // Optional: 0-1, nucleus sampling
}
```

---

## 🎓 SYSTEM PROMPT CUSTOMIZATION

Current system prompt includes:
```
- Role: Expert AI Career Coach
- User Profile: Name, Skills, Experience, Goal
- Guidelines: 7 specific instruction points
- Tone: Professional, encouraging, actionable
- Response Length: 2-3 paragraphs
```

To modify:
1. Edit `systemPrompt` variable in `/api/coach/message` endpoint
2. Update guidelines as needed
3. Restart backend
4. Test changes

---

## 📊 DEBUGGING

### Enable Verbose Logging

**Backend:**
```javascript
// Add to server.js
console.log('Sending to Gemini:', { systemPrompt, userMessage });
console.log('Gemini Response:', result.response.text());
```

**Frontend:**
```javascript
// Add to Coach.jsx
console.log('API Response:', data);
console.log('Message History:', messages);
console.log('User Context:', userContext);
```

---

## ⚠️ ERROR CODES

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `EADDRINUSE: port 5000` | Another process using port | Stop conflicting process |
| `API rate limit exceeded` | Too many requests | Wait or upgrade API key |
| `Invalid API key` | Wrong/expired key | Get new key from ai.google.dev |
| `Network timeout` | Backend not responding | Check backend is running |
| `CORS error` | Frontend can't reach backend | Check backend URL in fetch() |

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Backend running and tested
- [ ] Frontend running and tested
- [ ] Gemini API key configured
- [ ] CORS properly configured
- [ ] Error handling tested
- [ ] Fallback messages working
- [ ] Conversation history working
- [ ] User context properly injected
- [ ] Performance acceptable
- [ ] All UI components working
- [ ] Ready for production

---

## 📞 TROUBLESHOOTING

### Coach says "API service temporarily unavailable"
1. Check backend is running: `curl http://localhost:5000`
2. Check API key in `.env`
3. Check internet connection
4. Check Gemini API status at https://ai.google.dev

### Messages not being sent
1. Check browser console for errors
2. Verify fetch URL is correct
3. Check Content-Type header
4. Verify request payload format

### AI doesn't know user's profile
1. Check user profile is saved in localStorage
2. Check Profile page was completed
3. Verify skills array exists
4. Check userContext is passed to API

---

This is everything you need to understand and maintain the Gemini API integration!
