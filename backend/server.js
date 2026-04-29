import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import mammoth from 'mammoth';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

// Load environment variables with explicit path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Import AI Career Coach Agent
import { getCareerAdvice as coachProcessMessage, getStatus as getCoachStatus } from './services/careerCoachAgent.js';
import { analyzeResumeWithAI, getSuggestionsWithAI, improveResumeWithAI } from './services/resumeAgent.js';

const app = express();

// Initialize Sarvam AI (via OpenAI SDK)
const SARVAM_API_KEY = process.env.SARVAM_API_KEY || "sk_xs5dbt92_YCfO5S7AF3b9DIQxznmH8tao";
const openai = new OpenAI({ 
    apiKey: SARVAM_API_KEY,
    baseURL: "https://api.sarvam.ai/v1"
});
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb', parameterLimit: 100000 }));

// Basic Request Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-123';

const standardResponse = (res, success, data, message, statusCode = 200) => {
    return res.status(statusCode).json({ success, data, message });
};

// ============== PERSISTENT FILE DATABASE ==============
const DB_FILE = path.resolve(__dirname, 'local_db', 'db.json');

// Default state when no saved DB exists
const DEFAULT_DB = {
  users: [],
  profiles: [],
  applications: [],
  nextUserId: 1,
  nextProfileId: 1,
  nextAppId: 1,
  nextJobId: 19
};

// Load database from file or start fresh
let database;
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const saved = JSON.parse(raw);
    database = { ...DEFAULT_DB, ...saved };
    console.log(`✅ Database loaded: ${saved.users?.length || 0} users, ${saved.profiles?.length || 0} profiles, ${saved.applications?.length || 0} applications`);
  } else {
    database = { ...DEFAULT_DB };
    console.log('📂 No saved database found, starting fresh.');
  }
} catch (err) {
  console.warn('⚠️ Failed to load DB file, starting fresh:', err.message);
  database = { ...DEFAULT_DB };
}

// Mock jobs always seeded fresh (not persisted)
const MOCK_JOBS = [
  { id: 1, title: 'Senior React Developer', company: 'TechCorp Inc', location: 'San Francisco, CA', salary: '$150k - $200k', skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'], match: 95, type: 'tech', description: 'Build scalable web applications with React and TypeScript', employerId: null },
  { id: 2, title: 'Full Stack Engineer', company: 'StartupXYZ', location: 'Remote', salary: '$120k - $160k', skills: ['JavaScript', 'React', 'Python', 'AWS'], match: 88, type: 'tech', description: 'Lead frontend and backend development for our platform', employerId: null },
  { id: 3, title: 'Backend Developer', company: 'CloudSys Ltd', location: 'New York, NY', salary: '$130k - $170k', skills: ['Node.js', 'PostgreSQL', 'Docker', 'Kubernetes'], match: 82, type: 'tech', description: 'Design and maintain scalable backend systems', employerId: null },
  { id: 4, title: 'DevOps Engineer', company: 'InfraCloud', location: 'Seattle, WA', salary: '$140k - $180k', skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'], match: 78, type: 'tech', description: 'Optimize deployment pipelines and infrastructure', employerId: null },
  { id: 5, title: 'Data Engineer', company: 'DataMind', location: 'Boston, MA', salary: '$135k - $175k', skills: ['Python', 'SQL', 'Apache Spark', 'AWS'], match: 72, type: 'tech', description: 'Build data pipelines and analytics solutions', employerId: null },
  { id: 6, title: 'Frontend Specialist', company: 'DesignStudio', location: 'Austin, TX', salary: '$110k - $150k', skills: ['React', 'Tailwind', 'Figma', 'JavaScript'], match: 92, type: 'tech', description: 'Create beautiful and responsive user interfaces', employerId: null },
  { id: 7, title: 'ML Engineer', company: 'AI Labs', location: 'San Jose, CA', salary: '$160k - $210k', skills: ['Python', 'TensorFlow', 'PyTorch', 'Data Science'], match: 68, type: 'tech', description: 'Develop machine learning models and solutions', employerId: null },
  { id: 8, title: 'Solutions Architect', company: 'Enterprise Co', location: 'Chicago, IL', salary: '$145k - $185k', skills: ['AWS', 'Azure', 'System Design', 'Leadership'], match: 75, type: 'tech', description: 'Design enterprise-scale solutions for clients', employerId: null },
  { id: 9, title: 'Backend Software Engineer', company: 'CodeNest', location: 'Remote', salary: '$125k - $165k', skills: ['Node.js', 'Express', 'MongoDB', 'AWS'], match: 84, type: 'tech', description: 'Build resilient backend services and APIs for fast-growing products', employerId: null },
  { id: 10, title: 'Frontend Developer', company: 'PixelWave', location: 'San Diego, CA', salary: '$115k - $155k', skills: ['React', 'Next.js', 'CSS', 'GraphQL'], match: 90, type: 'tech', description: 'Craft responsive user interfaces with modern frontend frameworks', employerId: null },
  { id: 11, title: 'Full Stack Developer', company: 'VelocityTech', location: 'Austin, TX', salary: '$125k - $170k', skills: ['React', 'Node.js', 'PostgreSQL', 'Docker'], match: 87, type: 'tech', description: 'Implement end-to-end features across frontend and backend services', employerId: null },
  { id: 12, title: 'Data Engineer II', company: 'InsightWorks', location: 'Seattle, WA', salary: '$138k - $178k', skills: ['Python', 'Airflow', 'BigQuery', 'ETL'], match: 79, type: 'tech', description: 'Build and maintain analytics pipelines for large-scale data platforms', employerId: null },
  { id: 13, title: 'ML Research Engineer', company: 'DeepLogic', location: 'Palo Alto, CA', salary: '$165k - $215k', skills: ['Python', 'PyTorch', 'NLP', 'Model Deployment'], match: 70, type: 'tech', description: 'Research and deploy machine learning models for real-world applications', employerId: null },
  { id: 14, title: 'Cloud Infrastructure Engineer', company: 'NimbusOps', location: 'Denver, CO', salary: '$145k - $185k', skills: ['AWS', 'Terraform', 'Kubernetes', 'CI/CD'], match: 76, type: 'tech', description: 'Design cloud infrastructure and automation for scalable services', employerId: null },
  { id: 15, title: 'HR Manager', company: 'PeopleFirst', location: 'Chicago, IL', salary: '$85k - $105k', skills: ['Recruiting', 'Employee Relations', 'HRIS', 'Compliance'], match: 65, type: 'non-tech', description: 'Manage talent acquisition, employee engagement, and HR operations', employerId: null },
  { id: 16, title: 'Marketing Executive', company: 'GrowthPulse', location: 'New York, NY', salary: '$70k - $90k', skills: ['Content Strategy', 'SEO', 'Campaign Management', 'Analytics'], match: 60, type: 'non-tech', description: 'Execute multi-channel marketing campaigns and drive brand growth', employerId: null },
  { id: 17, title: 'Sales Executive', company: 'RevenueRise', location: 'Boston, MA', salary: '$75k - $95k', skills: ['B2B Sales', 'CRM', 'Negotiation', 'Lead Generation'], match: 62, type: 'non-tech', description: 'Build relationships and close sales opportunities for enterprise clients', employerId: null },
  { id: 18, title: 'Business Analyst', company: 'StrategyWorks', location: 'Remote', salary: '$80k - $100k', skills: ['Data Analysis', 'Stakeholder Management', 'SQL', 'Process Improvement'], match: 68, type: 'non-tech', description: 'Translate business needs into actionable requirements and insights', employerId: null }
];

// Merge mock jobs with any employer-posted jobs saved to disk
const savedEmployerJobs = (database.jobs || []).filter(j => j.employerId !== null);
database.jobs = [...MOCK_JOBS, ...savedEmployerJobs];

// Save database to file (debounced — max once per 500ms)
let saveTimer = null;
const saveDatabase = () => {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const toSave = {
        users: database.users,
        profiles: database.profiles,
        applications: database.applications,
        jobs: database.jobs.filter(j => j.employerId !== null), // only employer-posted jobs
        nextUserId: database.nextUserId,
        nextProfileId: database.nextProfileId,
        nextAppId: database.nextAppId,
        nextJobId: database.nextJobId
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(toSave, null, 2), 'utf8');
    } catch (err) {
      console.error('❌ Failed to save database:', err.message);
    }
  }, 500);
};

const ROLE_SKILL_MAP = {
  'Software Engineer': ['JavaScript', 'TypeScript', 'Node.js', 'React', 'APIs', 'Git'],
  'Frontend Developer': ['JavaScript', 'React', 'HTML', 'CSS', 'TypeScript', 'Responsive Design'],
  'Backend Developer': ['Node.js', 'APIs', 'Databases', 'Authentication', 'Express', 'Docker'],
  'Full Stack Developer': ['React', 'Node.js', 'APIs', 'SQL', 'DevOps', 'Testing'],
  'Mobile App Developer': ['React Native', 'Swift', 'Kotlin', 'Mobile UI', 'APIs', 'Debugging'],
  'Data Scientist': ['Python', 'SQL', 'Machine Learning', 'Statistics', 'Pandas', 'Visualization'],
  'Data Analyst': ['SQL', 'Excel', 'Tableau', 'Power BI', 'Data Cleaning', 'Reporting'],
  'Product Manager': ['Roadmaps', 'Stakeholder Management', 'User Research', 'Prioritization', 'Metrics'],
  'UX/UI Designer': ['Figma', 'Wireframing', 'Prototyping', 'Accessibility', 'User Testing', 'Design Systems'],
  'DevOps Engineer': ['CI/CD', 'Docker', 'Kubernetes', 'AWS', 'Monitoring', 'Infrastructure'],
  'QA/Test Engineer': ['Automation', 'Test Plans', 'Scripting', 'Regression Testing', 'CI', 'Bug Tracking'],
  'Business Analyst': ['Requirements Gathering', 'Process Mapping', 'Stakeholder Alignment', 'UAT', 'Reporting'],
  'Project Manager': ['Planning', 'Risk Management', 'Communication', 'Scrum', 'Budgeting', 'Delivery'],
  'Machine Learning Engineer': ['Python', 'TensorFlow', 'PyTorch', 'Model Deployment', 'Data Pipelines', 'ML Ops']
};

// Database helper functions
const findUserByEmail = (email) => database.users.find(u => u.email === email);
const findUserById = (id) => database.users.find(u => u.id === id);

const createUser = (email, hashedPassword, role) => {
  const user = { id: database.nextUserId++, email, password: hashedPassword, role, createdAt: new Date() };
  database.users.push(user);
  saveDatabase();
  return user;
};

const createProfile = (userId, data) => {
  const profile = { id: database.nextProfileId++, userId, ...data, createdAt: new Date() };
  database.profiles.push(profile);
  saveDatabase();
  return profile;
};

const createJob = (title, company, description, employerId, location = 'Remote', salary = 'Not Specified', skills = []) => {
  const job = {
    id: database.nextJobId++,
    title, company, description, employerId, location, salary, skills,
    createdAt: new Date(),
    match: Math.floor(Math.random() * 40) + 60
  };
  database.jobs.push(job);
  saveDatabase();
  return job;
};

const createApplication = (jobId, candidateId) => {
  const application = {
    id: database.nextAppId++,
    jobId: parseInt(jobId),
    candidateId,
    status: 'Applied',
    appliedAt: new Date()
  };
  database.applications.push(application);
  saveDatabase();
  return application;
};

const normalizeResumeText = (rawText) => {
  if (!rawText) return '';
  return rawText
    .replace(/\u0000/g, ' ')
    .replace(/\r/g, '\n')
    .replace(/[\t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/ {2,}/g, ' ')
    .trim();
};

const extractSectionText = (text, labels, maxChars = 240) => {
  const normalized = text.toLowerCase();
  for (const label of labels) {
    const idx = normalized.indexOf(label.toLowerCase());
    if (idx >= 0) {
      const slice = text.slice(idx + label.length, idx + label.length + maxChars);
      const match = slice.match(/[\:\-\s]*([^\n]{10,200})(?:\n|$)/);
      if (match && match[1]) {
        return match[1].replace(/\n+/g, ' ').trim();
      }
    }
  }
  return '';
};

const parseSkills = (text) => {
  const labelBased = extractSectionText(text, ['skills', 'key skills', 'technical skills', 'core competencies'], 300);
  if (labelBased) {
    const candidates = labelBased.split(/[\,•;\n]/).map(s => s.trim()).filter(Boolean);
    return Array.from(new Set(candidates)).slice(0, 12);
  }

  const skillKeywords = text.match(/\b(JavaScript|TypeScript|React|Node\.js|Python|SQL|AWS|Docker|Kubernetes|HTML|CSS|Java|C#|C\+\+|Ruby|Go|TensorFlow|PyTorch|Machine Learning|Data Science|Figma|Git|API|REST|GraphQL|PostgreSQL|MongoDB)\b/gi);
  if (skillKeywords) {
    return Array.from(new Set(skillKeywords.map(s => s.trim()))).slice(0, 12);
  }
  return [];
};

const parseEducation = (text) => {
  const educationSection = extractSectionText(text, ['education', 'academic qualifications', 'education & training', 'academic background'], 320);
  if (educationSection) {
    const lines = educationSection.split(/[\,\;\n]/).map(line => line.trim()).filter(Boolean);
    return lines.slice(0, 3).join(', ');
  }

  const degreeMatch = text.match(/\b(Bachelor(?:'s)?|Master(?:'s)?|MBA|PhD|Doctorate|Associate)\b[\w\s,\-]{0,60}/i);
  if (degreeMatch) {
    return degreeMatch[0].trim();
  }
  return '';
};

const parseExperience = (text) => {
  const experienceSection = extractSectionText(text, ['experience', 'professional experience', 'work experience', 'career highlights'], 380);
  if (experienceSection) {
    return experienceSection.replace(/\n+/g, ' ').trim();
  }

  const match = text.match(/\b(Experience|Professional Experience|Work Experience)\b[\s:\-]{0,10}([\s\S]{20,260})/i);
  return match ? match[2].replace(/\n+/g, ' ').split(/\n\n/)[0].trim() : '';
};

const parseSummary = (text) => {
  const summarySection = extractSectionText(text, ['professional summary', 'summary', 'profile', 'about me', 'career summary'], 320);
  if (summarySection) return summarySection;
  const firstParagraph = text.split(/\n\n/)[0] || '';
  return firstParagraph.length > 40 ? firstParagraph.trim() : '';
};

const getSummaryStrength = (summary) => {
  if (!summary) return 'Missing summary';
  if (summary.length < 80) return 'Weak summary';
  if (/\d/.test(summary) || /achieve|deliver|improve|manage|lead/i.test(summary)) return 'Strong summary';
  return 'Good summary';
};

const buildSkillGaps = (skills, role) => {
  const normalizedSkills = skills.map(s => s.toLowerCase());
  const idealSkills = ROLE_SKILL_MAP[role] || ['communication', 'teamwork', 'problem solving', 'initiative', 'adaptability'];
  return idealSkills.filter(skill => !normalizedSkills.some(existing => existing.includes(skill.toLowerCase()))).slice(0, 6);
};

const buildResumeAnalysis = (rawText, fileName, fileType, profileRole, profileSkills) => {
  const parsedText = normalizeResumeText(rawText || '');
  const skills = parseSkills(parsedText);
  const experience = parseExperience(parsedText);
  const education = parseEducation(parsedText);
  const summary = parseSummary(parsedText);
  const summaryStrength = getSummaryStrength(summary);
  const missingSections = [];

  if (!summary) missingSections.push('Summary');
  if (!experience) missingSections.push('Experience');
  if (!skills.length) missingSections.push('Skills');
  if (!education) missingSections.push('Education');

  const idealStructure = ['Summary', 'Experience', 'Skills', 'Education'];
  const skillGaps = buildSkillGaps(skills.length ? skills : profileSkills || [], profileRole);

  return {
    fileName,
    fileType,
    extractedSkills: skills,
    extractedExperience: experience,
    extractedEducation: education,
    extractedSummary: summary,
    summaryStrength,
    missingSections,
    skillGaps,
    idealStructure,
    notes: [
      'Resume analysis uses structure and section detection across uploaded content.',
      'If your uploaded document cannot be fully parsed, the system still matches key sections by keywords.'
    ]
  };
};

/**
 * Async resume text extractor — properly handles .docx (mammoth), .pdf (pdf-parse),
 * and falls back to raw buffer text for plain .txt files.
 */
const extractResumeText = async (fileName, fileType, fileData) => {
  if (!fileData) return '';
  const buffer = Buffer.from(fileData, 'base64');
  const name = (fileName || '').toLowerCase();
  const type = (fileType || '').toLowerCase();

  try {
    // .docx — Word document (OpenXML)
    if (name.endsWith('.docx') || type.includes('wordprocessingml') || type.includes('officedocument')) {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value || '';
      console.log(`📄 Mammoth extracted ${text.length} chars from ${fileName}`);
      return normalizeResumeText(text);
    }

    // .pdf
    if (name.endsWith('.pdf') || type.includes('pdf')) {
      const result = await pdfParse(buffer);
      const text = result.text || '';
      console.log(`📄 pdf-parse extracted ${text.length} chars from ${fileName}`);
      return normalizeResumeText(text);
    }
  } catch (parseErr) {
    console.warn(`⚠️ File parser failed for ${fileName}:`, parseErr.message);
  }

  // Fallback: plain text / unknown formats
  let text = buffer.toString('utf8');
  if (text.length < 40) text = buffer.toString('latin1');
  console.log(`📄 Raw text fallback: ${text.length} chars from ${fileName}`);
  return normalizeResumeText(text);
};


const buildSuggestionsForProfile = (profile = {}, analysis = {}) => {
  const suggestions = [];
  const additions = [];

  if (analysis.missingSections && analysis.missingSections.length) {
    suggestions.push(`Add missing sections: ${analysis.missingSections.join(', ')}.`);
    additions.push(...analysis.missingSections.map(section => `Include a strong ${section.toLowerCase()} section.`));
  }

  if (analysis.summaryStrength === 'Weak summary') {
    suggestions.push('Rewrite the summary to include impact, role focus, and measurable outcomes.');
  }
  if (analysis.summaryStrength === 'Missing summary') {
    suggestions.push('Write a concise summary that highlights your role, top strengths, and career goals.');
  }

  if (analysis.skillGaps && analysis.skillGaps.length) {
    suggestions.push(`Close skill gaps by adding: ${analysis.skillGaps.join(', ')}.`);
  }

  if (!profile.experience?.trim()) {
    suggestions.push('Expand your experience section with role responsibilities and measurable results.');
  }

  const roleLabel = profile.role || 'Professional';
  const topSkills = (profile.skills && profile.skills.length ? profile.skills.slice(0, 3) : analysis.extractedSkills.slice(0, 3));
  const betterSummary = `Results-driven ${roleLabel.toLowerCase()} with experience in ${topSkills.length ? topSkills.join(', ') : 'core technical skills'}. Proven ability to deliver strong outcomes through collaboration, problem-solving, and continuous improvement.`;

  return {
    whatToImprove: suggestions.length ? suggestions : ['Start by filling out your profile and uploading your resume for targeted recommendations.'],
    whatToAdd: additions.length ? additions : ['A brief, quantified summary and a clear skills section will make your resume stronger.'],
    betterSummary,
    recommendedSkills: analysis.skillGaps || [],
    recommendedSections: analysis.missingSections || []
  };
};

const buildAutoFixForProfile = (profile = {}, analysis = {}) => {
  const roleLabel = profile.role || 'professional';
  const coreSkills = profile.skills.length ? profile.skills : analysis.extractedSkills;
  const skillPhrase = coreSkills.length ? coreSkills.slice(0, 4).join(', ') : 'your key strengths';
  const improvedSummary = `Accomplished ${roleLabel.toLowerCase()} with strong experience in ${skillPhrase}. Recognized for delivering measurable results, improving processes, and collaborating across teams to solve complex problems.`;

  const addedSkills = analysis.skillGaps ? analysis.skillGaps.slice(0, 4) : [];
  const improvedExperience = profile.experience?.trim() ? profile.experience : `Delivered impactful work through measurable results, cross-functional collaboration, and a consistent focus on quality and efficiency.`;
  const improvedEducation = profile.education?.trim() ? profile.education : `Completed relevant coursework and certifications that support a strong foundation in ${roleLabel.toLowerCase()}.`;

  return {
    improvedSummary,
    improvedExperience,
    improvedEducation,
    addedSkills,
    comment: 'Applied a clean, professional rewrite for your summary and suggested content enhancements where gaps were detected.'
  };
};

console.log('✅ Connected to In-Memory Database for Local Development');

// ============== MIDDLEWARE ==============
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return standardResponse(res, false, null, 'Unauthorized', 401);
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Explicitly check that this user still exists in the in-memory array 
    // to prevent orphaned browser tokens surviving a server restart from bypassing auth
    const user = findUserById(decoded.id);
    if (!user) {
        return standardResponse(res, false, null, 'User session expired or database reset', 401);
    }
    
    // Merge database role into req.user to ensure role is always accurate
    req.user = { ...decoded, role: user.role };
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
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    console.log(`✅ User registered: ${email} (${role})`);
    return standardResponse(res, true, { token, user: { id: user.id, email: user.email, role: user.role } }, 'User registered', 201);
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
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
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

// ============== JOB APPLICATION APIs ==============
app.post('/api/jobs/:id/apply', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'candidate') {
      return standardResponse(res, false, null, 'Only candidates can apply to jobs', 403);
    }
    
    const jobId = parseInt(req.params.id);
    const job = database.jobs.find(j => j.id === jobId);
    
    if (!job) {
      return standardResponse(res, false, null, 'Job not found', 404);
    }
    
    // Check if already applied
    const existing = database.applications.find(a => a.jobId === jobId && a.candidateId === req.user.id);
    if (existing) {
      return standardResponse(res, false, null, 'You have already applied to this job', 400);
    }
    
    const application = createApplication(jobId, req.user.id);
    return standardResponse(res, true, application, 'Application submitted successfully', 201);
  } catch (e) {
    return standardResponse(res, false, null, e.message, 500);
  }
});

app.get('/api/applications', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'candidate') {
      // Return applications for this candidate
      const candidateApps = database.applications.filter(a => a.candidateId === req.user.id);
      
      // Inflate with job details
      const populatedApps = candidateApps.map(app => {
        const jobInfo = database.jobs.find(j => j.id === app.jobId);
        return {
          ...app,
          job: jobInfo || null
        };
      });
      return standardResponse(res, true, populatedApps, 'Candidate applications fetched');
    } 
    else if (req.user.role === 'employer') {
      // Find all jobs posted by this employer
      const employerJobs = database.jobs.filter(j => j.employerId === req.user.id);
      const employerJobIds = employerJobs.map(j => j.id);
      
      // Find applications for those jobs
      const employerApps = database.applications.filter(a => employerJobIds.includes(a.jobId));
      
      // Inflate with candidate profiles and job titles
      const populatedApps = employerApps.map(app => {
        const candidateProfile = database.profiles.find(p => p.userId === app.candidateId) || {};
        const candidateUser = database.users.find(u => u.id === app.candidateId) || {};
        const jobInfo = database.jobs.find(j => j.id === app.jobId) || {};
        
        return {
          ...app,
          job: jobInfo,
          candidate: {
            id: candidateUser.id,
            email: candidateUser.email,
            name: candidateProfile.name || 'Anonymous',
            skills: candidateProfile.skills || [],
            experience: candidateProfile.experience || ''
          }
        };
      });
      
      return standardResponse(res, true, populatedApps, 'Employer applications fetched');
    }
    return standardResponse(res, false, null, 'Invalid role', 403);
  } catch (e) {
    return standardResponse(res, false, null, e.message, 500);
  }
});

app.put('/api/applications/:id/status', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return standardResponse(res, false, null, 'Only employers can update status', 403);
    }
    
    const { status } = req.body;
    const appId = parseInt(req.params.id);
    const application = database.applications.find(a => a.id === appId);
    
    if (!application) {
      return standardResponse(res, false, null, 'Application not found', 404);
    }
    
    // Verify employer owns the job
    const job = database.jobs.find(j => j.id === application.jobId);
    if (!job || job.employerId !== req.user.id) {
      if (job && job.employerId === null) {
        // Mock jobs have employerId null, allow testing
      } else {
        return standardResponse(res, false, null, 'Unauthorized to modify this application', 403);
      }
    }
    
    application.status = status;
    saveDatabase();
    return standardResponse(res, true, application, 'Status updated');
  } catch (e) {
    return standardResponse(res, false, null, e.message, 500);
  }
});

// ── RESUME ANALYZE (Sarvam AI-powered) ──────────────────────────────────────
app.post('/api/profile/resume-analyze', authMiddleware, async (req, res) => {
  try {
      const { fileName, fileType, fileData } = req.body;
      if (!fileName || !fileData) {
        return standardResponse(res, false, null, 'Resume file information is required', 400);
      }

      // Properly extract text from .docx / .pdf / plain text
      const rawText = await extractResumeText(fileName, fileType, fileData);
      console.log(`📝 Resume text preview (first 200 chars): ${rawText.slice(0, 200)}`);

      const profile = database.profiles.find(p => p.userId === req.user.id) || {};

      try {
        const analysis = await analyzeResumeWithAI(
          rawText, fileName, fileType,
          profile.role || req.user.role,
          profile.skills || []
        );
        return standardResponse(res, true, analysis, 'Resume analyzed by Sarvam AI');
      } catch (aiErr) {
        console.warn('⚠️ Sarvam AI analysis failed, using rule-based fallback:', aiErr.message);
        const analysis = buildResumeAnalysis(rawText, fileName, fileType, profile.role || req.user.role, profile.skills || []);
        return standardResponse(res, true, { ...analysis, aiPowered: false }, 'Resume analyzed (rule-based fallback)');
      }
  } catch (e) {
      return standardResponse(res, false, null, e.message, 500);
  }
});

// ── GET SUGGESTIONS (Sarvam AI-powered) ─────────────────────────────────────
app.post('/api/profile/suggestions', authMiddleware, async (req, res) => {
  try {
      const profile = req.body.profile || database.profiles.find(p => p.userId === req.user.id) || {};
      const analysis = req.body.resumeAnalysis || {};

      try {
        const suggestions = await getSuggestionsWithAI(profile, analysis);
        return standardResponse(res, true, suggestions, 'AI suggestions generated by Sarvam AI');
      } catch (aiErr) {
        console.warn('⚠️ Sarvam AI suggestions failed, using rule-based fallback:', aiErr.message);
        const suggestions = buildSuggestionsForProfile(profile, analysis);
        return standardResponse(res, true, { ...suggestions, aiPowered: false }, 'Suggestions generated (rule-based fallback)');
      }
  } catch (e) {
      return standardResponse(res, false, null, e.message, 500);
  }
});

// ── IMPROVE RESUME (Sarvam AI-powered) ──────────────────────────────────────
app.post('/api/profile/improve', authMiddleware, async (req, res) => {
  try {
      const profile = req.body.profile || database.profiles.find(p => p.userId === req.user.id) || {};
      const analysis = req.body.resumeAnalysis || {};

      try {
        const improvement = await improveResumeWithAI(profile, analysis);
        return standardResponse(res, true, improvement, 'Resume improved by Sarvam AI');
      } catch (aiErr) {
        console.warn('⚠️ Sarvam AI improvement failed, using rule-based fallback:', aiErr.message);
        const improvement = buildAutoFixForProfile(profile, analysis);
        return standardResponse(res, true, { ...improvement, aiPowered: false }, 'Resume improved (rule-based fallback)');
      }
  } catch (e) {
      return standardResponse(res, false, null, e.message, 500);
  }
});

// GET /api/profile - Fetch the current user's profile
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
      const profile = database.profiles.find(p => p.userId === req.user.id) || null;
      return standardResponse(res, true, profile, 'Profile fetched');
  } catch (e) {
      return standardResponse(res, false, null, e.message, 500);
  }
});

// POST /api/profile - Create or update the current user's profile
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
      const incomingSkills = Array.isArray(req.body.skills) ? req.body.skills : undefined;
      const hasExperienceField = Object.prototype.hasOwnProperty.call(req.body, 'experience');
      const updateData = {
        name: req.body.name ?? profile?.name ?? '',
        role: req.body.role ?? profile?.role ?? req.user.role,
        bio: req.body.bio ?? profile?.bio ?? '',
        education: req.body.education ?? profile?.education ?? '',
        profilePicture: Object.prototype.hasOwnProperty.call(req.body, 'profilePicture')
          ? req.body.profilePicture
          : (profile?.profilePicture || ''),
        skills: incomingSkills !== undefined
          ? incomingSkills
          : (profile?.skills || []),
        experience: hasExperienceField
          ? (aiData.summary || experience)
          : (profile?.experience || '')
      };

      if (profile) {
        Object.assign(profile, updateData);
        saveDatabase(); // persist update
      } else {
        profile = createProfile(req.user.id, updateData); // createProfile calls saveDatabase internally
      }
      
      console.log(`✅ Profile saved for user: ${req.user.email}`);
      return standardResponse(res, true, profile, 'Profile saved successfully');
  } catch (e) {
      return standardResponse(res, false, null, e.message, 500);
  }
});

// ============== AI CAREER COACH - GEMINI-POWERED AGENT ==============

// Get coach status on startup
const coachStatus = getCoachStatus();
console.log('🤖 Career Coach Status:', JSON.stringify(coachStatus, null, 2));

app.post('/api/coach/message', async (req, res) => {
  try {
    const { message, userContext } = req.body;

    // Validation
    if (!message || !message.trim()) {
      return standardResponse(res, false, null, 'Message cannot be empty', 400);
    }

    console.log('\n' + '='.repeat(80));
    console.log('📨 COACH REQUEST - Message:', message.substring(0, 100));
    console.log('👤 User Context:', JSON.stringify(userContext, null, 2));

    // Process message through AI Agent
    const result = await coachProcessMessage(message, userContext);

    if (!result.success) {
      return standardResponse(res, false, null, result.error, 400);
    }

    console.log('✅ Coach Response Generated');
    console.log('   - Intent:', result.intent);
    console.log('   - Model:', result.model);
    console.log('   - Length:', result.message.length, 'chars');

    return standardResponse(res, true, {
      message: result.message,
      intent: result.intent,
      model: result.model,
      timestamp: result.timestamp,
      ...(result.note && { note: result.note })
    }, 'Career guidance generated successfully');

  } catch (error) {
    console.error('❌ Coach Error:', error.message);
    console.error('❌ Stack:', error.stack);
    
    return standardResponse(res, false, null, 'Failed to generate career guidance: ' + error.message, 500);
  }
});

// Coach status endpoint
app.get('/api/coach/status', (req, res) => {
  const status = getCoachStatus();
  return standardResponse(res, true, status, 'Coach status retrieved');
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

// Global error handler for request parsing and other uncaught errors
app.use((err, req, res, next) => {
  if (err && (err.type === 'entity.too.large' || err.status === 413 || err.statusCode === 413)) {
    return standardResponse(res, false, null, 'Request payload too large. Please use a smaller image or reduce the request size.', 413);
  }

  console.error('Unhandled error:', err?.message || err);
  return standardResponse(res, false, null, err?.message || 'Internal server error', err?.status || 500);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
