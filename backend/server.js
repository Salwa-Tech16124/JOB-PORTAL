import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';

const app = express();
app.use(cors());
app.use(express.json());

// Basic Request Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-123';

// ============== DATABASE MODELS ==============
// Start isolated memory database so you don't need to install MongoDB locally
const mongoServer = await MongoMemoryServer.create();
const MONGO_URI = mongoServer.getUri();

mongoose.connect(MONGO_URI)
  .then(() => console.log(`Connected to In-Memory MongoDB at ${MONGO_URI}`))
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
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
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
    res.status(201).json({ message: 'User registered' });
  } catch (error) {
    console.error(`❌ Registration error:`, error.message);
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.log(`⚠️ Failed login attempt for: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    console.log(`✅ User logged in: ${email}`);
    res.json({ token, role: user.role });
  } catch (error) {
    console.error(`❌ Login error:`, error.message);
    res.status(400).json({ error: error.message });
  }
});

// ============== JOB APIs ==============
app.get('/api/jobs', async (req, res) => {
  const jobs = await Job.find();
  res.json(jobs);
});

app.post('/api/jobs', authMiddleware, async (req, res) => {
  if (req.user.role !== 'employer') return res.status(403).json({ message: 'Forbidden' });

  // 1. AI Fraud Detection
  try {
    const aiRes = await fetch('http://127.0.0.1:8000/agent/fraud-detection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: req.body.title || '', description: req.body.description || '' })
    });
    const aiData = await aiRes.json();
    
    if (aiData.is_fake) {
      return res.status(400).json({ message: 'Job flagged as fraudulent', flags: aiData.flags_found });
    }
  } catch(e) {
    console.error('AI Service down:', e);
  }

  const job = new Job({ ...req.body, employerId: req.user.userId });
  await job.save();
  res.status(201).json(job);
});

app.get('/api/jobs/:id/match', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    const profile = await Profile.findOne({ userId: req.user.userId });
    
    if (!profile || !profile.skills || profile.skills.length === 0) {
       return res.status(400).json({ message: 'Please complete your profile first' });
    }

    const aiRes = await fetch('http://127.0.0.1:8000/agent/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_skills: profile.skills, job_description: job.description })
    });
    
    const matchData = await aiRes.json();
    res.json(matchData);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ============== PROFILE APIs ==============
app.get('/api/profile', authMiddleware, async (req, res) => {
  let profile = await Profile.findOne({ userId: req.user.userId });
  res.json(profile || {});
});

app.post('/api/profile', authMiddleware, async (req, res) => {
  let { experience } = req.body; // user sends raw text about their experience
  
  // Ask AI to extract skills and summarize
  let aiData = {};
  if (experience) {
    try {
      const aiRes = await fetch('http://127.0.0.1:8000/agent/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: experience })
      });
      aiData = await aiRes.json();
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
  res.json(profile);
});

// AI Proxies
app.post('/api/coach', authMiddleware, async (req, res) => {
  try {
    const aiRes = await fetch('http://127.0.0.1:8000/agent/career-coach', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req.body)
    });
    res.json(await aiRes.json());
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/interview', authMiddleware, async (req, res) => {
  try {
    const aiRes = await fetch('http://127.0.0.1:8000/agent/interview', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req.body)
    });
    res.json(await aiRes.json());
  } catch(e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
