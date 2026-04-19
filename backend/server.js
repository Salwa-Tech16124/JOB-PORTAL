import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Initialize OpenAI API
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.warn('⚠️ OPENAI_API_KEY not found in .env file.');
}
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
app.use(cors());
app.use(express.json());

// Basic Request Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-123';

const standardResponse = (res, success, data, message, statusCode = 200) => {
    return res.status(statusCode).json({ success, data, message });
};

// ============== IN-MEMORY DATABASE ==============
const database = {
  users: [],
  jobs: [],
  profiles: [],
  nextUserId: 1,
  nextJobId: 1,
  nextProfileId: 1
};

// Helper functions for database operations
const findUserByEmail = (email) => database.users.find(u => u.email === email);
const findUserById = (id) => database.users.find(u => u.id === id);
const createUser = (email, hashedPassword, role) => {
  const user = { id: database.nextUserId++, email, password: hashedPassword, role, createdAt: new Date() };
  database.users.push(user);
  return user;
};

const createProfile = (userId, data) => {
  const profile = { id: database.nextProfileId++, userId, ...data, createdAt: new Date() };
  database.profiles.push(profile);
  return profile;
};

const createJob = (title, company, description, employerId) => {
  const job = { id: database.nextJobId++, title, company, description, employerId, createdAt: new Date() };
  database.jobs.push(job);
  return job;
};

console.log('✅ Connected to In-Memory Database for Local Development');

// ============== MIDDLEWARE ==============
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return standardResponse(res, false, null, 'Unauthorized', 401);
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return standardResponse(res, false, null, 'Invalid token', 401);
  }
};

// ============== AUTH APIs ==============
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (findUserByEmail(email)) {
      return standardResponse(res, false, null, 'Email already exists', 400);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = createUser(email, hashedPassword, role);
    console.log(`✅ User registered: ${email} (${role})`);
    return standardResponse(res, true, { id: user.id, email: user.email }, 'User registered', 201);
  } catch (error) {
    console.error(`❌ Registration error:`, error.message);
    return standardResponse(res, false, null, error.message, 400);
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.log(`⚠️ Failed login attempt for: ${email}`);
      return standardResponse(res, false, null, 'Invalid credentials', 401);
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    console.log(`✅ Login successful: ${email}`);
    return standardResponse(res, true, { token, user: { id: user.id, email: user.email, role: user.role } }, 'Login successful');
  } catch (error) {
    console.error(`❌ Login error:`, error.message);
    return standardResponse(res, false, null, error.message, 500);
  }
});

// ============== JOB APIs ==============
app.get('/api/jobs', async (req, res) => {
  try {
      return standardResponse(res, true, database.jobs, 'Jobs fetched');
  } catch (e) {
      return standardResponse(res, false, null, e.message, 500);
  }
});

app.post('/api/jobs', authMiddleware, async (req, res) => {
  try {
      if (req.user.role !== 'employer') return standardResponse(res, false, null, 'Forbidden', 403);

      // 1. AI Fraud Detection
      try {
        const aiRes = await fetch('http://127.0.0.1:8000/agent/fraud-detection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: req.body.title || '', description: req.body.description || '' })
        });
        const aiDataOut = await aiRes.json();
        const aiData = aiDataOut.data; 
        
        if (aiData && aiData.is_fake) {
          return standardResponse(res, false, { flags: aiData.flags_found }, 'Job flagged as fraudulent. Suspicious keywords detected.', 400);
        }
      } catch(e) {
        console.error('AI Service down:', e);
      }

      const job = createJob(req.body.title, req.body.company, req.body.description, req.user.id);
      return standardResponse(res, true, job, 'Job created', 201);
  } catch (e) {
      return standardResponse(res, false, null, e.message, 500);
  }
});

app.get('/api/jobs/:id/match', authMiddleware, async (req, res) => {
  try {
    const job = database.jobs.find(j => j.id == req.params.id);
    const profile = database.profiles.find(p => p.userId === req.user.id);
    
    if (!profile || !profile.skills || profile.skills.length === 0) {
       return standardResponse(res, false, null, 'Please complete your profile first', 400);
    }

    const aiRes = await fetch('http://127.0.0.1:8000/agent/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_skills: profile.skills, job_description: job.description })
    });
    
    const matchDataWrapper = await aiRes.json();
    return standardResponse(res, matchDataWrapper.success, matchDataWrapper.data, matchDataWrapper.message);
  } catch(e) {
    return standardResponse(res, false, null, e.message, 500);
  }
});

// ============== PROFILE APIs ==============
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
      let profile = database.profiles.find(p => p.userId === req.user.id);
      return standardResponse(res, true, profile || {}, 'Profile fetched');
  } catch (e) {
      return standardResponse(res, false, null, e.message, 500);
  }
});

app.post('/api/profile', authMiddleware, async (req, res) => {
  try {
      let { experience } = req.body;
      
      let aiData = {};
      if (experience) {
        try {
          const aiRes = await fetch('http://127.0.0.1:8000/agent/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: experience })
          });
          const wrappedData = await aiRes.json();
          if (wrappedData.success) {
             aiData = wrappedData.data;
          }
        } catch(e) {
          console.error('AI Service down:', e);
        }
      }

      let profile = database.profiles.find(p => p.userId === req.user.id);
      const updateData = {
        ...req.body,
        skills: aiData.skills || [],
        experience: aiData.summary || experience
      };

      if (profile) {
        Object.assign(profile, updateData);
      } else {
        profile = createProfile(req.user.id, updateData);
      }
      
      return standardResponse(res, true, profile, 'Profile updated');
  } catch (e) {
      return standardResponse(res, false, null, e.message, 500);
  }
});

// ============== AI COACH - ADVANCED INTENT-DRIVEN COACHING ==============

// Detect user intent from message
const detectUserIntent = (message) => {
  const msg = message.toLowerCase();
  
  if (msg.includes('roadmap') || msg.includes('path') || msg.includes('steps') || msg.includes('phases')) {
    return 'roadmap';
  } else if (msg.includes('skill') || msg.includes('learn') || msg.includes('improve')) {
    return 'skills';
  } else if (msg.includes('interview') || msg.includes('prepare') || msg.includes('questions')) {
    return 'interview';
  } else if (msg.includes('salary') || msg.includes('compensation') || msg.includes('pay') || msg.includes('income') || msg.includes('earning') || msg.includes('negotiate')) {
    return 'salary';
  } else if (msg.includes('switch') || msg.includes('transition') || msg.includes('career change')) {
    return 'career_switch';
  } else if (msg.includes('role') || msg.includes('engineer') || msg.includes('developer') || msg.includes('qa') || msg.includes('analyst')) {
    return 'role_specific';
  }
  
  return 'general';
};

// Check if response is too generic (safety guard) - STRICT VERSION
const isResponseTooGeneric = (response, intent) => {
  const genericPhrases = [
    'improve communication',
    'be persistent',
    'practice regularly',
    'work hard',
    'never give up',
    'learn to code',
    'build projects',
    'network with others',
    'stay updated',
    'keep learning',
    'focus on learning',
    'develop skills',
    'keep practicing',
    'gain experience',
    'build experience'
  ];

  const lowerResponse = response.toLowerCase();
  const genericCount = genericPhrases.filter(phrase => lowerResponse.includes(phrase)).length;
  
  // STRICT: If response has ANY generic phrases, flag it
  if (genericCount >= 2) {
    console.warn(`⚠️ DETECTED ${genericCount} GENERIC PHRASES IN RESPONSE`);
    return true;
  }
  
  // Check intent-specific structural requirements
  if (intent === 'roadmap') {
    if (!lowerResponse.includes('phase 1') && !lowerResponse.includes('phase 1:')) {
      console.warn('⚠️ ROADMAP MISSING PHASE 1 STRUCTURE');
      return true;
    }
    if (!lowerResponse.includes('phase 2') && !lowerResponse.includes('phase 2:')) {
      console.warn('⚠️ ROADMAP MISSING PHASE 2 STRUCTURE');
      return true;
    }
    if (!lowerResponse.includes('phase 3') && !lowerResponse.includes('phase 3:')) {
      console.warn('⚠️ ROADMAP MISSING PHASE 3 STRUCTURE');
      return true;
    }
  }
  
  // Check minimum length
  if (response.length < 250) {
    console.warn(`⚠️ RESPONSE TOO SHORT (${response.length} chars)`);
    return true;
  }
  
  // Check if response lacks specificity indicators
  const specificIndicators = ['phase', 'timeline', 'tool', 'framework', 'technology', 'project', 'skill', 'month', 'year', 'week', 'day', 'selenium', 'jest', 'docker', 'kubernetes', 'aws', 'react', 'python', 'java', 'node'];
  const specificity = specificIndicators.filter(indicator => lowerResponse.includes(indicator)).length;
  
  if (specificity < 2 && response.length < 400) {
    console.warn(`⚠️ LOW SPECIFICITY (${specificity} indicators)`);
    return true;
  }
  
  return false;
};

// Force structure for roadmap responses
const forceRoadmapStructure = (response) => {
  const lowerResponse = response.toLowerCase();
  
  // Check if it already has proper structure
  if (lowerResponse.includes('phase 1') && lowerResponse.includes('phase 2') && lowerResponse.includes('phase 3')) {
    return response; // Already has structure
  }
  
  console.warn('⚠️ FORCING ROADMAP STRUCTURE - AI RESPONSE LACKED PHASES');
  
  // Auto-generate proper roadmap structure
  return `## Phase 1: Foundation (3-4 months)
### Skills to Learn:
* Core fundamentals
* Industry-standard tools setup
* Best practices

### Tools & Technologies:
* Essential development tools
* Platform setup
* Version control

### Projects to Build:
* Beginner-level project with guidance
* Focus on learning fundamentals
* Building portfolio piece

---

## Phase 2: Intermediate (4-6 months)
### Skills to Learn:
* Advanced techniques
* Optimization strategies
* Industry standards

### Tools & Technologies:
* Intermediate tools and frameworks
* CI/CD integration basics
* Monitoring and debugging

### Projects to Build:
* More complex, real-world project
* Integration with multiple tools
* Performance considerations

---

## Phase 3: Advanced (6-8 months)
### Skills to Learn:
* Expert-level capabilities
* System design principles
* Leadership skills

### Tools & Technologies:
* Advanced frameworks and platforms
* Scalability solutions
* Enterprise-grade tools

### Projects to Build:
* Scalable, production-ready system
* Mentoring others
* Contributing to industry

---

**Note:** Original AI response had structural issues. This is an auto-corrected version. For more detailed guidance, please rephrase your question with more specifics about your target role.

Original feedback: ${response.substring(0, 200)}...`;
};

// Build intent-specific prompt
const buildCoachPrompt = (message, userContext, intent) => {
  const { name = 'Guest User', skills = [], experience = 'Beginner', goal = 'Not specified' } = userContext || {};
  const skillsStr = Array.isArray(skills) && skills.length > 0 ? skills.join(', ') : 'None specified';

  const basePrompt = `You are a STRICT, NO-NONSENSE AI Career Coach. NEVER give generic advice.

USER PROFILE:
- Name: ${name}
- Current Skills: ${skillsStr}
- Experience Level: ${experience}
- Career Goal: ${goal}

USER QUESTION:
"${message}"

DETECTED INTENT: ${intent}`;

  // Intent-specific formatting
  if (intent === 'roadmap') {
    return basePrompt + `

CRITICAL RULE: Return EXACTLY in this format (DO NOT DEVIATE):

## Phase 1: Foundation (Timeline)
### Skills to Learn:
* [Specific skill 1]
* [Specific skill 2]

### Tools & Technologies:
* [Tool/Framework 1]
* [Tool/Framework 2]

### Projects to Build:
* [Concrete project idea 1]
* [Concrete project idea 2]

## Phase 2: Intermediate (Timeline)
### Skills to Learn:
* [Specific skill 1]
* [Specific skill 2]

### Tools & Technologies:
* [Tool/Framework 1]
* [Tool/Framework 2]

### Projects to Build:
* [Concrete project idea 1]

## Phase 3: Advanced (Timeline)
### Skills to Learn:
* [Advanced skill 1]

### Tools & Technologies:
* [Advanced tool 1]

### Projects to Build:
* [Advanced project]

---

⚠️ CRITICAL RULES:
1. NEVER use generic phrases like "improve communication" or "be persistent"
2. ALWAYS specify timelines (e.g., "3-4 months", "6 weeks")
3. ALWAYS list REAL tools (Selenium, JIRA, Docker, etc.)
4. ALWAYS list SPECIFIC projects with context
5. Make sure your answer is 500+ words
6. Reference user's current skills: ${skillsStr}`;
  }

  if (intent === 'skills') {
    return basePrompt + `

CRITICAL RULE: List skills in order of importance with reasoning.

Format:
## Skills to Learn (in priority order)

### 1. [Skill Name] - Priority: HIGH
Why: [Specific reason tied to user's goal]
How to learn: [Specific resources - courses, books, projects]
Timeline: [Realistic timeframe]
Tools: [What tools use this skill]

### 2. [Skill Name] - Priority: HIGH/MEDIUM/LOW
...

⚠️ CRITICAL RULES:
1. Focus on SPECIFIC skills, not "coding" or "learning"
2. Include timelines and learning strategies
3. Rank by relevance to user's goal
4. Provide resource recommendations
5. Make it 400+ words
6. NO generic advice`;
  }

  if (intent === 'interview') {
    return basePrompt + `

CRITICAL RULE: Provide SPECIFIC interview prep strategies.

Format:
## Interview Preparation for [Role]

### Technical Topics to Master:
* [Specific topic 1] - Study resources: [specific books/courses]
* [Specific topic 2] - Practice platform: [LeetCode, HackerRank, etc.]

### Projects to Showcase:
* [Project 1] - Why it's impressive: [specific reason]
* [Project 2] - What it demonstrates: [specific skills]

### Behavioral Questions Likely to Ask:
* "Tell me about a time when..." - Answer strategy: [specific approach]

⚠️ CRITICAL RULES:
1. Base recommendations on user's skill level: ${experience}
2. Mention specific resources (not just "study hard")
3. Include real projects they should build
4. Provide sample answers to tough questions
5. Make it 500+ words`;
  }

  if (intent === 'role_specific') {
    return basePrompt + `

CRITICAL RULE: Provide role-specific, non-generic guidance.

Format:
## [Role] Career Path

### Day-to-Day Responsibilities:
* [Specific task 1]
* [Specific task 2]

### Required Skills:
* [Skill 1] - Proficiency level: [Intermediate/Advanced]
* [Skill 2] - Proficiency level: [Beginner/Intermediate]

### Must-Have Tools:
* [Tool 1] - Used for: [specific purpose]
* [Tool 2] - Used for: [specific purpose]

### Learning Roadmap:
[Provide 3-phase roadmap specific to this role]

### Salary & Progression:
* Entry level (~${experience}): $[range]
* Senior level: $[range]
* Next role after mastery: [Specific progression]

⚠️ CRITICAL RULES:
1. Be SPECIFIC to the role mentioned
2. Include salary ranges based on market
3. Mention specific tools used in this role
4. Provide progression path
5. Make it 600+ words
6. Reference user's current skills`;
  }

  // General fallback
  return basePrompt + `

CRITICAL RULE: Convert vague query into specific career guidance.

Steps:
1. Identify what role/skill they're interested in
2. Ask clarifying question if needed
3. Provide detailed roadmap for that role

If query is too vague:
"To give you the best guidance, which role interests you most?

Examples:
* QA Engineer - Testing automation, JIRA, Selenium
* Frontend Developer - React, TypeScript, system design
* AI Engineer - Python, TensorFlow, LLMs
* DevOps Engineer - Docker, Kubernetes, AWS

Once you pick, I'll give you a detailed roadmap."

Otherwise, provide full 500+ word roadmap for the implied role.

⚠️ NO generic advice like "be persistent" or "learn to code"
⚠️ ALWAYS be specific, structured, and role-focused`;
};

// Generate PERSONALIZED fallback responses based on user context
const generatePersonalizedFallback = (message, userContext, intent) => {
  const { name, skills = [], experience, goal } = userContext;
  const skillList = skills.length > 0 ? skills.join(', ') : 'foundational skills';
  const namePrefix = name ? `Hey ${name}! ` : 'Hey there! ';
  
  // Intent-specific detailed responses
  if (intent === 'roadmap') {
    return `${namePrefix}Here's your personalized 12-month roadmap to become a ${goal || 'Professional'}:

**Your Current Foundation:**
- Experience Level: ${experience}
- Current Skills: ${skillList}
- Target: Become a ${goal}

---

## 📊 PHASE 1: Foundation Mastery (Months 1-3)
**Goal:** Build rock-solid fundamentals and establish your learning discipline

### Core Competencies to Develop:
* Essential concepts and theoretical foundation for ${goal}
* Practical hands-on implementation skills
* Version control proficiency (Git workflows)
* Code quality standards and best practices
* Problem-solving methodology
* Reading and understanding technical documentation

### Critical Tools & Technologies:
* **Version Control:** Git + GitHub (master commits, branches, PRs)
* **Development Environment:** VS Code, proper IDE setup for ${goal}
* **Communication:** Discord/Slack for community engagement
* **Learning Platforms:** Udemy, Coursera, YouTube (structured learning)
* **Documentation:** Official docs for your tech stack
* **Code Practice:** LeetCode (beginner/easy tier)

### Real-World Projects to Build:
1. **Personal Portfolio Website**
   - Showcase your ${goal} skills with 2-3 past projects
   - Deploy on GitHub Pages or Netlify
   - Time: 2 weeks
   - Skills: HTML/CSS/JS, Git, deployment basics

2. **Beginner Project in Your ${goal} Domain**
   - Example (AI Engineer): Build a chatbot using ChatGPT API
   - Example (Backend Dev): REST API with Node.js
   - Example (Full Stack): Todo app with user authentication
   - Time: 4 weeks
   - Skills: Core language features, APIs, databases

3. **Open Source Contribution (Small)**
   - Fix documentation or small bugs
   - Time: 1 week scattered throughout
   - Skills: Collaboration, PR process

### Daily/Weekly Schedule:
- **Daily:** 1-2 hours focused learning + 1 hour coding practice
- **Weekly:** 1 complete project session (3-4 hours)
- **Bi-weekly:** Code review with peer or mentor

### Success Metrics:
✓ Complete 50+ beginner coding challenges
✓ Build 1 complete portfolio project
✓ Contribute to 1 open-source repository
✓ Achieve 80% understanding of core concepts

---

## 🚀 PHASE 2: Professional Development (Months 4-6)
**Goal:** Build production-ready skills and start professional-level projects

### Advanced Competencies to Develop:
* System design and architecture thinking
* Advanced problem-solving techniques
* Performance optimization and debugging
* Testing strategies (unit, integration, end-to-end)
* Code review and collaboration skills
* API design principles
* Database optimization
* Deployment and DevOps basics

### Essential Tools & Technologies:
* **Testing:** Jest, Mocha, Pytest (depending on your tech)
* **DevOps:** Docker (containerization basics)
* **Monitoring:** GitHub Actions (CI/CD pipeline basics)
* **Database Tools:** MongoDB Compass, pgAdmin, or MySQL Workbench
* **API Design:** Postman, Swagger/OpenAPI
* **Code Quality:** ESLint, Prettier, SonarQube
* **Advanced Practice:** LeetCode (medium tier - 100+ problems)

### Production-Level Projects:
1. **Full-Featured Application**
   - Example: Job portal with user auth, job listings, applications
   - Example: E-commerce platform with payments
   - Example: Real-time collaboration tool
   - Time: 6-8 weeks
   - Skills: Full stack, databases, APIs, authentication

2. **Open Source Contribution (Significant)**
   - Feature development or bug fixing
   - Time: 2-3 weeks
   - Skills: Collaboration, codebase navigation, testing

3. **Performance Optimization Project**
   - Identify a slow project and optimize it
   - Document your improvements with benchmarks
   - Time: 2 weeks
   - Skills: Profiling, optimization, monitoring

### Advanced Learning Topics:
* System Design Primer or Byte Byte Go course
* Distributed systems fundamentals
* Database indexing and query optimization
* Microservices architecture introduction
* Security best practices (OWASP Top 10)

### Weekly Schedule:
- **Daily:** 2-3 hours (1.5 hours learning + 1.5 hours coding)
- **Weekly Project:** 6-8 hours focused work
- **Code Review:** 2-3 peer code reviews

### Success Metrics:
✓ Complete 100+ medium-level coding problems
✓ Ship 1 production-level full application
✓ Implement CI/CD pipeline for your project
✓ Write comprehensive test suite (80%+ coverage)
✓ Deploy to production (Heroku, Vercel, AWS)

---

## 💎 PHASE 3: Mastery & Leadership (Months 7-12)
**Goal:** Achieve expertise, build your personal brand, and prepare for senior roles

### Expert-Level Competencies:
* Advanced system architecture and design patterns
* Technical leadership and mentoring abilities
* Complex problem-solving across multiple domains
* Performance optimization at scale
* Cloud infrastructure fundamentals
* Advanced security practices
* Technical writing and documentation skills
* Networking and industry engagement

### Advanced Tools & Technologies:
* **Cloud Platforms:** AWS, Google Cloud, or Azure basics
* **Containerization:** Kubernetes (orchestration)
* **Monitoring:** DataDog, New Relic, or ELK Stack
* **Advanced DevOps:** Terraform, CI/CD mastery
* **Specialized Tools:** Based on your ${goal} domain
* **LeetCode:** Hard tier + system design interviews

### High-Impact Projects:
1. **Enterprise-Scale Application**
   - Example: Multi-tenant SaaS platform
   - Example: Real-time analytics dashboard
   - Example: Microservices architecture system
   - Time: 8-12 weeks
   - Skills: Scalability, microservices, cloud architecture

2. **Open Source Leadership**
   - Maintain an active open source project
   - Build a community around it
   - Time: Ongoing (5-10 hours/week)
   - Skills: Leadership, mentoring, community building

3. **Technical Content Creation**
   - Write 4-5 technical blog posts about your learnings
   - Create video tutorials (YouTube or Dev.to)
   - Example: "How I optimized [system] for 10x performance"
   - Time: 1-2 hours/week

4. **Personal Brand & Network**
   - Speak at meetups or conferences (local or virtual)
   - Build Twitter/LinkedIn presence with technical content
   - Network with top engineers in your field
   - Time: 3-5 hours/week

### Advanced Learning:
* Advanced system design (designing Google/Netflix-scale systems)
* Distributed systems and consensus algorithms
* Advanced database optimization and scaling
* Zero-trust security architecture
* AI/ML integration (for relevant roles)
* Industry certifications (if applicable)

### Weekly Schedule:
- **Daily:** 2-3 hours (mix of learning + shipping features)
- **Weekly Project:** 8-10 hours focused work
- **Mentoring:** 2-3 hours helping junior developers
- **Content:** 2-3 hours writing or speaking

### Success Metrics:
✓ Ship 2+ enterprise-level applications
✓ Build active open source project with 50+ stars
✓ Publish 5+ technical articles (1000+ views each)
✓ Get a senior/lead role offer or promotion
✓ Mentor 2-3 junior developers
✓ Speak at 1 conference or major meetup

---

## 📋 Your Personalized Action Plan

### This Week:
1. ✅ Set up your development environment
2. ✅ Choose 1 beginner project from Phase 1
3. ✅ Create a GitHub profile with README
4. ✅ Join 1 community (Discord, Slack, Reddit) for ${goal}

### Next 2 Weeks:
1. Complete first Phase 1 project
2. Solve 10-15 easy LeetCode problems
3. Read 1 technical article daily from Dev.to

### Next 30 Days:
1. Complete Phase 1 basic projects
2. Build your first portfolio project
3. Start contributing to open source
4. Track progress in a learning journal

---

## 🎯 Key Success Principles:
1. **Build in Public:** Share your progress on GitHub and Twitter
2. **Consistency Over Intensity:** 1-2 hours daily beats cramming
3. **Project-Based Learning:** Build real projects, not just tutorials
4. **Community Engagement:** Learn from others, help others
5. **Regular Reflection:** Review monthly what's working/what's not

You've got this! The path to ${goal} is challenging but absolutely achievable with consistency and focus. Start Phase 1 this week! 💪`;
  }
  
  if (intent === 'skills') {
    return `${namePrefix}Based on your goal of becoming a ${goal}, here's a strategic skills development plan:

**Your Current Baseline:**
- Experience Level: ${experience}
- Existing Skills: ${skillList}

---

## 🎯 TIER 1: Critical Foundation Skills (Next 4-6 Weeks)

### 1. Core ${goal} Concepts & Theory
- **Time:** 3-4 weeks, 3-4 hours daily
- **Topics:** Fundamentals, best practices, standards, limitations
- **Resources:** Udemy courses, official docs, foundational textbooks
- **Practice:** Note-taking, concept diagrams, explaining to others

### 2. Practical Development Setup
- **Time:** 1 week hands-on
- **Tools:** Git/GitHub, VS Code, package managers, debuggers
- **Practice:** Set up 3 different projects from scratch
- **Verification:** Comfortable with 80% CLI commands

### 3. Essential Problem-Solving Framework  
- **Time:** 2-3 weeks, 1-2 hours daily
- **Skills:** Time/space complexity, algorithmic patterns, edge cases
- **Practice:** LeetCode (50+ Easy problems)
- **Goal:** Solve easy problems in 15-20 minutes confidently

---

## 🚀 TIER 2: Professional Competencies (Weeks 7-16)

### 4. Advanced Algorithms & Data Structures
- **Time:** 8-10 weeks, 1.5 hours daily
- **Coverage:** Arrays, Linked Lists, Trees, Graphs, DP, Recursion
- **Practice:** LeetCode Medium tier (100+ problems)
- **Assessment:** Medium problems in 40-50 minutes

### 5. System Design Fundamentals
- **Time:** 4-5 weeks, 2 hours twice weekly
- **Topics:** Scalability, databases, caching, APIs, microservices
- **Resources:** System Design Primer, Designing Data-Intensive Apps
- **Practice:** Design 3-5 real systems with documentation

### 6. Testing & Quality Assurance
- **Time:** 3-4 weeks
- **Master:** Unit tests, integration tests, TDD, 80%+ coverage
- **Practice:** Write tests for 2 projects, set up CI/CD hooks
- **Goal:** Test coverage becomes automatic habit

### 7. Version Control & Collaboration
- **Time:** 2-3 weeks
- **Skills:** Git rebasing, cherry-picking, meaningful commits, code reviews
- **Practice:** Contribute to 3 open-source projects
- **Assessment:** PRs with clean history

### 8. Performance Optimization & Debugging
- **Time:** 4-5 weeks ongoing
- **Tools:** Profilers, Chrome DevTools, database analyzers, load testing
- **Real Practice:** Optimize 1 project for 10x speed improvement

---

## 💎 TIER 3: Expert Skills (Weeks 17+)

### 9. Cloud & DevOps
- **Time:** 5-6 weeks
- **Cover:** Docker, Kubernetes, CI/CD, Terraform, monitoring
- **Practice:** Deploy 3 apps with Docker + GitHub Actions

### 10. Security & Best Practices
- **Time:** 3-4 weeks
- **Topics:** OWASP Top 10, auth, encryption, API security
- **Practice:** Security audit of 2 projects

### 11. Technical Communication
- **Actions:** Write 1 blog post/month, 2 design docs, 1 presentation
- **Develop:** Clear documentation, ADRs, Swagger/OpenAPI

### 12. Design Patterns & Architecture
- **Time:** 6-8 weeks
- **Learn:** SOLID, design patterns, domain-driven design, event-driven
- **Practice:** Redesign 2 projects with better patterns

---

## 📊 Learning Schedule

**Month 1:** Foundation sprint (4 hrs/day)
**Months 2-4:** Professional depth (3 hrs/day learning + coding)
**Months 5+:** Expert mastery (2 hrs learning + 2 hrs shipping)

**Timeline to mastery:** 12-18 months with consistent daily effort! 🚀`;
  }
  
  if (intent === 'interview') {
    return `${namePrefix}Here's your complete interview preparation guide for ${goal} roles:

**Your Profile:**
- Experience: ${experience}
- Skills: ${skillList}
- Target: ${goal}

---

## 🎯 TECHNICAL INTERVIEW PREPARATION

### 1. Data Structures & Algorithms (Critical)
- **Time:** 6-8 weeks, 1-2 hours daily
- **Topics:**
  * Arrays, Linked Lists, Stacks, Queues
  * Trees (Binary, BST, AVL), Graphs
  * Sorting (QuickSort, MergeSort, Heapsort)
  * Searching, Dynamic Programming, Recursion
  * Hash Tables, Tries, Heaps
- **Practice:** LeetCode 500+ problems
  * Week 1-2: 20-30 easy problems
  * Week 3-6: 50-100 medium problems
  * Week 7-8: 30-50 hard problems + patterns
- **Daily Routine:**
  * Solve 2-3 new problems (40 mins)
  * Review optimal solutions (20 mins)
  * Note patterns and approaches (10 mins)
- **Goal:** Medium problems in 30 minutes confidently

### 2. System Design (for mid-level+)
- **Time:** 4-5 weeks, 2 hours twice weekly
- **Real-World Systems to Design:**
  * URL Shortener
  * Instagram / Photo sharing
  * Uber / Ride sharing
  * Netflix / Video streaming
  * Twitter / Social feed
  * WhatsApp / Messaging
  * Airbnb / Booking
- **Cover for Each:**
  * Functional requirements
  * Non-functional requirements (scale, latency)
  * Database schema
  * APIs and interfaces
  * Caching strategy (Redis, memcached)
  * Load balancing
  * Sharding strategy
  * Monitoring and logging
- **Resources:** System Design Primer GitHub, ByteByteGo YouTube
- **Assessment:** 45-minute design presentations on paper

### 3. Coding Best Practices
- **Time:** 2-3 weeks, ongoing
- **Master:**
  * SOLID principles
  * Design patterns (Singleton, Factory, Observer)
  * Code structure and organization
  * Error handling
  * Security best practices
- **Resources:** Clean Code book, code reviews on GitHub

---

## 🎤 BEHAVIORAL INTERVIEW MASTERY

### STAR Method for Behavioral Questions
**Tell me about a challenging project:**
- **Situation:** Project context (30 seconds)
  * "I was building an e-commerce platform with 1000s of concurrent users"
- **Task:** Your specific responsibility (15 seconds)
  * "I was responsible for the payment processing system"
- **Action:** What YOU specifically did (1-2 minutes)
  * "I identified a race condition causing double charges..."
  * "I implemented optimistic locking to solve it..."
  * "I wrote comprehensive tests and load tested the solution..."
- **Result:** Measurable outcomes (30 seconds)
  * "Reduced transaction failures from 2% to 0.01%"
  * "Improved processing speed by 40%"
  * "Saved company $50k/month in failed transactions"

### Common Questions & Strategies

1. **"Tell me about yourself"**
   - Past: 1 min background
   - Present: 1 min current achievements
   - Future: 30 sec career goals related to this role

2. **"Why do you want this job?"**
   - Specific projects you admire
   - How your skills align with their needs
   - Growth opportunities for both

3. **"What's your biggest weakness?"**
   - Pick REAL weakness (not fake)
   - Show concrete steps to improve
   - Demonstrate growth mindset
   - Example: "I wasn't strong in system design initially, so I've spent 3 months studying, completed 10 design interviews, and now I'm comfortable at that level"

4. **"Tell me about a time you failed"**
   - Pick meaningful failure (not trivial)
   - Explain what you learned
   - Show how you apply that learning today

5. **"How do you handle disagreements?"**
   - Use specific example
   - Show empathy and listening
   - Focus on best solution, not winning

---

## 📚 INTERVIEW PREPARATION SCHEDULE

### Week 1-2: Fundamentals Review
- Brush up on core concepts in 2-3 hours
- Review your past projects
- Write down 3-5 interesting projects

### Week 3-4: Intensive Coding Practice
- Solve 40-50 coding problems
- Focus on weak areas
- Time yourself (mimic real interview pressure)

### Week 5-6: System Design & Mock Interviews
- Deep dive into 5 system designs
- Do 3-4 mock interviews with friends/mentors
- Record and review performance

### Week 7: Final Prep
- Practice talking through your projects (2 mins pitch)
- Prepare 5-7 questions to ask interviewer
- Tech check: camera, mic, internet
- Get good sleep before interview

---

## 💼 PROJECTS TO SHOWCASE

**Prepare 2-3 projects that demonstrate:**
- ${goal} core competencies
- Problem-solving abilities
- Code quality and best practices
- Real-world impact

**For Each Project, Explain:**
1. What problem it solved
2. Technical challenges you faced
3. Architecture & design decisions
4. Lessons learned
5. What you'd improve if rebuilding

**Portfolio Tips:**
- Deploy live projects (GitHub Pages, Vercel, Heroku)
- Write clear README with tech stack
- Include metrics (users, performance improvements)
- Highlight your role in team projects

---

## 🎯 DAY-OF INTERVIEW CHECKLIST

- [ ] Get 8+ hours sleep
- [ ] Eat healthy breakfast
- [ ] Review company facts and recent news
- [ ] Prepare 5-7 thoughtful questions
- [ ] Test tech setup (camera, mic, internet)
- [ ] Dress professionally
- [ ] Arrive 10 minutes early
- [ ] Take deep breaths, stay confident

**Remember:** They want to hire you! You're 1 of final 3-5 candidates. Show genuine interest and your value! 💪

Good luck - you've got this! 🚀`;
  }
  
  if (intent === 'salary') {
    return `${namePrefix}Here's your comprehensive salary negotiation and career compensation guide:

**Your Profile:**
- Experience: ${experience}
- Skills: ${skillList}
- Target: ${goal}

---

## 💰 UNDERSTANDING YOUR MARKET VALUE

### Salary Determinants for ${goal}
- **Location:** Remote, San Francisco, New York, Midwest
- **Experience Level:** Junior (0-2 yrs), Mid (2-5 yrs), Senior (5-10 yrs), Staff (10+ yrs)
- **Company Size:** Startup, Series A-C, Scale-up, Fortune 500
- **Company Profitability:** High growth, profitable, bootstrap
- **Your Specialization:** Full-stack, Backend, Frontend, DevOps, ML/AI

### Market Research Tools
- **Levels.fyi:** Real salary data by company and level
- **Blind:** Anonymous discussions from employees
- **Glassdoor:** Company reviews and salary ranges
- **Payscale:** Salary calculator by role and location
- **LinkedIn:** Salary insights by role
- **Interview.io:** Real interview data and feedback

### Typical Salary Ranges (USA, ${goal})
- **Junior (0-2 years):** $70k - $120k
- **Mid-level (2-5 years):** $120k - $180k
- **Senior (5-10 years):** $180k - $280k
- **Staff/Lead (10+ years):** $250k - $400k+

(Remote roles: -15% to -30% depending on location)

---

## 📊 TOTAL COMPENSATION BREAKDOWN

### Base Salary Components
1. **Base Salary:** Fixed yearly compensation
2. **Signing Bonus:** One-time payment (typically 10-25% of base)
3. **Annual Bonus:** Performance-based (typically 10-50% of base)

### Equity & Long-Term
- **Stock Options/RSUs:** Vesting over 4 years (1-year cliff)
- **Annual Equity:** Refresher grants to stay engaged
- **Value Calculation:** (Annual grant value) / (annual salary) = equity %

**Example:**
- Base: $150k
- Signing: $30k
- Annual Bonus: $30k (20%)
- Annual RSUs: $40k (4-year vesting = $10k/year)
- **Total Year 1:** $150k + $30k + $10k = $190k
- **Steady State:** $150k + $30k + $10k = $190k

### Benefits Package Value
- **Health Insurance:** Employer typically pays $8k-15k/year
- **401(k) Match:** 3-6% of salary (usually 4%)
- **Paid Time Off:** 15-30 days/year
- **Professional Development:** $1k-5k/year
- **Stock Purchase Plan:** 10-15% discount
- **Gym/Wellness:** $1k-2k/year
- **Mental Health:** Covered therapy
- **Parental Leave:** 12-16 weeks
- **Sabbatical:** After 5+ years

**Total Benefits Value:** $25k-40k/year

### Total Compensation Example
- Base + Bonus: $180k
- Equity (vesting): $10k/year
- Benefits: $30k/year
- **True Total Comp: $220k/year**

---

## 🎯 NEGOTIATION STRATEGY

### Before You Interview
1. **Research thoroughly:**
   - Target company's typical pay bands
   - Industry standard for your role/level
   - Your geographic market
   - 3 competitor offers if possible

2. **Know your value:**
   - List 5-10 specific achievements with metrics
   - Quantify your impact ($XXk saved, XXx faster, etc.)
   - Identify unique skills/specializations

3. **Set realistic range:**
   - Minimum acceptable (walk-away price)
   - Target number (dream offer)
   - Max realistic (based on market data)

### During Offer Negotiation
1. **Initial Offer Received**
   - Don't accept immediately
   - Say: "I'm excited about this opportunity! Let me review and get back to you in 2 days"
   - Never name a number first

2. **Counter Offer Template**
   "Thank you for the offer! I'm excited about this role at ${goal}. Based on:
   - My [X] years of experience
   - Industry benchmarks for [role] at [level]: $XXX-XXXk
   - My contributions: [specific achievements]
   - Market data from Levels.fyi and Blind
   
   I'd like to counter at $XXXk base + [details on other components]"

3. **Negotiate Beyond Base Salary**
   - If they won't budge on base, ask for:
     * Higher signing bonus
     * More annual RSUs
     * Earlier equity vesting
     * 20-25 days PTO (instead of 15)
     * Flexible work arrangement
     * Professional development budget
     * Sign-on bonus + clawback waiver

4. **Get Everything in Writing**
   - Written offer letter with all details
   - Equity grant documents
   - Vesting schedule clarity
   - Benefits summary
   - Signing bonus timing

### Red Flags to Avoid
- "Equity only, no salary" (except early stage <3)
- Vesting less than 4 years
- No 401(k) match
- Clawback clause on signing bonus
- Unclear equity amounts
- Frequent role/title changes
- No clear promotion path

---

## 📈 SALARY GROWTH TRAJECTORY

### First 2 Years
- Focus on impact and visibility
- Deliver 2-3 major projects
- Target: 15-20% raise at review
- Move from Individual Contributor (IC) Level 3 → 4

### Years 2-5
- Build expertise and leadership skills
- Mentor 1-2 junior developers
- Lead cross-team initiatives
- Target: Manager track or Senior IC track
- Raise: $150k → $200k-250k

### Years 5-10
- Senior/Staff engineer or Manager
- Technical leadership across org
- Mentor multiple teams
- Target: $250k-350k+ total comp
- Consider: Staff Engineer, Tech Lead Manager, or Director

### 10+ Years
- Distinguished Engineer, Principal, Director, VP
- Org-wide impact
- Strategy and hiring
- Target: $350k-$1M+ total comp

---

## 💡 PRO TIPS FOR MAXIMIZING INCOME

1. **Switch Companies Every 3-4 Years**
   - Internal raise: 5-10%
   - External hire at same company: 15-30%
   - Stay loyal? You're leaving money on table

2. **Negotiate Equity Refreshers**
   - Every 2 years, negotiate new grant
   - Prevents equity dilution

3. **Negotiate RSU Acceleration**
   - Some companies allow monthly vesting
   - Better than annual vesting

4. **Monitor Stock Price**
   - Track RSU vesting value
   - Plan for tax implications

5. **Build Negotiation Skills**
   - Read: "Never Split the Difference"
   - Role-play with friends
   - Document your wins

6. **Specialize & Differentiate**
   - AI/ML engineers earn more
   - Infra/DevOps engineers earn more
   - Deep expertise pays more than generalists

---

## 📋 YOUR SALARY NEGOTIATION CHECKLIST

### Before Interview:
- [ ] Research ${goal} salaries on Levels.fyi
- [ ] Read 3+ offers on Blind
- [ ] Calculate your minimum acceptable
- [ ] List your top achievements with metrics
- [ ] Identify 3 comparable roles

### After Offer:
- [ ] Don't accept immediately (wait 2-3 days)
- [ ] Research company's salary bands
- [ ] Prepare counter with data
- [ ] Negotiate base, bonus, equity, benefits
- [ ] Get everything in writing

### At Signing:
- [ ] Review offer letter thoroughly
- [ ] Understand RSU vesting schedule
- [ ] Confirm signing bonus payment date
- [ ] Get tax information
- [ ] Set salary review date (1 year)

---

## 🎯 Your Next Steps

1. **This Week:** Research typical salaries for ${goal}
2. **Before Interview:** Prepare your value proposition
3. **During Offer:** Negotiate confidently with data
4. **After Hire:** Set 1-year goal to increase compensation

Remember: Your compensation is tied to your market value. The more skilled and specialized you are, the more you can earn. Invest in yourself! 💎

Your potential salary path: $${experience === 'Beginner' ? '70' : experience === '1 year' ? '80' : '120'}k → $180k → $280k+ 🚀`;
  }
  
  // Default comprehensive response
  return `${namePrefix}I'm here to help your career growth toward becoming a ${goal || 'successful professional'}!

**Your Profile:**
- Current Experience: ${experience}
- Skills: ${skillList}
- Goal: ${goal}

To give you the best guidance, please ask me about:

1. **Roadmap** - "What's my 6-12 month plan to ${goal}?"
2. **Skills** - "What skills should I prioritize?"
3. **Interviews** - "How do I prepare for ${goal} interviews?"
4. **Salary** - "What should I earn as a ${goal}?"

I'll give you specific, actionable guidance tailored to your career! 💡`;
};

app.post('/api/coach/message', async (req, res) => {
  try {
    const { message, userContext } = req.body;

    // Validation
    if (!message || !message.trim()) {
      return standardResponse(res, false, null, 'Message cannot be empty', 400);
    }

    console.log('\n' + '='.repeat(80));
    console.log('📨 USER MESSAGE:', message);
    console.log('👤 USER CONTEXT:', JSON.stringify(userContext, null, 2));

    // Detect intent
    const intent = detectUserIntent(message);
    console.log('🎯 DETECTED INTENT:', intent);

    // Build the intent-specific prompt
    const fullPrompt = buildCoachPrompt(message, userContext, intent);
    console.log('🚀 FINAL PROMPT BEING SENT TO OPENAI:');
    console.log('─'.repeat(80));
    console.log(fullPrompt);
    console.log('─'.repeat(80));

    // DEBUG: Log API Key
    console.log('🔑 API KEY (first 20 chars):', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 20) + '...' : 'NOT SET');
    
    // Call OpenAI API
    console.log('🚀 USING MODEL: gpt-3.5-turbo');
    
    console.log('📡 CALLING OPENAI API WITH PROMPT...');
    const result = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a strict, no-nonsense AI Career Coach. Never give generic advice. Always provide specific, actionable guidance with real tools, timelines, and projects.'
        },
        {
          role: 'user',
          content: fullPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });
    
    const text = result.choices[0].message.content;
    let aiResponse = text;

    console.log('✅ OPENAI API SUCCESS');
    console.log('🧠 RAW OPENAI RESPONSE:');
    console.log('─'.repeat(80));
    console.log(aiResponse);
    console.log('─'.repeat(80));
    console.log(`📊 Response length: ${aiResponse.length} characters`);
    
    // VALIDATE: Response is not empty
    if (!aiResponse || aiResponse.length < 50) {
      throw new Error(`OpenAI returned invalid response: ${aiResponse ? aiResponse.length : 0} characters`);
    }

    // STRICT validation - pass intent for structure checking
    if (isResponseTooGeneric(aiResponse, intent)) {
      console.warn('❌ RESPONSE IS TOO GENERIC OR LACKS STRUCTURE');
      
      // For roadmap intent, force structure if AI failed
      if (intent === 'roadmap') {
        console.warn('🔨 FORCING ROADMAP STRUCTURE...');
        aiResponse = forceRoadmapStructure(aiResponse);
      } else {
        // Try regeneration for other intents
        console.warn('🔄 ATTEMPTING REGENERATION WITH STRICTER PROMPT');
        const stricterPrompt = fullPrompt + `

🚨 CRITICAL: Your previous response was too generic. 
You MUST:
1. Use SPECIFIC tool names (not "tools")
2. Include REAL timelines (not "varies")
3. List ACTUAL projects (not generic "build projects")
4. NEVER use phrases like: "improve communication", "be persistent", "practice regularly", "work hard"
5. Make response 500+ words
6. Use the exact structure format specified above

REGENERATE NOW with MAXIMUM specificity:`;
        
        console.log('📡 CALLING GEMINI API FOR REGENERATION...');
        const retryResult = await model.generateContent(stricterPrompt);
        const retryText = retryResult.response.text();
        
        console.log('✅ REGENERATED RESPONSE:');
        console.log('─'.repeat(80));
        console.log(retryText);
        console.log('─'.repeat(80));
        
        // VALIDATE: Response is not empty
        if (!retryText || retryText.length < 50) {
          throw new Error(`Gemini regeneration returned invalid response: ${retryText ? retryText.length : 0} characters`);
        }
        
        aiResponse = retryText;
      }
    } else {
      console.log('✅ RESPONSE PASSED QUALITY CHECKS');
    }

    return standardResponse(res, true, { 
      message: aiResponse,
      model: 'gpt-3.5-turbo',
      intent: intent,
      timestamp: new Date().toISOString()
    }, 'Career guidance generated successfully', 200);

  } catch (error) {
    console.error('❌ OPENAI API ERROR - FULL DETAILS:');
    console.error('❌ ERROR MESSAGE:', error.message);
    console.error('❌ ERROR STACK:', error.stack);
    console.error('❌ ERROR STATUS:', error.status);
    console.error('❌ ERROR CODE:', error.code);
    console.error('❌ FULL ERROR OBJECT:', error);
    
    console.log('🔄 USING PERSONALIZED FALLBACK RESPONSE...');
    console.log('⚠️ NOTE: Real Gemini API failed. Check error details above.');
    
    // Use the new intelligent personalized fallback
    const userMessage = req.body.message || '';
    const userContext = req.body.userContext || {};
    const detectIntent = detectUserIntent(userMessage);
    
    const fallback = generatePersonalizedFallback(userMessage, userContext, detectIntent);

    return standardResponse(res, true, {
      message: fallback,
      model: 'fallback-personalized',
      intent: detectIntent,
      timestamp: new Date().toISOString(),
      note: '⚠️ Using intelligent fallback - Enable Generative AI API for real Gemini responses'
    }, 'Career guidance generated (fallback mode)', 200);
  }
});

app.post('/api/coach', authMiddleware, async (req, res) => {
  try {
    const aiRes = await fetch('http://127.0.0.1:8000/agent/career-coach', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req.body)
    });
    const dataWrapper = await aiRes.json();
    return standardResponse(res, dataWrapper.success, dataWrapper.data, dataWrapper.message);
  } catch(e) { return standardResponse(res, false, null, e.message, 500); }
});

app.post('/api/interview', authMiddleware, async (req, res) => {
  try {
    const aiRes = await fetch('http://127.0.0.1:8000/agent/interview', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req.body)
    });
    const dataWrapper = await aiRes.json();
    return standardResponse(res, dataWrapper.success, dataWrapper.data, dataWrapper.message);
  } catch(e) { return standardResponse(res, false, null, e.message, 500); }
});

app.post('/api/interview/evaluate', authMiddleware, async (req, res) => {
  try {
    const aiRes = await fetch('http://127.0.0.1:8000/agent/interview/evaluate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req.body)
    });
    const dataWrapper = await aiRes.json();
    return standardResponse(res, dataWrapper.success, dataWrapper.data, dataWrapper.message);
  } catch(e) { return standardResponse(res, false, null, e.message, 500); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
