# 🚀 VIVA AI-Powered Job Portal

<div align="center">
  <img src="frontend/public/logo.png" alt="VIVA Logo" width="120" />
  <h3>The Future of Talent Acquisition & Career Growth</h3>
  <p><b>Built with Sarvam AI • Rich Aesthetics • High-Performance Agents</b></p>

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
</div>

---

## 🌟 Overview

**🌐 Live Demo:** [VIVA Job Portal (Click Here)](https://job-portal-teal-eight-25.vercel.app/)

**VIVA** is a state-of-the-art, full-stack job portal that leverages **Sarvam AI** to bridge the gap between candidates and employers. It features a premium, glassmorphism-inspired UI with a dynamic dark/light mode system and specialized AI agents for every step of the recruitment journey.

### 💎 Design Philosophy
- **Rich Aesthetics**: A stunning first impression with vibrant colors, smooth gradients, and micro-animations.
- **Premium UX**: Modern typography (Inter/Geist) and an interface that feels alive and responsive.
- **True Dark Mode**: A deep, polished dark theme designed for professional environments.

---

## ✨ Key Features

### 👨‍💻 For Candidates
| Feature | Intelligence |
| :--- | :--- |
| 🤖 **AI Career Coach** | Personalized roadmaps, skill gap analysis, and 24/7 career guidance powered by `sarvam-105b`. |
| 📄 **Resume Architect** | Deep analysis of `.pdf` & `.docx` files. AI extracts hidden superpowers and scores your profile. |
| ✨ **One-Click Improvement** | Instantly rewrite summaries and experience sections with AI-powered professional phrasing. |
| 🎤 **Interview Prep** | Dynamic, role-specific technical and behavioral questions to help you ace your next meeting. |
| 🔔 **Live Notifications** | Get notified instantly via email when an employer views your profile or updates your status. |

### 🏢 For Employers
| Feature | Efficiency |
| :--- | :--- |
| 🧠 **Automated Screening** | One-click AI screening that evaluates all applicants against job requirements in seconds. |
| 📧 **Auto-Mail System** | Automated personalized acceptance/rejection emails based on AI screening results. |
| 🛡️ **Fraud Detection** | Intelligent monitoring for suspicious job postings and applications. |
| 📊 **Insight Dashboard** | Real-time tracking of candidate progress and profile completion metrics. |

---

## 🛠️ Technology Stack

### Core Frameworks
- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express.js.
- **AI Engine**: Python FastAPI (High-performance agent endpoints).

### Intelligence & Utilities
- **AI Models**: Sarvam AI (`sarvam-105b`) via OpenAI-compatible SDK.
- **Mailing**: Nodemailer with Ethereal/SMTP integration for live notifications.
- **Database**: Persistent JSON-based local store (`db.json`) — high performance without database overhead.
- **Parsing**: Mammoth (.docx) and PDF-Parse.

---

## 🚀 Quick Start (Windows)

### 1️⃣ Clone & Navigate
```bash
git clone https://github.com/Salwa-Tech16124/JOB-PORTAL.git
cd JOB-PORTAL
```

### 2️⃣ Automatic Setup
Double-click `setup.bat`. This will:
- ✅ Verify Node.js and Python environments.
- ✅ Install all NPM & Python dependencies.
- ✅ Configure local environment variables and AI keys.

### 3️⃣ Launch the Portal
Double-click `start-all.bat`. This starts all services simultaneously:
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **AI Agent Service**: [http://localhost:8000](http://localhost:8000)

---

## 🔑 Configuration

The system uses a pre-configured `.env` in the `backend/` directory for local development:
```env
SARVAM_API_KEY=sk_xs5dbt92_YCfO5S7AF3b9DIQxznmH8tao
JWT_SECRET=ai-job-portal-jwt-secret-2024
PORT=5000
```

---

## 📧 Email Testing & Notifications

By default, the system uses **Ethereal Email** for testing. This means no real emails are sent to your inbox, but you can view them online.

- **Viewing Emails**: When an email is triggered (e.g., status update), check the backend console for an Ethereal link (e.g., `https://ethereal.email/message/...`).
- **Production Setup**: To send real emails, update `backend/.env` with your SMTP credentials:
  ```env
  MAIL_USER=your-email@gmail.com
  MAIL_PASS=your-app-password
  ```

---

## 📁 Project Architecture

```
JOB-PORTAL/
├── frontend/             ← React UI (Port 5173)
│   ├── src/pages/        ← Dashboard, Coach, Interview, Profile
│   └── src/components/   ← Rich UI components & glassmorphism system
├── backend/              ← Express API (Port 5000)
│   ├── services/         ← AI Agent Logic (Coach, Resume, Interview)
│   ├── local_db/         ← Persistent JSON storage
│   └── scratch/          ← Testing utilities
└── ai-service/           ← Python FastAPI Agents (Port 8000)
```

---

## 📜 License & Copyright

© 2024 **Salwa Kazmi**. All rights reserved.
Built with ❤️ for the next generation of professionals.
