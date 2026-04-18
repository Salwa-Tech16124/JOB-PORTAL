import re
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

# A categorized and extensible dictionary for intelligent, normalized skill extraction
TECH_DICTIONARY = {
    "frontend": {
        "javascript": ["javascript", "js", "ecmascript"],
        "react": ["react", "reactjs", "react.js"],
        "css": ["css", "css3", "sass", "less"],
        "html": ["html", "html5"],
        "typescript": ["typescript", "ts"],
        "vue": ["vue", "vuejs"],
        "angular": ["angular", "angularjs"]
    },
    "backend": {
        "python": ["python", "python3"],
        "node.js": ["node.js", "node", "nodejs"],
        "fastapi": ["fastapi"],
        "java": ["java", "spring boot"],
        "c++": ["c++", "cpp"],
        "c#": ["c#", "csharp", ".net"]
    },
    "ai_ml": {
        "machine learning": ["machine learning", "ml"],
        "artificial intelligence": ["ai", "artificial intelligence"],
        "nlp": ["nlp", "natural language processing"],
        "tensorflow": ["tensorflow", "tf"],
        "pytorch": ["pytorch"],
        "llm": ["llm", "large language models", "generative ai"]
    },
    "databases": {
        "mongodb": ["mongodb", "mongo"],
        "sql": ["sql", "mysql", "postgresql", "postgres"],
        "redis": ["redis"]
    },
    "devops": {
        "aws": ["aws", "amazon web services"],
        "docker": ["docker", "containerization"],
        "kubernetes": ["kubernetes", "k8s"],
        "git": ["git", "github", "gitlab"],
        "linux": ["linux", "ubuntu", "unix"]
    }
}

def extract_normalized_skills(text: str) -> list:
    """Intelligently extracts and normalizes skills using strict word boundaries."""
    found_skills = set()
    text_lower = text.lower()
    
    for category, category_skills in TECH_DICTIONARY.items():
        for canonical, aliases in category_skills.items():
            for alias in aliases:
                # Use regex boundaries to safely match "js" without triggering on "json"
                if re.search(r'\b' + re.escape(alias) + r'\b', text_lower):
                    display_name = canonical.upper() if len(canonical) <= 3 else canonical.title()
                    found_skills.add(display_name)
                    break # Stop checking aliases once the primary canonical skill is found
                    
    return list(found_skills)

# --- 1. ProfileAgent ---
@app.post("/agent/profile")
async def profile_agent(data: ProfileInput):
    try:
        extracted_skills = extract_normalized_skills(data.text)
                
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
        
        # Simple heuristic split: Look for keywords that imply optional skills
        optional_keywords = ["optional", "bonus", "nice to have", "plus", "preferred"]
        split_index = len(desc_lower)
        for kw in optional_keywords:
            idx = desc_lower.find(kw)
            if idx != -1 and idx < split_index:
                split_index = idx
                
        core_text = data.job_description[:split_index]
        optional_text = data.job_description[split_index:]
        
        core_skills = extract_normalized_skills(core_text)
        optional_skills = extract_normalized_skills(optional_text)
        
        # Ensure optional skills don't overlap with core skills
        optional_skills = [s for s in optional_skills if s not in core_skills]
                
        if not core_skills and not optional_skills:
            return standard_response({
                "match_percentage": 100, "missing_skills": [], "matched_skills": []
            }, message="No specific technical requirements found in job description")

        matched_skills = []
        missing_skills = []
        
        score = 0.0
        max_score = 0.0
        
        # Weighting Rules: Core = 2.0 points, Optional = 1.0 points
        for skill in core_skills:
            max_score += 2.0
            if any(skill.lower() == u.lower() for u in user_skills_lower):
                score += 2.0
                matched_skills.append(skill)
            else:
                missing_skills.append(skill)
                
        for skill in optional_skills:
            max_score += 1.0
            if any(skill.lower() == u.lower() for u in user_skills_lower):
                score += 1.0
                matched_skills.append(skill)
            # Optional skills are not appended to missing_skills if missed

        match_percentage = int((score / max_score) * 100) if max_score > 0 else 100
        
        return standard_response({
            "match_percentage": match_percentage,
            "missing_skills": missing_skills,
            "matched_skills": matched_skills
        }, message="Weighted match calculated successfully")
    except Exception as e:
        return standard_response(success=False, message=str(e))

# --- 3. InterviewAgent ---
QUESTION_BANK = {
    "frontend": {
        "junior": [
            {"question": "What is the Virtual DOM in React?", "expected_topics": ["React", "DOM", "Performance", "State"]},
            {"question": "How do you center a div using CSS Flexbox?", "expected_topics": ["CSS", "Flexbox", "Alignment"]}
        ],
        "senior": [
            {"question": "How do you handle state management at scale?", "expected_topics": ["Redux", "Context API", "Architecture", "Performance"]},
            {"question": "Explain frontend architecture and web optimization.", "expected_topics": ["Lazy Loading", "Code Splitting", "Web Vitals", "Caching"]}
        ]
    },
    "backend": {
        "junior": [
            {"question": "What is a RESTful API?", "expected_topics": ["REST", "HTTP Methods", "Statelessness", "Endpoints"]},
            {"question": "Explain the difference between SQL and NoSQL databases.", "expected_topics": ["SQL", "NoSQL", "Relational", "Document", "Scale"]}
        ],
        "senior": [
            {"question": "How do you design a system to handle 1 million concurrent web sockets?", "expected_topics": ["System Design", "Load Balancing", "Redis", "Scaling"]},
            {"question": "Explain Microservices vs Monolithic architecture.", "expected_topics": ["Microservices", "Monolith", "Coupling", "Deployment"]}
        ]
    }
}

@app.post("/agent/interview")
async def interview_agent(data: InterviewInput):
    try:
        role_cat = "frontend" if "frontend" in data.role.lower() else "backend"
        level_cat = "senior" if "senior" in data.experience_level.lower() or "lead" in data.experience_level.lower() else "junior"
        
        tech_questions = QUESTION_BANK.get(role_cat, {}).get(level_cat, [])
        general_questions = [
            {"question": f"Can you walk me through your experience as a {data.role}?", "expected_topics": ["Career History", "Projects", "Impact"]},
            {"question": f"What is the most complex problem you have solved at the {data.experience_level} level?", "expected_topics": ["Problem Solving", "Complexity", "Outcome"]},
            {"question": "How do you handle constructive criticism?", "expected_topics": ["Soft Skills", "Feedback", "Growth Mindset"]}
        ]
        
        return standard_response({
            "questions": general_questions + tech_questions
        }, message="Structured questions generated successfully")
    except Exception as e:
        return standard_response(success=False, message=str(e))

@app.post("/agent/interview/evaluate")
async def evaluate_answer(data: AnswerInput):
    try:
        word_count = len(data.answer.split())
        extracted_tech = extract_normalized_skills(data.answer)
        
        if word_count > 15 and len(extracted_tech) > 0:
            score = "Pass (Strong)"
            feedback = f"Great answer! You provided good depth and properly referenced technical concepts like: {', '.join(extracted_tech)}."
        elif word_count > 5:
            score = "Pass (Marginal)"
            feedback = "Acceptable, but try to expand your answer using more specific technical details."
        else:
            score = "Fail"
            feedback = "Answer is too short or lacks technical substance."
            
        return standard_response({
            "score": score, "feedback": feedback, "word_count": word_count, "extracted_tech": extracted_tech
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
