import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';

const app = express();
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

// ============== DATABASE MODELS ==============

// Create a local data directory if it doesn't exist to persist MongoDB files
const dbPath = path.join(process.cwd(), 'local_db');
if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath);

const mongoServer = await MongoMemoryServer.create({
  instance: { dbPath: dbPath, storageEngine: 'wiredTiger' }
});
const MONGO_URI = mongoServer.getUri();

mongoose.connect(MONGO_URI)
  .then(() => console.log(`Connected to Local Persistent MongoDB at ${MONGO_URI}`))
  .catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['candidate', 'employer'], default: 'candidate' }
});
const User = mongoose.model('User', userSchema);

const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  description: String,
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
const Job = mongoose.model('Job', jobSchema);

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  skills: [String],
  experience: String
});
const Profile = mongoose.model('Profile', profileSchema);

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
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, role });
    await user.save();
    console.log(`✅ User registered: ${email} (${role})`);
    return standardResponse(res, true, null, 'User registered', 201);
  } catch (error) {
    console.error(`❌ Registration error:`, error.message);
    return standardResponse(res, false, null, error.message, 400);
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.log(`⚠️ Failed login attempt for: ${email}`);
      return standardResponse(res, false, null, 'Invalid credentials', 401);
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    console.log(`✅ User logged in: ${email}`);
    return standardResponse(res, true, { token, role: user.role }, 'Login successful');
  } catch (error) {
    console.error(`❌ Login error:`, error.message);
    return standardResponse(res, false, null, error.message, 400);
  }
});

// ============== JOB APIs ==============
app.get('/api/jobs', async (req, res) => {
  try {
      const jobs = await Job.find();
      return standardResponse(res, true, jobs, 'Jobs fetched');
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

      const job = new Job({ ...req.body, employerId: req.user.userId });
      await job.save();
      return standardResponse(res, true, job, 'Job created', 201);
  } catch (e) {
      return standardResponse(res, false, null, e.message, 500);
  }
});

app.get('/api/jobs/:id/match', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    const profile = await Profile.findOne({ userId: req.user.userId });
    
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
      let profile = await Profile.findOne({ userId: req.user.userId });
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

      let profile = await Profile.findOne({ userId: req.user.userId });
      const updateData = {
        ...req.body,
        skills: aiData.skills || [],
        experience: aiData.summary || experience
      };

      if (profile) {
        Object.assign(profile, updateData);
      } else {
        profile = new Profile({ ...req.body, ...updateData, userId: req.user.userId });
      }
      
      await profile.save();
      return standardResponse(res, true, profile, 'Profile updated');
  } catch (e) {
      return standardResponse(res, false, null, e.message, 500);
  }
});

// AI Proxies
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
