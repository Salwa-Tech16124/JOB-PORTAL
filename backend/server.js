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
import { generateInterview, evaluateInterview } from './services/interviewAgent.js';
import { screenCandidate } from './services/resumeScreenerAgent.js';
import { sendAcceptanceEmail, sendRejectionEmail, sendViewedEmail } from './services/emailService.js';

const app = express();

// Initialize Sarvam AI (via OpenAI SDK)
const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const openai = new OpenAI({ 
    apiKey: SARVAM_API_KEY,
    baseURL: "https://api.sarvam.ai/v1"
});
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
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

import mongoose from 'mongoose';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/viva-job-portal')
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// --- MONGOOSE SCHEMAS ---
const CounterSchema = new mongoose.Schema({ _id: String, seq: { type: Number, default: 0 } });
const Counter = mongoose.model('Counter', CounterSchema);
const getNextSequence = async (name) => {
  const ret = await Counter.findByIdAndUpdate(name, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return ret.seq;
};

const UserSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  email: { type: String, unique: true },
  password: { type: String },
  role: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

const ProfileSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  userId: { type: Number, unique: true },
  name: String, role: String, title: String, company: String, bio: String,
  education: String, profilePicture: String, skills: [String], experience: String,
  email: String, createdAt: { type: Date, default: Date.now }
});
const Profile = mongoose.model('Profile', ProfileSchema);

const JobSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  title: String, company: String, description: String, employerId: Number,
  location: String, salary: String, skills: [String], match: Number, type: String,
  createdAt: { type: Date, default: Date.now }
});
const Job = mongoose.model('Job', JobSchema);

const ApplicationSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  jobId: Number, candidateId: Number, status: String,
  appliedAt: { type: Date, default: Date.now },
  screeningResult: Object, screenedAt: Date
});
const Application = mongoose.model('Application', ApplicationSchema);

// Database helper functions

const findUserByEmail = async (email) => await User.findOne({ email });
const findUserById = async (id) => await User.findOne({ id });

const createUser = async (email, hashedPassword, role) => {
  const id = await getNextSequence('userId');
  const user = new User({ id, email, password: hashedPassword, role });
  await user.save();
  return user;
};

const createProfile = async (userId, data) => {
  const id = await getNextSequence('profileId');
  const profile = new Profile({ id, userId, ...data });
  await profile.save();
  return profile;
};

const createJob = async (title, company, description, employerId, location = 'Remote', salary = 'Not Specified', skills = []) => {
  const id = await getNextSequence('jobId');
  const job = new Job({ id, title, company, description, employerId, location, salary, skills, match: Math.floor(Math.random() * 40) + 60 });
  await job.save();
  return job;
};

const createApplication = async (jobId, candidateId) => {
  const id = await getNextSequence('appId');
  const application = new Application({ id, jobId, candidateId, status: 'Applied' });
  await application.save();
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
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return standardResponse(res, false, null, 'Unauthorized', 401);
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Explicitly check that this user still exists in the in-memory array 
    // to prevent orphaned browser tokens surviving a server restart from bypassing auth
    const user = await findUserById(decoded.id);
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
    if (await findUserByEmail(email)) {
      return standardResponse(res, false, null, 'Email already exists', 400);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(email, hashedPassword, role);
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
    const user = await findUserByEmail(email);
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
      return standardResponse(res, true, await Job.find({}), 'Jobs fetched');
  } catch (e) {
      return standardResponse(res, false, null, e.message, 500);
  }
});

app.post('/api/jobs', authMiddleware, async (req, res) => {
  try {
      if (req.user.role !== 'employer') return standardResponse(res, false, null, 'Forbidden', 403);

      // 1. AI Fraud Detection
      try {
        const aiRes = await fetch(`${process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000'}/agent/fraud-detection`, {
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

      const job = await createJob(req.body.title, req.body.company, req.body.description, req.user.id);
      return standardResponse(res, true, job, 'Job created', 201);
  } catch (e) {
      return standardResponse(res, false, null, e.message, 500);
  }
});

app.get('/api/jobs/:id/match', authMiddleware, async (req, res) => {
  try {
    const job = await Job.find({}).find(j => j.id == req.params.id);
    const profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile || !profile.skills || profile.skills.length === 0) {
       return standardResponse(res, false, null, 'Please complete your profile first', 400);
    }

    const aiRes = await fetch(`${process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000'}/agent/match`, {
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
    const job = await Job.find({}).find(j => j.id === jobId);
    
    if (!job) {
      return standardResponse(res, false, null, 'Job not found', 404);
    }
    
    // Check if already applied
    const existing = await Application.findOne({ jobId: jobId, candidateId: req.user.id });
    if (existing) {
      return standardResponse(res, false, null, 'You have already applied to this job', 400);
    }
    
    // Skill relevance check
    const candidateProfile = await Profile.findOne({ userId: req.user.id }) || {};
    const candidateSkills = (candidateProfile.skills || []).map(s => s.toLowerCase());
    const jobSkills = (job.skills || []).map(s => s.toLowerCase());
    
    // If job has skills, check if candidate has at least one matching skill or related title
    if (jobSkills.length > 0) {
      const hasMatch = jobSkills.some(js => 
        candidateSkills.some(cs => cs.includes(js) || js.includes(cs)) ||
        (candidateProfile.role && candidateProfile.role.toLowerCase().includes(job.title.toLowerCase()))
      );
      
      if (!hasMatch && jobSkills.length > 2) { // Only block if it's a clear mismatch
        return standardResponse(res, false, null, `Your profile (${candidateProfile.role || 'Unspecified'}) does not appear to match the requirements for ${job.title}. Please update your skills to apply.`, 400);
      }
    }
    
    const application = await createApplication(jobId, req.user.id);
    return standardResponse(res, true, application, 'Application submitted successfully', 201);
  } catch (e) {
    return standardResponse(res, false, null, e.message, 500);
  }
});

app.get('/api/applications', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'candidate') {
      // Return applications for this candidate
      const candidateApps = await Application.find({ candidateId: req.user.id }).lean();
      
      // Inflate with job details
      const populatedApps = await Promise.all(candidateApps.map(async app => {
        const jobInfo = await Job.findOne({ id: app.jobId }).lean();
        return {
          ...app,
          job: jobInfo || null
        };
      }));
      return standardResponse(res, true, populatedApps, 'Candidate applications fetched');
    } 
    else if (req.user.role === 'employer') {
      // Find all jobs posted by this employer
      const employerJobs = await Job.find({ employerId: req.user.id }).lean();
      const employerJobIds = employerJobs.map(j => j.id);
      
      // Find applications for those jobs
      const employerApps = await Application.find({ jobId: { $in: employerJobIds } }).lean();
      
      // Inflate with candidate profiles and job titles
      const populatedApps = await Promise.all(employerApps.map(async app => {
        const candidateProfile = await Profile.findOne({ userId: app.candidateId }).lean() || {};
        const candidateUser = await User.findOne({ id: app.candidateId }).lean() || {};
        const jobInfo = await Job.findOne({ id: app.jobId }).lean() || {};
        
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
      }));
      
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
    const application = await Application.findOne({ id: appId });
    
    if (!application) {
      return standardResponse(res, false, null, 'Application not found', 404);
    }
    
    // Verify employer owns the job
    const job = await Job.find({}).find(j => j.id === application.jobId);
    if (!job || job.employerId !== req.user.id) {
      if (job && job.employerId === null) {
        // Mock jobs have employerId null, allow testing
      } else {
        return standardResponse(res, false, null, 'Unauthorized to modify this application', 403);
      }
    }
    
    const oldStatus = application.status;
    application.status = status;

    // Notify candidate if status is "Viewed by Company"
    if (status === 'Viewed by Company' && oldStatus !== 'Viewed by Company') {
      try {
        const candidateUser = await User.findOne({ id: application.candidateId });
        const candidateProfile = await Profile.findOne({ userId: application.candidateId });
        
        // Use profile email if available, otherwise user account email
        const targetEmail = candidateProfile?.email || candidateUser?.email;
        
        if (targetEmail) {
          await sendViewedEmail({
            to: targetEmail,
            candidateName: candidateProfile?.name || 'Candidate',
            jobTitle: job.title,
            companyName: job.company
          });
          console.log(`📩 Notification: Viewed email sent to ${targetEmail}`);
        }
      } catch (err) {
        console.error('Failed to send viewed notification:', err.message);
      }
    }

    return standardResponse(res, true, application, 'Status updated');
  } catch (e) {
    return standardResponse(res, false, null, e.message, 500);
  }
});

// ── AI RESUME SCREENER & EMAIL SENDER ────────────────────────────────────────
// POST /api/jobs/:id/screen
// Screens all applicants for a job using Sarvam AI, moves suitable ones to
// "Interested" status, sends acceptance/rejection emails.
app.post('/api/jobs/:id/screen', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return standardResponse(res, false, null, 'Only employers can screen candidates', 403);
    }

    const jobId = parseInt(req.params.id);
    const job = await Job.find({}).find(j => j.id === jobId);
    if (!job) return standardResponse(res, false, null, 'Job not found', 404);
    if (job.employerId !== req.user.id) {
      return standardResponse(res, false, null, 'You can only screen candidates for your own jobs', 403);
    }

    // Get employer's profile for company/name info
    const employerProfile = await Profile.findOne({ userId: req.user.id }) || {};
    const employerUser = await User.findOne({ id: req.user.id }) || {};
    const companyName = employerProfile.company || job.company || 'Our Company';
    const employerName = employerProfile.name || employerUser.email || 'The Hiring Team';

    // Get all applications for this job that haven't been screened yet
    const jobApplications = await Application.find({ jobId: jobId, status: { $nin: ['Interested', 'Screened_Rejected'] } });

    if (jobApplications.length === 0) {
      return standardResponse(res, true, { results: [], total: 0 }, 'No new applicants to screen');
    }

    const results = [];

    for (const application of jobApplications) {
      // Get candidate profile & user info
      const candidateUser = database.users.find(u => u.id === application.candidateId) || {};
      const candidateProfile = database.profiles.find(p => p.userId === application.candidateId) || {};

      const candidateName = candidateProfile.name || candidateUser.email || 'Candidate';
      // Use profile email first, then user account email
      const candidateEmail = candidateProfile.email || candidateUser.email || null;

      console.log(`\n🔍 Screening ${candidateName} for "${job.title}"...`);

      // Run AI screening
      const screening = await screenCandidate({
        candidateProfile: {
          name: candidateName,
          skills: candidateProfile.skills || [],
          experience: candidateProfile.experience || '',
          bio: candidateProfile.bio || '',
          education: candidateProfile.education || ''
        },
        jobTitle: job.title,
        jobDescription: job.description || '',
        jobSkills: job.skills || []
      });

      console.log(`📊 Score: ${screening.score} | Suitable: ${screening.suitable} | AI: ${screening.aiPowered}`);

      // Update application status
      if (screening.suitable) {
        application.status = 'Interested';
        application.screeningResult = screening;
        application.screenedAt = new Date();
        await application.save();

        // Send acceptance email
        const emailResult = await sendAcceptanceEmail({
          to: candidateEmail,
          candidateName,
          jobTitle: job.title,
          companyName,
          employerName,
          strengths: screening.strengths
        });

        results.push({
          applicationId: application.id,
          candidateId: application.candidateId,
          candidateName,
          candidateEmail,
          status: 'Interested',
          score: screening.score,
          reason: screening.reason,
          strengths: screening.strengths,
          gaps: screening.gaps,
          emailSent: emailResult.sent,
          emailPreview: emailResult.previewUrl || null,
          aiPowered: screening.aiPowered
        });
      } else {
        application.status = 'Screened_Rejected';
        application.screeningResult = screening;
        application.screenedAt = new Date();
        await application.save();

        // Send rejection email
        const emailResult = await sendRejectionEmail({
          to: candidateEmail,
          candidateName,
          jobTitle: job.title,
          companyName,
          employerName,
          gaps: screening.gaps
        });

        results.push({
          applicationId: application.id,
          candidateId: application.candidateId,
          candidateName,
          candidateEmail,
          status: 'Screened_Rejected',
          score: screening.score,
          reason: screening.reason,
          strengths: screening.strengths,
          gaps: screening.gaps,
          emailSent: emailResult.sent,
          emailPreview: emailResult.previewUrl || null,
          aiPowered: screening.aiPowered
        });
      }
    }

    const interested = results.filter(r => r.status === 'Interested').length;
    const rejected = results.filter(r => r.status === 'Screened_Rejected').length;

    console.log(`\n✅ Screening complete: ${interested} interested, ${rejected} rejected`);
    return standardResponse(res, true, {
      results,
      total: results.length,
      interested,
      rejected,
      jobTitle: job.title
    }, `Screened ${results.length} candidates: ${interested} interested, ${rejected} not proceeding`);

  } catch (e) {
    console.error('❌ Screening error:', e);
    return standardResponse(res, false, null, e.message, 500);
  }
});


app.post('/api/profile/resume-analyze', authMiddleware, async (req, res) => {
  try {
      const { fileName, fileType, fileData } = req.body;
      if (!fileName || !fileData) {
        return standardResponse(res, false, null, 'Resume file information is required', 400);
      }

      // Properly extract text from .docx / .pdf / plain text
      const rawText = await extractResumeText(fileName, fileType, fileData);
      console.log(`📝 Resume text preview (first 200 chars): ${rawText.slice(0, 200)}`);

      const profile = await Profile.findOne({ userId: req.user.id }) || {};

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
      const profile = await Profile.findOne({ userId: req.user.id }) || null;
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
          const aiRes = await fetch(`${process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000'}/agent/profile`, {
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

      let profile = await Profile.findOne({ userId: req.user.id });
      const incomingSkills = Array.isArray(req.body.skills) ? req.body.skills : undefined;
      const hasExperienceField = Object.prototype.hasOwnProperty.call(req.body, 'experience');
      const updateData = {
        name: req.body.name ?? profile?.name ?? '',
        role: req.body.role ?? profile?.role ?? req.user.role,
        title: req.body.title ?? profile?.title ?? '',
        company: req.body.company ?? profile?.company ?? '',
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
        Object.assign(profile, updateData); // persist update
      } else {
        profile = await createProfile(req.user.id, updateData); // createProfile calls saveDatabase internally
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
    const aiRes = await fetch(`${process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000'}/agent/career-coach`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req.body)
    });
    const dataWrapper = await aiRes.json();
    return standardResponse(res, dataWrapper.success, dataWrapper.data, dataWrapper.message);
  } catch(e) { return standardResponse(res, false, null, e.message, 500); }
});

app.post('/api/interview', authMiddleware, async (req, res) => {
  try {
    const { role, level } = req.body;
    const data = await generateInterview(role, level);
    return standardResponse(res, true, data, 'Interview questions generated');
  } catch(e) { return standardResponse(res, false, null, e.message, 500); }
});

app.post('/api/interview/evaluate', authMiddleware, async (req, res) => {
  try {
    const { role, level, questions, answers } = req.body;
    const data = await evaluateInterview(role, level, questions, answers);
    return standardResponse(res, true, data, 'Interview evaluated');
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
