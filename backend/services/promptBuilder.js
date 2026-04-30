/**
 * promptBuilder.js
 * 
 * Builds strong, structured prompts for the Career Coach AI Agent.
 * Forces personalized, non-generic responses based on user context.
 */

// Prompt Builder - AI-agnostic. Constructs prompts for Sarvam AI via careerCoachAgent.js

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
 * Build conversational prompt for the AI Career Coach
 * @param {object} basePrompt - Base prompt components
 * @param {string} intent - Detected intent
 * @returns {string} - Formatted prompt
 */
const buildConversationalPrompt = (basePrompt, intent) => {
  const { userProfile, experienceModifier, message } = basePrompt;
  const { name, skills: skillsStr, goal, currentRole, experience } = userProfile;
  
  return `You are Sarvam AI, an expert, conversational Career Coach agent. Your goal is to guide candidates on all aspects of their career, acting as a supportive, knowledgeable, and highly interactive mentor.

## USER PROFILE
- Name: ${name}
- Current Role: ${currentRole}
- Experience Level: ${experience} (${experienceModifier.level})
- Current Skills: ${skillsStr}
- Career Goal: ${goal}

## DETECTED TOPIC / INTENT
${intent.toUpperCase()}

## USER MESSAGE
"${message}"

## INSTRUCTIONS
- Respond in a conversational, helpful, and encouraging tone.
- Act as a true AI agent chatting with the user. Keep your responses concise enough for a chat interface, but detailed enough to be highly valuable.
- Discuss any career-related topic: roadmaps, interviews, salary negotiation, skill development, resume tips, or general advice.
- Provide actionable, specific advice tailored to the user's profile and goal. 
- NEVER force a rigid, massive template unless the user explicitly asks for a structured, long-form plan.
- Use clean markdown (bullet points, bold text) for readability.
- Avoid generic filler phrases. Give real-world examples, specific tools, and actionable steps.`;
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
  
  const formattedPrompt = buildConversationalPrompt(basePrompt, intent);
  
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

  // Convert markdown headers to bold since frontend only supports **bold**
  cleaned = cleaned.replace(/^#+\s*(.*)$/gm, '**$1**');

  // Specific Intent formatting constraints
  if (intent === 'roadmap' || intent === 'career' || intent === 'career_switch') {
    // If roadmap is returned but completely lacks markdown structure, optionally enforce basic structure
    if (!cleaned.includes('**') && !cleaned.includes('*')) {
       cleaned = `**Guided Roadmap**\n\n${cleaned}`;
    }
  } else if (intent === 'general') {
    // Ensure no roadmap headers leaked into general questions if AI hallucinates
    cleaned = cleaned.replace(/^\*\*.*(Phase 1|Phase 2|Foundation).*\*\*$/gm, "**Key Concepts**");
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