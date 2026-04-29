# 🚀 AI-Powered Job Portal

A modern, full-stack job portal powered by **Sarvam AI** — featuring intelligent resume analysis, career coaching, interview simulation, and smart job matching.

> **Zero-config setup**: Clone → Run `setup.bat` → Run `start-all.bat` → Done.

---

## ✨ Features

### For Candidates
| Feature | Description |
|---|---|
| 🤖 **AI Career Coach** | Personalized roadmaps, skill gap analysis, salary guidance — powered by Sarvam AI (`sarvam-105b`) |
| 📄 **Resume Architect** | Upload `.pdf` or `.docx` resumes — AI extracts skills, scores the resume, identifies missing sections |
| 💡 **AI Suggestions** | Get specific, role-tailored improvement suggestions for your resume |
| ✨ **Auto-Improve Resume** | One-click AI rewrite of your summary, experience, and education sections |
| 🎤 **Interview Simulator** | Practice with dynamic AI-generated interview questions for your target role |
| 📊 **Application Tracker** | Track all job applications and their statuses from one dashboard |

### For Employers
| Feature | Description |
|---|---|
| 📝 **Job Posting** | Post and manage job listings with skill requirements |
| 🧠 **Smart Matching** | AI-assisted candidate-to-job matching based on extracted skills |
| 🛡️ **Fraud Detection** | Rule-based and AI-assisted fraud detection on applications |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** + shadcn/ui (Radix UI)
- **Framer Motion** for animations
- **React Router DOM**, React Hook Form, Recharts

### Backend
- **Node.js** + **Express.js**
- **Persistent File Database** (`backend/local_db/db.json`) — no MongoDB required
- **JWT** authentication + **bcrypt** password hashing
- **Sarvam AI** via OpenAI-compatible SDK (`sarvam-105b` model)
- **mammoth** (`.docx` parsing) + **pdf-parse** (`.pdf` parsing)

### AI Service (Python)
- **FastAPI** + **Uvicorn**
- Agent endpoints for profile analysis, fraud detection, job matching

---

## 📋 Requirements

| Requirement | Version | Download |
|---|---|---|
| **Node.js** | v18 or higher | [nodejs.org](https://nodejs.org/) |
| **Python** | v3.9 or higher | [python.org](https://python.org/) |
| **Git** | Any recent version | [git-scm.com](https://git-scm.com/) |

> **No MongoDB, no cloud DB, no paid API keys needed.** Everything is pre-configured.

---

## 🚀 Quick Start (Windows)

### Step 1 — Clone the repository
```bash
git clone https://github.com/Salwa-Tech16124/JOB-PORTAL.git
cd JOB-PORTAL
```

### Step 2 — Run the auto-setup (once only)
```
Double-click: setup.bat
```
This will automatically:
- ✅ Check that Node.js and Python are installed
- ✅ Install all backend npm packages (`mammoth`, `pdf-parse`, `openai`, etc.)
- ✅ Install all frontend npm packages
- ✅ Install Python packages (`fastapi`, `uvicorn`, `pydantic`)
- ✅ Create `backend/.env` with the Sarvam AI key pre-filled

### Step 3 — Start all services
```
Double-click: start-all.bat
```
This launches 3 windows:
| Service | URL |
|---|---|
| 🖥️ Frontend (React) | http://localhost:5173 |
| ⚙️ Backend (Node.js) | http://localhost:5000 |
| 🐍 AI Service (Python) | http://localhost:8000 |

Your browser will open automatically to `http://localhost:5173`.

---

## 🔑 Environment Variables

The `setup.bat` creates `backend/.env` automatically. Contents:

```env
# Sarvam AI — pre-configured, no changes needed
SARVAM_API_KEY=sk_xs5dbt92_YCfO5S7AF3b9DIQxznmH8tao

# JWT Secret — change in production
JWT_SECRET=ai-job-portal-jwt-secret-2024

# Server port
PORT=5000
```

> **Note:** `.env` is in `.gitignore` and will never be committed to the repo.

---

## 📁 Project Structure

```
JOB-PORTAL/
├── setup.bat                  ← Run once after cloning
├── start-all.bat              ← Run every time to start the app
│
├── frontend/                  ← React + Vite app (port 5173)
│   └── src/pages/
│       ├── Profile.jsx        ← Resume Architect + AI features
│       ├── Coach.jsx          ← AI Career Coach
│       ├── Interview.jsx      ← Interview Simulator
│       ├── JobBoard.jsx       ← Job listings
│       └── Dashboard.jsx      ← Overview & applications
│
├── backend/                   ← Node.js + Express (port 5000)
│   ├── server.js              ← Main server, all API routes
│   ├── local_db/db.json       ← Persistent local database (auto-created)
│   ├── .env                   ← API keys (auto-created by setup.bat)
│   └── services/
│       ├── careerCoachAgent.js ← Sarvam AI career coaching
│       ├── resumeAgent.js      ← Sarvam AI resume analysis
│       └── promptBuilder.js    ← Prompt templates
│
└── ai-service/                ← Python FastAPI (port 8000)
    ├── main.py                ← Agent endpoints
    └── requirements.txt       ← Python dependencies
```

---

## 🧪 How to Use

### As a Candidate
1. **Register** at `http://localhost:5173` → click "Sign Up" → choose "I am a Candidate"
2. **Fill your profile** on the AI Profile page (name, role, skills, experience)
3. **Upload your resume** (PDF or DOCX) → click **Analyze Resume**
4. Click **Get Suggestions** → AI gives you specific improvement tips
5. Click **Improve Resume** → AI rewrites your summary and experience sections
6. Browse jobs on **Job Board** and apply
7. Chat with the **AI Career Coach** for roadmaps and interview prep
8. Practice on **Interview Prep** with AI-generated questions

### As an Employer
1. **Register** → choose "I am an Employer"
2. Post jobs from the **Dashboard**
3. View and manage applications

---

## 💾 Data Persistence

User accounts, profiles, and applications are saved to `backend/local_db/db.json`. Your data **survives server restarts** automatically.

> This file is in `.gitignore` — it stays local and is never pushed to GitHub.

---

## 📄 License

This project is proprietary. All rights reserved — © Salwa Kazmi.
