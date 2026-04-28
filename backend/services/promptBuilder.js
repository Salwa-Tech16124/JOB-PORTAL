/**
 * promptBuilder.js
 * 
 * Builds strong, structured prompts for the Career Coach AI Agent.
 * Forces personalized, non-generic responses based on user context.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const model = genAI?.getGenerativeModel({ model: 'gemini-2.5-flash' });

/**
 * Detect user intent from their message
 * @param {string} message - User's message
 * @returns {string} - Detected intent
 */
export const detectUserIntent = (message) => {
  const msg = message.toLowerCase();
  
  // General/Definition intent (Overrides others if it starts with a question about definition)
  if (msg.startsWith('what is') || msg.startsWith('define') || msg.startsWith('explain') || 
      msg.startsWith('how to define') || msg.includes('meaning of')) {
    return 'general';
  }
  
  // Roadmap intent
  if (msg.includes('roadmap') || msg.includes('path') || msg.includes('steps') || 
      msg.includes('phases') || msg.includes('plan') || msg.includes('how to become') ||
      msg.includes('career') || msg.includes('how do i become') || msg.includes('career path')) {
    return 'roadmap';
  }
  
  // Skills intent
  if (msg.includes('skill') || msg.includes('learn') || msg.includes('improve') || 
      msg.includes('knowledge') || msg.includes('master') || msg.includes('what should i learn')) {
    return 'skills';
  }
  
  // Interview intent
  if (msg.includes('interview') || msg.includes('prepare') || msg.includes('questions') ||
      msg.includes('coding challenge') || msg.includes('technical interview') ||
      msg.includes('behavioral')) {
    return 'interview';
  }
  
  // Salary intent
  if (msg.includes('salary') || msg.includes('compensation') || msg.includes('pay') || 
      msg.includes('income') || msg.includes('earning') || msg.includes('negotiate') ||
      msg.includes('how much') || msg.includes('earn')) {
    return 'salary';
  }
  
  // Role-specific intent
  if (msg.includes('role') || msg.includes('engineer') || msg.includes('developer') || 
      msg.includes('qa') || msg.includes('analyst') || msg.includes('manager') ||
      msg.includes('architect') || msg.includes('designer') || msg.includes('tester')) {
    return 'role_specific';
  }
  
  return 'general';
};

/**
 * Get experience level modifier for prompts
 * @param {string} experience - User's experience level
 * @returns {object} - Modifier object with details
 */
const getExperienceModifier = (experience) => {
  const exp = (experience || 'Beginner').toLowerCase();
  
  if (exp.includes('beginner') || exp.includes('junior') || exp === '0' || exp === '1') {
    return {
      level: 'Beginner/Junior',
      focus: 'Foundation building, fundamentals, guided learning',
      timeline: '12-18 months',
      advice: 'Focus on fundamentals, build strong foundation, don\'t rush to advanced topics'
    };
  }
  
  if (exp.includes('mid') || exp.includes('intermediate') || exp === '2' || exp === '3' || exp === '4' || exp === '5') {
    return {
      level: 'Mid-Level',
      focus: 'Professional depth, production-ready skills, leadership',
      timeline: '6-12 months',
      advice: 'Build production experience, lead projects, specialize in areas of interest'
    };
  }
  
  if (exp.includes('senior') || exp.includes('staff') || exp.includes('lead') || 
      exp.includes('principal') || exp.includes('6') || exp.includes('7') || exp.includes('8') ||
      exp.includes('9') || exp.includes('10')) {
    return {
      level: 'Senior/Staff',
      focus: 'Architecture, leadership, org-wide impact, strategy',
      timeline: '3-6 months',
      advice: 'Focus on system design, mentoring, architecture, strategic thinking'
    };
  }
  
  return {
    level: 'Unknown',
    focus: 'Comprehensive growth',
    timeline: '12 months',
    advice: 'Assess your current level and focus on targeted growth'
  };
};

/**
 * Build the base prompt with user context
 * @param {string} message - User's message
 * @param {object} userContext - User's context (name, skills, experience, goal)
 * @returns {object} - Built prompt components
 */
export const buildBasePrompt = (message, userContext) => {
  const { 
    name = 'Guest User', 
    skills = [], 
    experience = 'Beginner', 
    goal = 'Not specified',
    currentRole = 'Not specified',
    industry = 'Technology'
  } = userContext || {};
  
  const skillsStr = Array.isArray(skills) && skills.length > 0 
    ? skills.join(', ') 
    : 'None specified';
  
  const expModifier = getExperienceModifier(experience);
  
  // Dynamic Role Extraction: Detect dynamically requested role from message, or fall back to user goal.
  let dynamicRole = goal;
  const lowerMsg = message.toLowerCase();
  
  const rolesMatch = [
    "quality analyst", "qa engineer", "full stack", "frontend", "backend", 
    "data engineer", "data scientist", "devops", "product manager", 
    "ui/ux designer", "machine learning"
  ];
  for (const role of rolesMatch) {
    if (lowerMsg.includes(role)) {
      dynamicRole = role;
      break;
    }
  }

  // If dynamicRole is still very generic and the message provides context, we just use the raw message subject
  if (dynamicRole === 'Not specified' || dynamicRole === '') {
     dynamicRole = 'Specialized Professional';
  }
  
  return {
    userProfile: {
      name,
      skills: skillsStr,
      experience,
      goal: dynamicRole,
      currentRole,
      industry
    },
    experienceModifier: expModifier,
    message
  };
};

/**
 * Build intent-specific prompt for roadmap
 * @param {object} basePrompt - Base prompt components
 * @returns {string} - Formatted prompt
 */
const buildRoadmapPrompt = (basePrompt) => {
  const { userProfile, experienceModifier, message } = basePrompt;
  const { name, skills: skillsStr, goal: role, currentRole, industry } = userProfile;
  
  return `You are a highly experienced career coach. 
User wants to become: ${role}

## USER QUESTION
"${message}"

Give a detailed, specific, real-world answer.
Avoid generic words like 'industry tools' or 'best practices'.
Mention real tools, technologies, specific concepts, and actionable steps explicitly connected to ${role}.

Your answer should be well structured with headings and bullet points where applicable.`;
};

/**
 * Build intent-specific prompt for skills
 * @param {object} basePrompt - Base prompt components
 * @returns {string} - Formatted prompt
 */
const buildSkillsPrompt = (basePrompt) => {
  const { userProfile, experienceModifier, message } = basePrompt;
  const { name, skills: skillsStr, goal, currentRole } = userProfile;
  
  return `You are an expert AI Career Coach specializing in skills development and career growth.
Your role is to provide PRIORITIZED, SPECIFIC, and ACTIONABLE skill recommendations.

## USER PROFILE
- **Name:** ${name}
- **Current Role:** ${currentRole}
- **Experience Level:** ${experienceModifier.level}
- **Current Skills:** ${skillsStr}
- **Career Goal:** ${goal}

## USER QUESTION
"${message}"

## CONTEXT
${experienceModifier.advice}

## CRITICAL REQUIREMENTS

Respond in this EXACT format:

### Tier 1: Critical Skills (Next 4-8 weeks)
**Why these matter:** [Specific reason tied to user's goal]

#### 1. [Skill Name] - Priority: HIGH
- **What it is:** [Brief description]
- **Why for your goal:** [Specific reason]
- **How to learn:** [Specific courses, books, projects]
- **Timeline:** [Specific timeframe]
- **Key tools:** [List specific tools]
- **Verification:** [How to know you've mastered it]

#### 2. [Skill Name] - Priority: HIGH
- **What it is:** [Brief description]
- **Why for your goal:** [Specific reason]
- **How to learn:** [Specific courses, books, projects]
- **Timeline:** [Specific timeframe]
- **Key tools:** [List specific tools]

---

### Tier 2: Professional Skills (Months 2-4)
#### 3. [Skill Name] - Priority: MEDIUM
- **What it is:** [Brief description]
- **Why for your goal:** [Specific reason]
- **How to learn:** [Specific resources]
- **Timeline:** [Specific timeframe]

#### 4. [Skill Name] - Priority: MEDIUM
- **What it is:** [Brief description]
- **Why for your goal:** [Specific reason]
- **How to learn:** [Specific resources]

---

### Tier 3: Advanced Skills (Months 5+)
#### 5. [Skill Name] - Priority: LOW
- **What it is:** [Brief description]
- **Why for your goal:** [Specific reason]
- **How to learn:** [Specific resources]

---

## Learning Resources (Specific)
- **Courses:** [Specific course names with links]
- **Books:** [Specific book titles]
- **Projects:** [Specific project ideas]
- **Communities:** [Specific communities to join]

## Skills to Avoid (Not Recommended)
- [Skill] - Why: [Specific reason it's not relevant]

## REMEMBER
- Focus on SPECIFIC skills, not vague categories like "coding"
- Include REAL timelines and resources
- Rank by relevance to user's specific goal: ${goal}
- Make it 600+ words
- NO generic advice like "keep learning" or "practice regularly"`;
};

/**
 * Build intent-specific prompt for interview prep
 * @param {object} basePrompt - Base prompt components
 * @returns {string} - Formatted prompt
 */
const buildInterviewPrompt = (basePrompt) => {
  const { userProfile, experienceModifier, message } = basePrompt;
  const { name, skills: skillsStr, goal, currentRole, experience } = userProfile;
  
  return `You are an expert AI Career Coach specializing in interview preparation.
Your role is to provide COMPREHENSIVE, SPECIFIC, and PROVEN interview strategies.

## USER PROFILE
- **Name:** ${name}
- **Current Role:** ${currentRole}
- **Experience Level:** ${experience} (${experienceModifier.level})
- **Current Skills:** ${skillsStr}
- **Target Role:** ${goal}

## USER QUESTION
"${message}"

## CONTEXT
${experienceModifier.advice}

## CRITICAL REQUIREMENTS

Respond in this EXACT format:

### Technical Interview Preparation

#### 1. Data Structures & Algorithms
**Time:** [Specific weeks], [X] hours daily
**Focus areas:**
- [Topic 1] - [Why important] - [Practice resource]
- [Topic 2] - [Why important] - [Practice resource]
- [Topic 3] - [Why important] - [Practice resource]

**Practice plan:**
- Week 1-2: [X] easy problems on [specific platform]
- Week 3-4: [X] medium problems
- Week 5+: [X] hard problems + pattern recognition

#### 2. System Design (for Mid-Level+)
**Time:** [Specific weeks], [X] hours twice weekly
**Systems to study:**
- [System 1]: [Key concepts to learn]
- [System 2]: [Key concepts to learn]
- [System 3]: [Key concepts to learn]

**Resources:** [Specific books, courses, YouTube channels]

#### 3. [Target Role]-Specific Topics
**Core topics to master:**
- [Topic 1] - [Specific depth level] - [Resources]
- [Topic 2] - [Specific depth level] - [Resources]

---

### Behavioral Interview Preparation

#### STAR Method Framework
**Situation:** [Context]
**Task:** [Your responsibility]
**Action:** [What YOU specifically did] (use "I", not "we")
**Result:** [Measurable outcome]

#### Common Questions & Your Stories
1. **"Tell me about yourself"**
   - Your answer structure: [Specific format]
   - Key points to include: [List]

2. **"Why do you want this role?"**
   - Specific reasons for ${goal}: [List]
   - How your background aligns: [Specific examples]

3. **"Tell me about a challenge"**
   - Story from your experience: [Specific example]
   - STAR breakdown: [Details]

4. **"What's your biggest weakness?"**
   - Real weakness: [Specific]
   - How you're improving: [Specific actions]

---

### Projects to Showcase
For each project, prepare:
1. **Project Name:** [Name]
2. **Problem:** [What problem you solved]
3. **Your role:** [What you specifically did]
4. **Technical challenges:** [Specific challenges]
5. **Solution:** [How you solved it]
6. **Results:** [Measurable outcomes]

---

### Interview Day Checklist
- [ ] Technical setup (camera, mic, internet)
- [ ] Company research (products, culture, recent news)
- [ ] Questions to ask (5-7 specific questions)
- [ ] Past projects reviewed
- [ ] STAR stories practiced
- [ ] Good sleep and nutrition

## REMEMBER
- Base recommendations on user's level: ${experience}
- Include SPECIFIC resources (not just "study hard")
- Provide REAL project examples to build
- Give sample STAR answers
- Make it 700+ words`;
};

/**
 * Build intent-specific prompt for salary
 * @param {object} basePrompt - Base prompt components
 * @returns {string} - Formatted prompt
 */
const buildSalaryPrompt = (basePrompt) => {
  const { userProfile, experienceModifier, message } = basePrompt;
  const { name, skills: skillsStr, goal, currentRole, experience } = userProfile;
  
  return `You are an expert AI Career Coach specializing in compensation and salary negotiation.
Your role is to provide DATA-DRIVEN, SPECIFIC, and ACTIONABLE salary guidance.

## USER PROFILE
- **Name:** ${name}
- **Current Role:** ${currentRole}
- **Experience Level:** ${experience} (${experienceModifier.level})
- **Current Skills:** ${skillsStr}
- **Target Role:** ${goal}

## USER QUESTION
"${message}"

## CONTEXT
${experienceModifier.advice}

## CRITICAL REQUIREMENTS

Respond in this EXACT format:

### Market Salary Data for ${goal}

#### By Experience Level (US Market)
- **Entry Level (0-2 years):** $[X]-[Y]k
- **Mid-Level (2-5 years):** $[X]-[Y]k
- **Senior (5-10 years):** $[X]-[Y]k
- **Staff/Principal (10+ years):** $[X]-[Y]k

#### By Location (adjust accordingly)
- **Tech Hubs (SF, NYC, Seattle):** +20-40%
- **Major Cities (Austin, Denver, Boston):** +10-20%
- **Remote/LCOL:** Base or -10-20%

#### By Company Type
- **FAANG/MAAAM:** [Salary range]
- **Startup (Series A-C):** [Salary range + equity]
- **Enterprise/ Fortune 500:** [Salary range]
- **Mid-size Tech:** [Salary range]

---

### Total Compensation Breakdown

#### Base Salary
- Typical range: $[X]-[Y]k
- Factors affecting: [Specific factors]

#### Signing Bonus
- Typical: [X]% of base
- Negotiation tips: [Specific tips]

#### Annual Bonus
- Typical: [X]-[Y]% of base
- Performance metrics: [Specific metrics]

#### Equity/Stock Options
- Vesting schedule: [4 years typical]
- Typical value: [X]% of base
- Types: [RSUs, Options, etc.]

#### Benefits Value
- Health insurance: $[X]k/year
- 401(k) match: [X]% 
- PTO: [X] days
- Other: [List]

---

### Negotiation Strategy

#### Before Interview
1. Research: [Specific resources]
2. Know your value: [How to calculate]
3. Set target range: [Your numbers]

#### During Negotiation
1. **Initial offer:** Don't accept immediately
2. **Counter strategy:** [Specific approach]
3. **Beyond base:** What to negotiate if base is fixed
   - Signing bonus
   - Equity refreshers
   - PTO
   - Remote work

#### Red Flags
- [Warning 1]
- [Warning 2]
- [Warning 3]

---

### Salary Growth Path

#### Year 1-2
- Focus: [Specific focus]
- Target raise: [X]%
- Expected: $[X]k → $[Y]k

#### Year 2-5
- Focus: [Specific focus]
- Target: [Promotion/role]
- Expected: $[X]k → $[Y]k

#### Year 5-10
- Focus: [Specific focus]
- Target: [Senior/Lead]
- Expected: $[X]k → $[Y]k

---

### Your Action Plan
1. **This week:** [Specific action]
2. **Before offer:** [Specific action]
3. **At negotiation:** [Specific action]
4. **After hire:** [Specific action]

## REMEMBER
- Provide SPECIFIC salary ranges (not "depends on location")
- Include REAL negotiation strategies
- Give DATA from sources like Levels.fyi, Glassdoor
- Make it 600+ words`;
};

/**
 * Build intent-specific prompt for role-specific queries
 * @param {object} basePrompt - Base prompt components
 * @returns {string} - Formatted prompt
 */
const buildRoleSpecificPrompt = (basePrompt) => {
  const { userProfile, experienceModifier, message } = basePrompt;
  const { name, skills: skillsStr, goal, currentRole, experience } = userProfile;
  
  return `You are an expert AI Career Coach with deep knowledge of tech roles and career paths.
Your role is to provide COMPREHENSIVE, ROLE-SPECIFIC guidance.

## USER PROFILE
- **Name:** ${name}
- **Current Role:** ${currentRole}
- **Experience Level:** ${experience} (${experienceModifier.level})
- **Current Skills:** ${skillsStr}
- **Target Role:** ${goal}

## USER QUESTION
"${message}"

## CONTEXT
${experienceModifier.advice}

## CRITICAL REQUIREMENTS

Respond in this EXACT format:

### Role Overview: [Target Role]

#### What this role does day-to-day:
- [Task 1]: [Specific description]
- [Task 2]: [Specific description]
- [Task 3]: [Specific description]
- [Task 4]: [Specific description]

#### Required Skills (by proficiency level)
**Must-have:**
- [Skill 1] - Level: [Beginner/Intermediate/Advanced] - Why: [Specific reason]
- [Skill 2] - Level: [Beginner/Intermediate/Advanced] - Why: [Specific reason]

**Nice-to-have:**
- [Skill 3] - Level: [Beginner] - Why: [Specific reason]

#### Tools & Technologies
- [Tool 1] - Used for: [Specific purpose]
- [Tool 2] - Used for: [Specific purpose]
- [Tool 3] - Used for: [Specific purpose]

---

### Career Path & Progression

#### Entry → Mid (0-3 years)
- Focus: [Specific skills]
- Timeline: [Specific timeframe]
- Typical salary: $[X]-[Y]k

#### Mid → Senior (3-6 years)
- Focus: [Specific skills]
- Timeline: [Specific timeframe]
- Typical salary: $[X]-[Y]k

#### Senior → Staff/Lead (6-10 years)
- Focus: [Specific skills]
- Timeline: [Specific timeframe]
- Typical salary: $[X]-[Y]k

---

### How to Transition from [Current Role]

#### If transitioning from related field:
- [Specific step 1]
- [Specific step 2]
- [Specific step 3]

#### If transitioning from unrelated field:
- [Specific step 1]
- [Specific step 2]
- [Specific step 3]
- Timeline: [Specific timeframe]

---

### Resources & Next Steps
- **Courses:** [Specific courses]
- **Certifications:** [Specific certs]
- **Projects to build:** [Specific projects]
- **Communities:** [Specific communities]

## REMEMBER
- Be SPECIFIC to the role mentioned
- Include REAL salary ranges
- Mention SPECIFIC tools used in this role
- Provide clear progression path
- Make it 700+ words`;
};

/**
 * Build intent-specific prompt for general questions
 * @param {object} basePrompt - Base prompt components
 * @returns {string} - Formatted prompt
 */
const buildGeneralPrompt = (basePrompt) => {
  const { userProfile, experienceModifier, message } = basePrompt;
  const { name, skills: skillsStr, goal, currentRole } = userProfile;
  
  return `You are a real, knowledgeable AI Career and Technical Coach.

## USER QUESTION
"${message}"

## INSTRUCTIONS
The user is asking a general definition or conceptual question.
Give a clear, robust answer directly answering their exact question.
Your response MUST include:
- A clear definition or explanation.
- Mention types or variations if relevant.
- A concrete, real-world example of how it is used.

DO NOT output a career roadmap. Stick strictly to answering their question in an educational and understandable manner. Use headings to structure your response cleanly.`;
};

/**
 * Main prompt builder function
 * @param {string} message - User's message
 * @param {object} userContext - User's context
 * @returns {object} - Built prompt with intent and formatted prompt
 */
export const buildPrompt = (message, userContext) => {
  const intent = detectUserIntent(message);
  const basePrompt = buildBasePrompt(message, userContext);
  
  let formattedPrompt;
  
  switch (intent) {
    case 'roadmap':
      formattedPrompt = buildRoadmapPrompt(basePrompt);
      break;
    case 'skills':
      formattedPrompt = buildSkillsPrompt(basePrompt);
      break;
    case 'interview':
      formattedPrompt = buildInterviewPrompt(basePrompt);
      break;
    case 'salary':
      formattedPrompt = buildSalaryPrompt(basePrompt);
      break;
    case 'role_specific':
      formattedPrompt = buildRoleSpecificPrompt(basePrompt);
      break;
    case 'career_switch':
      formattedPrompt = buildRoleSpecificPrompt(basePrompt); // Reuse for now
      break;
    default:
      formattedPrompt = buildGeneralPrompt(basePrompt);
  }
  
  return {
    intent,
    prompt: formattedPrompt,
    userContext: basePrompt.userProfile,
    experienceModifier: basePrompt.experienceModifier
  };
};

export const formatResponse = (aiResponse, intent) => {
  let cleaned = aiResponse;

  // 1. Remove generic filler phrases
  const genericPhrases = [
    /keep learning/gi, 
    /practice regularly/gi, 
    /never give up/gi, 
    /work hard/gi, 
    /be persistent/gi,
    /industry tools/gi,
    /best practices/gi
  ];
  
  for (const phrase of genericPhrases) {
    cleaned = cleaned.replace(phrase, "");
  }

  // Ensure headings are somewhat padded for Markdown parsing
  cleaned = cleaned.replace(/\n(##.*)/g, '\n\n$1');

  // Specific Intent formatting constraints
  if (intent === 'roadmap' || intent === 'career' || intent === 'career_switch') {
    // If roadmap is returned but completely lacks markdown structure, optionally enforce basic structure
    if (!cleaned.includes('#') && !cleaned.includes('*')) {
       cleaned = `### Guided Roadmap\n\n${cleaned}`;
    }
  } else if (intent === 'general') {
    // Ensure no roadmap headers leaked into general questions if AI hallucinates
    cleaned = cleaned.replace(/^#+.*(Phase 1|Phase 2|Foundation).*$/gm, "### Key Concepts");
  }

  // Remove multiple newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

  return cleaned;
};

export default {
  buildPrompt,
  detectUserIntent,
  formatResponse,
  buildBasePrompt
};