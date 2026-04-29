# 🚀 AI-Powered Job Portal

Welcome to the **AI Job Portal**! This is a modern, full-stack application designed to revolutionize the job search and recruitment process. Built with a premium, glassmorphism-inspired UI and powered by advanced AI integrations, it provides intelligent tools for both job seekers and employers.

---

## ✨ Key Features

### For Candidates (Job Seekers)
*   **🤖 AI Career Coach:** Get personalized career roadmaps, skill gap analysis, and learning recommendations tailored to your specific role and goals (powered by Google Gemini / OpenAI).
*   **🎤 Interview Simulator:** Practice for technical interviews with dynamic, AI-generated questions specific to your target job role.
*   **📊 Job Application Tracking:** Easily track the status of your applications, manage your profile, and monitor your progress through an intuitive dashboard.
*   **✨ Modern & Responsive UI:** Experience a stunning, highly interactive UI featuring modern aesthetics (Tailwind CSS, shadcn/ui, framer-motion).

### For Employers
*   **📝 Job Posting & Management:** Seamlessly post new job openings and manage listings.
*   **🧠 Smart Applicant Parsing & Matching:** Utilize AI to accurately extract skills from applications, parse job descriptions, and intelligently match candidates to the right roles.
*   **🛡️ Fraud Detection:** Benefit from rule-based and AI-assisted fraud detection mechanisms to ensure application authenticity.

---

## 🛠️ Tech Stack

### Frontend
*   **Framework:** React 18 (via Vite)
*   **Styling:** Tailwind CSS, css-variables for custom theming
*   **UI Components:** Radix UI / shadcn/ui
*   **Animations:** Framer Motion
*   **Data Visualization:** Recharts
*   **Routing:** React Router DOM
*   **Form Management:** React Hook Form

### Backend
*   **Environment:** Node.js with Express.js
*   **Database:** MongoDB (using Mongoose)
*   **Authentication:** JWT (JSON Web Tokens) & bcrypt
*   **AI Integrations:** Google Generative AI (`@google/generative-ai`), OpenAI (`openai`)
*   **API Security:** CORS, dotenv for environment variables management

---

## 🚀 Getting Started

Follow these steps to get the project running locally.

### 1. Prerequisites
*   [Node.js](https://nodejs.org/) (v16 or higher recommended)
*   [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)
*   A Free **Google Gemini API Key** (Get it at [Google AI Studio](https://aistudio.google.com/))

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Create a `.env` file in the `backend/` directory and add the necessary keys (including your Gemini/OpenAI keys, MongoDB URI, and JWT Secret).
   *Refer to [GEMINI_API_SETUP_REQUIRED.md](./GEMINI_API_SETUP_REQUIRED.md) for detailed instructions.*
4. Start the backend server:
   ```bash
   npm start
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Access the application in your browser at `http://localhost:5173`.

---

## 📚 Extensive Documentation

We have comprehensive documentation covering all aspects of the system. If you want to dive deeper, check out these guides located in the root directory:

*   **[IMMEDIATE_ACTION_PLAN.md](./IMMEDIATE_ACTION_PLAN.md):** ⭐ Start here to get the system working in 5 minutes!
*   **[ARCHITECTURE_GUIDE.md](./ARCHITECTURE_GUIDE.md):** Complete system design, data flow diagrams, and structure overview.
*   **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md):** Master index for all available documentation.
*   **[TESTING_GUIDE.md](./TESTING_GUIDE.md):** Test scenarios and quality checklists.
*   **[COMPLETE_FIX_SUMMARY.md](./COMPLETE_FIX_SUMMARY.md):** Technical overview of recent system enhancements.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📄 License

This project is proprietary and confidential. All rights reserved.
