# 🔧 GEMINI API SETUP GUIDE - REQUIRED FOR AI COACH

## ⚠️ CURRENT STATUS
The Gemini API key in your `.env` file is **INVALID**. This is why the AI Coach returns fallback responses.

---

## ✅ STEP 1: GET A FREE GEMINI API KEY

1. Go to **[Google AI Studio](https://ai.google.dev/aistudio)**
2. Click **"Get API Key"**
3. Click **"Create API Key in new Google Cloud project"**
4. Copy the API key

---

## ✅ STEP 2: UPDATE YOUR .env FILE

Edit `s:\MyProject\backend\.env` and replace:

```
GEMINI_API_KEY=your_actual_key_here
```

Example:
```
GEMINI_API_KEY=AIzaSyD1234567890abcdefghijklmnopqrst
```

---

## ✅ STEP 3: RESTART BACKEND

```bash
cd s:\MyProject\backend
npm start
```

You should see:
```
✅ Connected to In-Memory Database for Local Development
Backend running on http://localhost:5000
```

---

## ✅ STEP 4: TEST IN FRONTEND

1. Start frontend: `npm run dev` in `s:\MyProject\frontend`
2. Go to **Career Coach** tab
3. Ask: **"roadmap for quality analyst"**

Expected result: Detailed step-by-step roadmap with:
- Skills to learn
- Tools (Selenium, JIRA, etc.)
- Projects to build
- Career tips

---

## 🚀 WHAT YOU'LL SEE IN LOGS

Backend logs should show:

```
📨 USER MESSAGE: "roadmap for quality analyst"
👤 USER CONTEXT: { name: '...', skills: [...], experience: '...', goal: '...' }
🔧 PROMPT BUILT: You are a professional AI Career Coach...
✅ GEMINI API SUCCESS
📝 AI RESPONSE PREVIEW: Phase 1: Foundation (3-4 months)...
```

---

## ❌ IF STILL NOT WORKING

Check:
1. **Invalid Key Error**: Your API key is wrong → Get new one from [Google AI Studio](https://ai.google.dev/aistudio)
2. **API Quota**: Free tier has limits → Check your usage in Google Cloud Console
3. **Network**: Ensure you can reach `generativelanguage.googleapis.com`
4. **Restart**: Kill and restart `npm start` after updating .env

---

## 📋 PROMPT ENGINEERING DETAILS

The new prompt structure sends:

```javascript
{
  USER PROFILE: name, skills, experience, career goal
  USER QUESTION: exact message
  INSTRUCTIONS: 
    - Be specific, not generic
    - Include skills, tools, projects, timelines
    - If roadmap asked: 3-5 phases with details
}
```

This ensures responses are **role-specific** and **actionable**.

---

## ✨ EXAMPLE QUESTIONS FOR TESTING

```
1. "Roadmap for Quality Analyst"
   → Should return testing tools (Selenium, JIRA), QA phases, projects

2. "How do I become a Senior React Developer?"
   → Should mention React patterns, TypeScript, testing, system design

3. "Skills for DevOps Engineer?"
   → Should list Docker, Kubernetes, CI/CD, AWS, monitoring tools

4. "Career guidance for 5 years experience in Java"
   → Should suggest advanced topics, leadership, architecture
```

---

## 🎯 VERIFICATION CHECKLIST

- [ ] Got API key from Google AI Studio
- [ ] Updated `.env` with valid key
- [ ] Restarted backend (`npm start`)
- [ ] Tested with a question
- [ ] Got detailed, role-specific response (not generic)
- [ ] Response includes skills, tools, projects, timeline
- [ ] Browser console shows "🚀 SENDING TO AI COACH" logs

---

## 📞 NEED HELP?

- **API Key Issues**: https://ai.google.dev/aistudio
- **Gemini API Docs**: https://ai.google.dev/docs
- **Rate Limits**: Free tier: 60 requests per minute
