from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(title="AI Job Portal Agents API")

# --- Schemas ---
class ProfileInput(BaseModel):
    text: str

class MatchInput(BaseModel):
    user_skills: List[str]
    job_description: str

class InterviewInput(BaseModel):
    role: str
    experience_level: str

class JobPostInput(BaseModel):
    title: str
    description: str

class CareerInput(BaseModel):
    current_role: str
    target_role: str

# --- 1. ProfileAgent ---
@app.post("/agent/profile")
async def profile_agent(data: ProfileInput):
    # Mocking NLP extraction logic
    skills = ["React", "Python", "Problem Solving"] if len(data.text) > 20 else ["Communication"]
    
    return {
        "skills": skills,
        "summary": f"A dedicated professional with experience in {', '.join(skills)}.",
        "profile_score": min(len(data.text) // 5, 100) # Simple length-based mock score
    }

# --- 2. JobMatchAgent ---
@app.post("/agent/match")
async def job_match_agent(data: MatchInput):
    job_keywords = ["react", "node", "python", "mongodb", "fastapi"]
    missing_skills = [skill for skill in job_keywords if skill.lower() not in [s.lower() for s in data.user_skills]]
    
    match_percentage = max(0, 100 - (len(missing_skills) * 15))
    
    return {
        "match_percentage": match_percentage,
        "missing_skills": missing_skills,
    }

# --- 3. InterviewAgent ---
@app.post("/agent/interview")
async def interview_agent(data: InterviewInput):
    return {
        "questions": [
            f"Can you walk me through your experience as a {data.role}?",
            f"What is the most complex problem you have solved at the {data.experience_level} level?",
            "How do you handle constructive criticism?",
            "Describe a time you had to learn a new technology quickly.",
            f"Technical question: Discuss a recent trend relevant to a {data.role}."
        ]
    }

# --- 4. FraudDetectionAgent ---
@app.post("/agent/fraud-detection")
async def fraud_detection_agent(data: JobPostInput):
    # Simple rule-based fraud detection
    red_flags = ["pay upfront", "wire transfer", "no interview required", "easy money", "crypto"]
    content = (data.title + " " + data.description).lower()
    
    found_flags = [flag for flag in red_flags if flag in content]
    is_fake = len(found_flags) > 0
    
    return {
        "is_fake": is_fake,
        "reasoning": "Suspicious keywords detected." if is_fake else "Looks legitimate.",
        "flags_found": found_flags
    }

# --- 5. CareerCoachAgent ---
@app.post("/agent/career-coach")
async def career_coach_agent(data: CareerInput):
    return {
        "suggested_skills": ["System Design", "Cloud Architecture (AWS/GCP)", "Leadership"],
        "roadmap": [
            f"1. Master the fundamentals of your current {data.current_role} role.",
            "2. Take on cross-functional projects to expand your horizon.",
            f"3. Obtain relevant certifications for a {data.target_role}.",
            "4. Start mentoring junior peers to build leadership skills."
        ]
    }
