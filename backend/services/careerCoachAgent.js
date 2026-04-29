/**
 * careerCoachAgent.js
 * 
 * Main AI Agent service for the Career Coach.
 * Handles Gemini API integration, intent detection, response generation,
 * and fallback logic for when the API fails.
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  buildPrompt, 
  detectUserIntent, 
  formatResponse 
} from './promptBuilder.js';

// Load environment variables with explicit path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Initialize Sarvam AI API via OpenAI client
const SARVAM_API_KEY = process.env.SARVAM_API_KEY || "sk_xs5dbt92_YCfO5S7AF3b9DIQxznmH8tao";
let openai = null;

try {
  openai = new OpenAI({ 
      apiKey: SARVAM_API_KEY,
      baseURL: "https://api.sarvam.ai/v1"
  });
  console.log('✅ Sarvam AI API initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Sarvam AI API:', error.message);
  openai = null;
}

/**
 * Call Sarvam AI API
 * @param {string} prompt - Formatted prompt
 * @returns {string} - Sarvam response
 */
const getSarvamResponse = async (prompt) => {
  if (!openai) {
    throw new Error('Sarvam API not initialized - API Key missing');
  }

  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are an expert tech career coach." }, { role: "user", content: prompt }],
    model: "sarvam-105b",
  });
  
  const text = completion.choices[0].message.content;
  
  if (!text || text.length < 50) {
    throw new Error('Sarvam AI returned empty or too short response');
  }
  
  return text;
};

/**
 * Detect specific role from goal to provide tailored content
 * @param {string} goal - User's career goal
 * @returns {object} - Role-specific details
 */
const detectRoleSpecifics = (goal) => {
  const g = (goal || '').toLowerCase();
  
  // Quality Analyst / QA Engineer
  if (g.includes('quality') || g.includes('qa') || g.includes('tester') || 
      g.includes('quality analyst') || g.includes('qa engineer') || g.includes('software quality')) {
    return {
      role: 'Quality Analyst',
      coreSkills: ['Manual Testing', 'Test Case Design', 'Bug Tracking', 'Test Automation', 'SQL', 'API Testing'],
      tools: ['JIRA', 'Selenium', 'Postman', 'JMeter', 'Cypress', 'TestRail', 'Browser DevTools'],
      certifications: ['ISTQB Foundation', 'ISTQB Agile', 'CSQA'],
      projects: ['Test Automation Framework', 'API Testing Suite', 'Bug Report Database'],
      interviewFocus: ['Testing scenarios', 'Bug lifecycle', 'Test design techniques', 'Automation tools', 'SDLC']
    };
  }
  
  // Software Developer / Engineer
  if (g.includes('developer') || g.includes('engineer') || g.includes('programmer') ||
      g.includes('software engineer') || g.includes('full stack') || g.includes('frontend') || 
      g.includes('backend') || g.includes('web developer')) {
    return {
      role: 'Software Developer',
      coreSkills: ['Data Structures', 'Algorithms', 'System Design', 'Git', 'SQL', 'API Design'],
      tools: ['GitHub', 'VS Code', 'Docker', 'AWS', 'Jest', 'React', 'Node.js'],
      certifications: ['AWS Certified', 'Oracle Certified'],
      projects: ['Full-stack Application', 'API Service', 'Open Source Contribution'],
      interviewFocus: ['LeetCode problems', 'System design', 'Project deep-dives']
    };
  }
  
  // Data Engineer
  if (g.includes('data engineer') || g.includes('data analyst') || g.includes('etl')) {
    return {
      role: 'Data Engineer',
      coreSkills: ['SQL', 'Python', 'Data Modeling', 'ETL', 'Big Data', 'Cloud Platforms'],
      tools: ['Apache Spark', 'Airflow', 'Snowflake', 'AWS Glue', 'Databricks', 'Kafka'],
      certifications: ['AWS Data Analytics', 'Google Cloud Data Engineer'],
      projects: ['Data Pipeline', 'Data Warehouse', 'Real-time Analytics'],
      interviewFocus: ['SQL queries', 'Data pipeline design', 'Spark concepts']
    };
  }
  
  // DevOps
  if (g.includes('devops') || g.includes('sre') || g.includes('site reliability')) {
    return {
      role: 'DevOps Engineer',
      coreSkills: ['CI/CD', 'Infrastructure as Code', 'Containerization', 'Monitoring', 'Cloud'],
      tools: ['Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'GitHub Actions', 'Prometheus', 'Grafana'],
      certifications: ['AWS DevOps', 'CKA', 'CKAD'],
      projects: ['CI/CD Pipeline', 'Infrastructure Automation', 'Monitoring Setup'],
      interviewFocus: ['Pipeline design', 'Container orchestration', 'Troubleshooting']
    };
  }
  
  // Data Scientist / ML Engineer
  if (g.includes('data scientist') || g.includes('machine learning') || g.includes('ml engineer') ||
      g.includes('ai') || g.includes('artificial intelligence')) {
    return {
      role: 'Data Scientist',
      coreSkills: ['Python', 'Statistics', 'Machine Learning', 'Deep Learning', 'SQL', 'Data Visualization'],
      tools: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'Tableau', 'Jupyter'],
      certifications: ['AWS Machine Learning', 'Google ML', 'DeepLearning.AI'],
      projects: ['ML Model Deployment', 'Data Analysis Project', 'Deep Learning Application'],
      interviewFocus: ['ML algorithms', 'Model evaluation', 'Feature engineering', 'Statistics']
    };
  }
  
  // Product Manager
  if (g.includes('product manager') || g.includes('product owner') || g.includes('pm')) {
    return {
      role: 'Product Manager',
      coreSkills: ['Product Strategy', 'User Research', 'Roadmapping', 'Data Analysis', 'Communication'],
      tools: ['JIRA', 'Figma', 'Mixpanel', 'Google Analytics', 'Notion', 'Confluence'],
      certifications: ['CSPO', 'PMI-PMP'],
      projects: ['Product Roadmap', 'User Research Report', 'Feature Specification'],
      interviewFocus: ['Product sense', 'Execution', 'Leadership']
    };
  }
  
  // UI/UX Designer
  if (g.includes('designer') || g.includes('ui') || g.includes('ux') || g.includes('ui/ux')) {
    return {
      role: 'UI/UX Designer',
      coreSkills: ['User Research', 'Wireframing', 'Prototyping', 'Visual Design', 'Figma'],
      tools: ['Figma', 'Sketch', 'Adobe XD', 'InVision', 'Miro', 'Hotjar'],
      certifications: ['Google UX', 'Interaction Design Foundation'],
      projects: ['Design System', 'Mobile App Design', 'User Research Case Study'],
      interviewFocus: ['Portfolio review', 'Design process', 'UX metrics']
    };
  }
  
  // Business Analyst
  if (g.includes('business analyst') || g.includes('ba')) {
    return {
      role: 'Business Analyst',
      coreSkills: ['Requirements Gathering', 'Data Analysis', 'Process Modeling', 'SQL', 'Communication'],
      tools: ['Excel', 'SQL', 'JIRA', 'Confluence', 'Tableau', 'Visio'],
      certifications: ['CBAP', 'PMI-PBA', 'ECBA'],
      projects: ['Requirements Document', 'Process Flow', 'Data Analysis Report'],
      interviewFocus: ['Requirements', 'Stakeholder management', 'SQL', 'Business processes']
    };
  }
  
  // Default - return generic with role name
  return {
    role: goal || 'Professional',
    coreSkills: ['Core technologies according to target role', 'Communication', 'Industry best practices'],
    tools: ['Industry-standard tools', 'Version control'],
    certifications: [],
    projects: ['Practical portfolio project applicable to the domain'],
    interviewFocus: ['Technical skills implementation', 'Problem-solving methodology']
  };
};

const fallbackResponse = (message, userContext, intent) => {
  const { name, goal, currentRole } = userContext || {};
  const namePrefix = name ? `Hey ${name}! ` : 'Hey there! ';
  const targetRole = goal || 'Professional';
  
  return `${namePrefix}I am currently experiencing connection issues with my main AI brain (Sarvam AI), meaning I cannot generate a highly-detailed, personalized roadmap for you at this exact second.

📝 **Your Profile Context Detected:**
- Target Role: **${targetRole}**
- Current Role: **${currentRole || 'Not specified'}**

💡 **Temporary Advice:**
While my AI is offline, I recommend checking out platforms like **roadmap.sh** or browsing **LinkedIn** for real-world professionals in the ${targetRole} field to see what skills they prioritize!

*(Developer Note: The Sarvam AI API is currently returning an error. Please check your plan or try again later.)*`;
};

export const getCareerAdvice = async (message, userContext) => {
  // Validate input
  if (!message || !message.trim()) {
    return {
      success: false,
      error: 'Message cannot be empty',
      message: 'Please provide a message to get career guidance.'
    };
  }

  console.log('\n' + '='.repeat(80));
  console.log('📨 CAREER COACH - NEW REQUEST (MULTI-AI ARCHITECTURE)');
  console.log('='.repeat(80));
  console.log('👤 USER MESSAGE:', message);

  // Detect intent
  const intent = detectUserIntent(message);
  console.log('🎯 DETECTED INTENT:', intent);

  // Build the prompt
  const { prompt, userContext: builtContext } = buildPrompt(message, userContext);
  console.log('✅ Prompt built successfully for role:', builtContext.goal);

  let aiResponse = null;
  let modelUsed = 'none';

  // AI LAYER: Sarvam AI
  try {
    console.log('🚀 [STEP 1] Calling Sarvam AI...');
    aiResponse = await getSarvamResponse(prompt);
    modelUsed = 'sarvam-105b';
    console.log('✅ [STEP 1] Response successfully received from Sarvam AI.');
  } catch (apiError) {
    console.error('❌ [STEP 1] Sarvam AI Failed or Unavailable:', apiError.message);
      
    // 2. HARD FALLBACK
    console.log('⚠️ [STEP 2] API FAILED! Triggering local fallback format...');
    aiResponse = fallbackResponse(message, builtContext, intent);
    modelUsed = 'fallback-personalized';
  }

  // Format the returned raw content
  console.log('🧹 Formatting API Text Output...');
  aiResponse = formatResponse(aiResponse, intent);

  console.log('📊 FINAL RESPONSE INFO:');
  console.log('   - Model used:', modelUsed);
  console.log('   - Intent:', intent);
  console.log('   - Response length:', aiResponse.length, 'characters');
  console.log('='.repeat(80));

  return {
    success: true,
    message: aiResponse,
    intent: intent,
    model: modelUsed,
    timestamp: new Date().toISOString(),
    ...(modelUsed === 'fallback-personalized' && { note: 'Using local diagnostic fallback - APIs unavailable' })
  };
};

/**
 * Check if Sarvam API is available
 * @returns {boolean} - API availability status
 */
export const isAPIAvailable = () => {
  return openai !== null;
};

/**
 * Get API status information
 * @returns {object} - Status info
 */
export const getStatus = () => {
  return {
    sarvamAvailable: openai !== null,
    model: 'sarvam-105b',
    sarvamApiKeyConfigured: true
  };
};

export default {
  processMessage: getCareerAdvice,
  isAPIAvailable,
  getStatus
};