# Gemini API Integration Guide - Career Coach

## 🎯 OVERVIEW

The Career Coach module has been upgraded to use **Google Gemini API** for intelligent, personalized career guidance instead of static responses.

---

## ✨ WHAT'S NEW

### ✅ Real AI Responses
- No more static template responses
- Intelligent, context-aware answers
- Personalized based on user's skills and experience

### ✅ User-Aware Context
AI considers:
- User's name
- Current skills (React, TypeScript, AWS, etc.)
- Professional experience
- Career goals

### ✅ Conversation Memory
- Remembers last 5 messages
- Maintains conversation flow
- Contextual follow-up responses

### ✅ Smart Fallbacks
- If API fails, helpful messages appear
- Never breaks user experience
- Visual indicators for fallback mode

---

## 🚀 QUICK START

### 1️⃣ Backend is Ready
```
✅ Gemini API integration installed
✅ New endpoint created: POST /api/coach/message
✅ Running on http://localhost:5000
```

### 2️⃣ Frontend is Ready
```
✅ Coach.jsx updated to call Gemini API
✅ Conversation history tracking
✅ Error handling with fallbacks
✅ Running on http://localhost:5173
```

### 3️⃣ Get Your API Key (Optional)
If demo key limits are reached:

1. Visit: **https://ai.google.dev**
2. Click **"Get API Key"**
3. Create/select your project
4. Copy the API key
5. Paste into `backend/.env`:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

---

## 📝 HOW TO TEST

### Step 1: Login & Complete Profile
```
1. Go to http://localhost:5173
2. Sign up or login
3. Go to Profile page
4. Add your skills (React, TypeScript, AWS, etc.)
5. Add experience and goals
6. Save profile
```

### Step 2: Open Career Coach
```
1. Click "Coach" in sidebar
2. Click "AI Coach" tab
3. You should see the welcome message
```

### Step 3: Ask a Question
```
Examples to try:
- "I have React and TypeScript skills, how can I advance my career?"
- "What skills should I learn for AWS certification?"
- "How do I prepare for a senior engineer interview?"
- "Should I focus on backend or frontend development?"
```

### Step 4: Observe the Magic ✨
```
✅ AI responds with personalized advice
✅ Response considers your skills and experience
✅ Can ask follow-up questions
✅ Conversation context is maintained
```

---

## 🔧 TECHNICAL DETAILS

### Backend Endpoint
```
POST /api/coach/message
Headers: Content-Type: application/json

Request Body:
{
  "message": "Your question here",
  "conversationHistory": [
    {
      "type": "user",
      "content": "Previous message"
    },
    {
      "type": "ai",
      "content": "Previous response"
    }
  ],
  "userContext": {
    "name": "John Doe",
    "skills": ["React", "TypeScript"],
    "experience": "5 years",
    "goal": "Become a tech lead"
  }
}

Response:
{
  "success": true,
  "data": {
    "message": "AI's personalized response...",
    "model": "gemini-pro"
  },
  "message": "AI response generated"
}
```

### Frontend Integration
```javascript
// In Coach.jsx
const getAIResponse = async (userMessage) => {
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
  return data.data.message;
};
```

---

## ⚠️ IMPORTANT NOTES

### Demo API Key Limitations
- Limited requests per day
- If you hit limits, get your own key at https://ai.google.dev
- Demo key is for testing only

### Error Handling
- If API fails, fallback message appears (yellow badge)
- User experience never breaks
- Graceful degradation

### Conversation History
- Last 5 messages sent to API for context
- Helps AI understand conversation flow
- Not stored in database (client-side only)

---

## 🎓 EXAMPLE CONVERSATIONS

### Example 1: Skill Development
```
User: "I have React and TypeScript skills. What should I learn next?"

AI Response:
"Based on your React and TypeScript background, here are the most valuable next steps:

1. **Backend Development** - Learn Node.js to become full-stack. This dramatically increases your market value.

2. **System Design** - Critical for senior roles. Master distributed systems, databases, and scaling.

3. **Cloud Platforms** - AWS, Azure, or GCP. Your TypeScript/React skills transfer well to serverless and containers.

I'd recommend focusing on backend (Node.js) first since it builds directly on your current skills. Aim to build 2-3 backend projects within 3 months."
```

### Example 2: Career Advancement
```
User: "How do I move from mid-level to senior engineer?"

AI Response:
"Congrats on reaching mid-level! Here's your roadmap to senior:

**Technical Growth (50%)**
- Master system design and architecture
- Become the go-to expert in one technology
- Lead technical initiatives

**Soft Skills (50%)**
- Mentor junior developers
- Improve communication with non-technical stakeholders
- Drive technical decision-making in your team

**Timeline**: 18-24 months with intentional focus

**This Quarter**: Start mentoring 1-2 juniors and lead one architecture decision."
```

---

## 🚨 TROUBLESHOOTING

### Backend not responding
```
Problem: "Failed to get AI response"
Solution: 
1. Check backend running: curl http://localhost:5000
2. Check .env file has GEMINI_API_KEY
3. Restart backend: npm start
```

### Fallback messages appearing
```
Problem: "Using fallback response" toast
Reason: API rate limit or network error
Solution:
1. Wait 60 seconds and retry
2. Check internet connection
3. Get new API key from https://ai.google.dev
```

### No profile data in responses
```
Problem: AI not aware of your skills
Solution:
1. Go to Profile page
2. Add skills, experience, goals
3. Click Save
4. Retry in Coach
```

---

## 📊 WHAT HAPPENS BEHIND THE SCENES

```
┌─────────────────────────────────────────┐
│ User Types Question in Chat             │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ Frontend Collects Context:              │
│ - User message                          │
│ - Last 5 messages (history)             │
│ - User profile (name, skills, etc.)    │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ Send to /api/coach/message              │
│ POST http://localhost:5000/api/coach... │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ Backend Builds System Prompt:           │
│ "You are AI Career Coach                │
│  User is [name] with [skills]           │
│  Experience: [exp]                      │
│  Goal: [goal]"                          │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ Call Google Gemini Pro API              │
│ Model: gemini-pro                       │
│ Max tokens: 500                         │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ Gemini Generates Response               │
│ Personalized to user context            │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ Return to Frontend                      │
│ Add to message history                  │
│ Display in chat UI                      │
└─────────────────────────────────────────┘
```

---

## ✅ VERIFICATION CHECKLIST

Before declaring success, verify:

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can login/signup
- [ ] Can navigate to Coach page
- [ ] Can ask questions and get responses
- [ ] Responses are NOT static templates
- [ ] Responses mention user's actual skills
- [ ] Multiple questions work correctly
- [ ] Copy button works
- [ ] Clear history works
- [ ] Career Roadmap tab still works
- [ ] Fallback messages appear gracefully if API fails

---

## 🎉 SUCCESS!

You now have a **real, intelligent AI Career Coach** powered by Google Gemini!

### Next Steps:
1. Test with different career questions
2. Share with users
3. Monitor API usage
4. Collect feedback for improvements
5. Consider enterprise API key for production

---

**Questions or Issues?** Check troubleshooting section above or review the code in:
- Backend: `s:\MyProject\backend\server.js`
- Frontend: `s:\MyProject\frontend\src\components\Coach.jsx`
