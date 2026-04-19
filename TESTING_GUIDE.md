# 🧪 AI COACH TESTING GUIDE

## BEFORE YOU START

✅ Have you:
- [ ] Gotten a free Gemini API key from https://ai.google.dev/aistudio
- [ ] Updated `.env` with the valid key
- [ ] Restarted backend: `npm start` in `s:\MyProject\backend`
- [ ] Started frontend: `npm run dev` in `s:\MyProject\frontend`

---

## TEST SCENARIOS

### Test 1: QA/Testing Role Roadmap ✅

**Question:**
```
Roadmap for Quality Analyst. I know Java and SQL already.
```

**Expected Response Should Include:**
- [ ] 3-5 phases with timeline (e.g., "Phase 1: 3-4 months")
- [ ] Testing frameworks (Selenium, TestNG, JUnit)
- [ ] Tools: JIRA, TestRail, Jenkins
- [ ] Specific project ideas (e.g., "Build test automation for e-commerce site")
- [ ] Career progression (QA → Senior QA → QA Lead)
- [ ] Mentions Java/SQL as existing skills

**Bad Response (Generic):**
- ❌ "Be persistent and never give up"
- ❌ "Learn different programming languages"
- ❌ "Practice, practice, practice"

---

### Test 2: DevOps Engineer Roadmap ✅

**Question:**
```
I want to become a DevOps Engineer. Currently know Docker and Linux.
```

**Expected Response Should Include:**
- [ ] Kubernetes, Container orchestration
- [ ] CI/CD tools (Jenkins, GitLab CI, GitHub Actions)
- [ ] Infrastructure as Code (Terraform, Ansible)
- [ ] Monitoring tools (Prometheus, Grafana, ELK)
- [ ] Cloud platforms (AWS, Azure, or GCP)
- [ ] Phase-based roadmap with timelines
- [ ] References your existing Docker and Linux knowledge

---

### Test 3: React Developer Career Path ✅

**Question:**
```
I'm a React developer with 3 years experience. What skills should I add?
```

**Expected Response Should Include:**
- [ ] Backend (Node.js, databases)
- [ ] TypeScript and advanced patterns
- [ ] Testing (Jest, React Testing Library)
- [ ] System design and architecture
- [ ] Soft skills (leadership, mentoring)
- [ ] Next role: Senior Engineer, Tech Lead, Full-stack
- [ ] Specific tools/frameworks (Express, GraphQL, Next.js)

---

### Test 4: Career Switch - From Non-Tech ✅

**Question:**
```
I'm transitioning from marketing to tech. I have no coding experience.
What's realistic?
```

**Expected Response Should Include:**
- [ ] Realistic timeline (6-12 months for junior role)
- [ ] Beginner-friendly path
- [ ] Foundation skills (HTML, CSS, JavaScript)
- [ ] Specific learning resources/platforms
- [ ] Portfolio projects (3-5 beginner projects)
- [ ] Job market reality check
- [ ] Soft skills that transfer from marketing

---

### Test 5: Skill Gap Analysis ✅

**Question:**
```
I know Python and SQL. How do I prepare for a Data Engineer role?
```

**Expected Response Should Include:**
- [ ] Data warehousing (Snowflake, BigQuery, Redshift)
- [ ] ETL/ELT tools (Airflow, dbt, Spark)
- [ ] Big data concepts (Hadoop, Spark)
- [ ] Cloud platforms (AWS, GCP)
- [ ] Building data pipelines (specific examples)
- [ ] Timeline estimate
- [ ] Projects: "Build ETL for stock market data" etc.

---

## LOGGING VERIFICATION

### Browser Console (F12 → Console)

You should see:
```
🚀 SENDING TO AI COACH:
📝 Message: "Roadmap for QA Engineer"
👤 User Context: {
  name: "John",
  skills: ["Java", "SQL"],
  experience: "3 years",
  goal: "QA Engineer"
}
📨 RESPONSE FROM BACKEND: {success: true, data: {message: "..."}}
✅ GOT AI RESPONSE: Phase 1: Foundation (3-4 months)...
```

### Backend Terminal

You should see:
```
[timestamp] POST /api/coach/message
📨 USER MESSAGE: Roadmap for QA Engineer
👤 USER CONTEXT: {name: 'John', skills: ['Java', 'SQL'], experience: '3 years', goal: 'QA Engineer'}
🔧 PROMPT BUILT: You are a professional AI Career Coach...
✅ GEMINI API SUCCESS
📝 AI RESPONSE PREVIEW: Phase 1: Foundation (3-4 months)...
```

---

## QUALITY CHECKLIST

For each test, verify:

- [ ] Response is **specific** (mentions tools, frameworks, specific projects)
- [ ] Response is **personalized** (references user's current skills)
- [ ] Response includes **timeline** (e.g., "3-6 months", "Phase 1: 4 weeks")
- [ ] Response has **actionable steps** (not just theory)
- [ ] Response mentions **real tools** (not generic "learn technologies")
- [ ] Response avoids **generic advice** like "be persistent"
- [ ] Response includes **project ideas** (concrete portfolio projects)
- [ ] Response addresses **career trajectory** (what comes after)

---

## DEBUGGING

### Issue: Getting generic responses

Check:
1. **Backend logs** - Does it show your user context?
   ```
   👤 USER CONTEXT: {name: '...', skills: [...], ...}
   ```
   If empty, frontend is not sending user data

2. **API Key** - Is it valid?
   ```
   ✅ GEMINI API SUCCESS
   ```
   If you see ❌ API ERROR, key is invalid

3. **Prompt** - Is it the new structured prompt?
   ```
   🔧 PROMPT BUILT: You are a professional AI Career Coach...
   ```

### Issue: "API key not valid"

```bash
# 1. Get new key from https://ai.google.dev/aistudio
# 2. Update .env
GEMINI_API_KEY=your_new_key_here

# 3. Restart backend
cd s:\MyProject\backend
npm start

# 4. Test again
```

### Issue: No logging visible

1. **Browser**: Open DevTools with F12 → Console tab
2. **Backend**: Check terminal running `npm start`
3. **Make sure** you're making a new request (not using old data)

---

## EXPECTED vs ACTUAL

### ❌ BAD RESPONSE (What we DON'T want)
```
"To become a QA Engineer, you need to learn testing, be persistent, 
and practice regularly. Study various programming languages and build 
projects. Networking is important too. Good luck!"
```

### ✅ GOOD RESPONSE (What we DO want)
```
Phase 1: Foundation (3-4 months)
- Manual Testing: ISTQB certification, test plan creation
- Tools: JIRA, TestRail, Charles Proxy
- Projects: Create test plan for banking web app

Phase 2: Technical Skills (4-6 months)
- Automation: Selenium WebDriver, TestNG
- Languages: Java (you have this!) or Python
- CI/CD: Jenkins integration basics
- Project: Build Selenium framework for e-commerce

Phase 3: Advanced (6-8 months)
- API Testing: Postman, REST Assured
- Performance: JMeter, LoadRunner
- Cloud Testing: AWS, Azure
- Project: End-to-end test automation suite

Career Path: QA → Senior QA (2-3 yrs) → QA Lead → QA Manager
Next step: Focus on Selenium and Java integration for 2-3 months
```

---

## TEST COMMAND (CLI)

If you want to test via PowerShell:

```powershell
# Create test request
$body = @{
    message = "Roadmap for QA Engineer. I know Java and SQL."
    userContext = @{
        name = "John"
        skills = @("Java", "SQL")
        experience = "3 years"
        goal = "QA Engineer"
    }
} | ConvertTo-Json

# Send to backend
$response = Invoke-WebRequest -Uri 'http://localhost:5000/api/coach/message' `
    -Method POST `
    -ContentType 'application/json' `
    -Body $body `
    -UseBasicParsing

# View response
$response | ConvertFrom-Json | Select-Object success, `
    @{Name='Message';Expression={$_.data.message}}
```

---

## 📊 SUCCESS METRICS

Once you have a valid API key, you should see:

- ✅ **Specific responses**: Tool names, framework names, real technologies
- ✅ **Personalized**: References user's current skills/experience
- ✅ **Actionable**: Step-by-step phases with timelines
- ✅ **Complete**: Includes skills, tools, projects, career path
- ✅ **Logging**: Visible in browser console and backend terminal
- ✅ **Fast**: Response within 3-10 seconds
- ✅ **Consistent**: Same question gives similar (not identical) answers

---

## 🎓 LEARNING GOALS

What you'll verify works:

1. **Prompt Engineering**: Structured prompts produce specific responses
2. **User Context**: System personalizes based on skills/experience
3. **Logging**: Full visibility into what's happening
4. **Error Handling**: Graceful fallback if API fails
5. **Frontend-Backend**: Data flows correctly end-to-end
