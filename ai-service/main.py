from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(title="AI Job Portal Agents API")

def standard_response(data=None, success=True, message=""):
    return {
        "success": success,
        "data": data,
        "message": message
    }

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

class AnswerInput(BaseModel):
    question: str
    answer: str

# A global dictionary for realistic skill extraction
TECH_DICTIONARY = [
    "react", "node.js", "python", "mongodb", "fastapi", "javascript",
    "html", "css", "aws", "docker", "sql", "git", "typescript", "java", "c++", "linux"
]

# --- 1. ProfileAgent ---
@app.post("/agent/profile")
async def profile_agent(data: ProfileInput):
    try:
        text_lower = data.text.lower()
        extracted_skills = []
        for skill in TECH_DICTIONARY:
            if skill in text_lower:
                display_name = skill.upper() if len(skill) <= 3 else skill.title()
                extracted_skills.append(display_name)
                
        skill_points = min(len(extracted_skills) * 10, 50)
        length_points = min(len(data.text) // 10, 50) 
        total_score = skill_points + length_points
        
        summary = f"A professional with demonstrated experience in {', '.join(extracted_skills)}." if extracted_skills else "An eager professional looking for new opportunities."
            
        return standard_response({
            "skills": extracted_skills,
            "summary": summary,
            "profile_score": total_score
        }, message="Profile analyzed successfully")
    except Exception as e:
        return standard_response(success=False, message=str(e))

# --- 2. JobMatchAgent ---
@app.post("/agent/match")
async def job_match_agent(data: MatchInput):
    try:
        desc_lower = data.job_description.lower()
        user_skills_lower = [s.lower() for s in data.user_skills]
        
        required_skills = []
        for skill in TECH_DICTIONARY:
            if skill in desc_lower:
                display_name = skill.upper() if len(skill) <= 3 else skill.title()
                required_skills.append(display_name)
                
        if not required_skills:
            return standard_response({
                "match_percentage": 100, "missing_skills": [], "required_skills": []
            }, message="No specific technical requirements found in job description")

        missing_skills = [req for req in required_skills if req.lower() not in user_skills_lower]
        matched_count = len(required_skills) - len(missing_skills)
        match_percentage = int((matched_count / len(required_skills)) * 100)
        
        return standard_response({
            "match_percentage": match_percentage,
            "missing_skills": missing_skills,
            "required_skills": required_skills
        }, message="Match calculated successfully")
    except Exception as e:
        return standard_response(success=False, message=str(e))

# --- 3. InterviewAgent ---
QUESTION_BANK = {
    "frontend": {
        "junior": ["What is the Virtual DOM in React?", "How do you center a div using CSS Flexbox?"],
        "senior": ["How do you handle state management at scale?", "Explain frontend architecture and performance optimization."]
    },
    "backend": {
        "junior": ["What is a RESTful API?", "Explain the difference between SQL and NoSQL databases."],
        "senior": ["How do you design a system to handle 1 million concurrent web sockets?", "Explain Microservices vs Monolithic architecture."]
    }
}

@app.post("/agent/interview")
async def interview_agent(data: InterviewInput):
    try:
        role_cat = "frontend" if "frontend" in data.role.lower() else "backend"
        level_cat = "senior" if "senior" in data.experience_level.lower() or "lead" in data.experience_level.lower() else "junior"
        
        tech_questions = QUESTION_BANK.get(role_cat, {}).get(level_cat, [])
        general_questions = [
            f"Can you walk me through your experience as a {data.role}?",
            f"What is the most complex problem you have solved at the {data.experience_level} level?",
            "How do you handle constructive criticism?"
        ]
        
        return standard_response({
            "questions": general_questions + tech_questions
        }, message="Questions generated successfully")
    except Exception as e:
        return standard_response(success=False, message=str(e))

@app.post("/agent/interview/evaluate")
async def evaluate_answer(data: AnswerInput):
    try:
        word_count = len(data.answer.split())
        contains_tech_terms = any(tech in data.answer.lower() for tech in TECH_DICTIONARY)
        
        if word_count > 15 and contains_tech_terms:
            score = "Pass (Strong)"
            feedback = "Great answer! You provided good depth and used relevant technical terminology."
        elif word_count > 5:
            score = "Pass (Marginal)"
            feedback = "Acceptable, but try to expand your answer using more specific technical details."
        else:
            score = "Fail"
            feedback = "Answer is too short or lacks technical substance."
            
        return standard_response({
            "score": score, "feedback": feedback, "word_count": word_count
        }, message="Response evaluated successfully")
    except Exception as e:
        return standard_response(success=False, message=str(e))

# --- 4. FraudDetectionAgent ---
@app.post("/agent/fraud-detection")
async def fraud_detection_agent(data: JobPostInput):
    try:
        red_flags = ["pay upfront", "wire transfer", "no interview required", "easy money", "crypto"]
        content = (data.title + " " + data.description).lower()
        
        found_flags = [flag for flag in red_flags if flag in content]
        is_fake = len(found_flags) > 0
        
        return standard_response({
            "is_fake": is_fake,
            "reasoning": "Suspicious keywords detected." if is_fake else "Looks legitimate.",
            "flags_found": found_flags
        }, message="Fraud scan complete")
    except Exception as e:
        return standard_response(success=False, message=str(e))

# --- 5. CareerCoachAgent ---
@app.post("/agent/career-coach")
async def career_coach_agent(data: CareerInput):
    try:
        role_lower = data.target_role.lower()
        if "frontend" in role_lower or "ui" in role_lower:
            skills = ["Advanced React Patterns", "Web Performance Optimization", "Accessibility (a11y)"]
        elif "backend" in role_lower or "data" in role_lower:
            skills = ["Distributed Systems", "Database Sharding", "GraphQL"]
        else:
            skills = ["System Design", "Cloud Architecture (AWS/GCP)", "Leadership"]

        roadmap = [
            { "phase": "Phase 1: Foundation", "timeframe": "Months 1-3", "steps": [f"Master the core competencies of a {data.current_role}.", "Identify knowledge gaps holding you back."] },
            { "phase": "Phase 2: Expansion", "timeframe": "Months 4-6", "steps": [f"Take on cross-functional projects related to {data.target_role}.", "Begin learning the suggested technical skills."] },
            { "phase": "Phase 3: Transition", "timeframe": "Months 7-12", "steps": [f"Obtain recognized certifications relevant for a {data.target_role}.", "Start mentoring junior peers to build demonstrable leadership."] }
        ]

        return standard_response({
            "suggested_skills": skills,
            "roadmap": roadmap
        }, message="Roadmap generated successfully")
    except Exception as e:
        return standard_response(success=False, message=str(e))
