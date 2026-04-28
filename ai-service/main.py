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
    expected_topics: List[str] = []

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
    """Intelligently extracts and normalizes skills using lookarounds for reliable bounded matching."""
    found_skills = set()
    text_lower = text.lower()
    
    # Preprocessing: normalize common disjointed phrases before extraction
    replacements = {
        "java script": "javascript",
        "react js": "react",
        "react.js": "react",
        "node js": "nodejs",
        "node.js": "nodejs"
    }
    for old, new in replacements.items():
        text_lower = text_lower.replace(old, new)
    
    for category, category_skills in TECH_DICTIONARY.items():
        for canonical, aliases in category_skills.items():
            for alias in aliases:
                # Use regex lookarounds to safely match "js" (not "json") and "c++" (handling non-word chars)
                if re.search(r'(?<!\w)' + re.escape(alias) + r'(?!\w)', text_lower):
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
        
        # Structured heuristic split: Look for specific section boundaries instead of single words
        optional_section_markers = [
            "nice to have", "nice-to-have", "bonus skills", 
            "optional skills", "preferred qualifications", 
            "preferred skills", "optional requirements", "bonus points for"
        ]
        
        split_index = len(desc_lower)
        for marker in optional_section_markers:
            idx = desc_lower.find(marker)
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
                "match_percentage": None, "missing_skills": [], "matched_skills": []
            }, message="No technical skills detected in job description")

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
    },
    "fullstack": {
        "junior": [
            {"question": "How do you handle CORS issues between a frontend and backend?", "expected_topics": ["CORS", "Headers", "Security", "Middleware"]},
            {"question": "Describe the lifecycle of an HTTP request from browser to database.", "expected_topics": ["DNS", "HTTP", "Server", "Database", "Response"]}
        ],
        "senior": [
            {"question": "How do you implement authentication across a decoupled full-stack application?", "expected_topics": ["JWT", "OAuth", "Cookies", "Stateless"]},
            {"question": "Explain your approach to designing a scalable API that serves a high-traffic web client.", "expected_topics": ["Caching", "Pagination", "Rate Limiting", "GraphQL"]}
        ]
    },
    "mobile": {
        "junior": [
            {"question": "What is the difference between native and cross-platform mobile development?", "expected_topics": ["iOS", "Android", "React Native", "Flutter", "Performance"]},
            {"question": "How do you securely store user credentials on a mobile device?", "expected_topics": ["Keychain", "Keystore", "Encryption", "Security"]}
        ],
        "senior": [
            {"question": "How do you manage complex background tasks and push notifications?", "expected_topics": ["Background Workers", "APNs", "FCM", "Battery Optimization"]},
            {"question": "Explain how you would profile and resolve a memory leak in a mobile app.", "expected_topics": ["Memory Management", "Instruments", "Garbage Collection", "Profiling"]}
        ]
    },
    "data": {
        "junior": [
            {"question": "What is the difference between supervised and unsupervised learning?", "expected_topics": ["Machine Learning", "Labels", "Clustering", "Classification"]},
            {"question": "How do you handle missing or corrupted data in a dataset?", "expected_topics": ["Imputation", "Dropping", "Pandas", "Cleaning"]}
        ],
        "senior": [
            {"question": "Explain how you would deploy a machine learning model to production.", "expected_topics": ["Docker", "API", "Inference", "Monitoring", "CI/CD"]},
            {"question": "How do you prevent overfitting in deep learning models?", "expected_topics": ["Regularization", "Dropout", "Cross-validation", "Data"]}
        ]
    },
    "devops": {
        "junior": [
            {"question": "What is the purpose of Docker and containerization?", "expected_topics": ["Docker", "Containers", "Isolation", "Environments"]},
            {"question": "Explain the concept of Continuous Integration and Continuous Deployment (CI/CD).", "expected_topics": ["CI/CD", "Pipelines", "Automation", "Git"]}
        ],
        "senior": [
            {"question": "How do you design a fault-tolerant and highly available infrastructure?", "expected_topics": ["Load Balancing", "Auto-scaling", "Multi-AZ", "Redundancy"]},
            {"question": "Explain your approach to monitoring and alerting for a distributed system.", "expected_topics": ["Prometheus", "Grafana", "Logs", "Metrics", "SLIs"]}
        ]
    }
}

@app.post("/agent/interview")
async def interview_agent(data: InterviewInput):
    try:
        role_lower = data.role.lower()
        
        # Intelligent role mapping based on common keywords
        role_mapping = {
            "frontend": ["frontend", "ui", "ux", "react", "vue", "angular", "web"],
            "backend": ["backend", "api", "node", "python", "java", "c#", "go", "ruby"],
            "fullstack": ["fullstack", "full stack"],
            "mobile": ["mobile", "android", "ios", "react native", "flutter", "swift", "kotlin"],
            "data": ["data", "machine learning", "ai", "scientist", "analyst", "sql", "pandas"],
            "devops": ["devops", "cloud", "aws", "gcp", "azure", "docker", "kubernetes", "sre"]
        }
        
        role_cat = "general"
        for cat, keywords in role_mapping.items():
            if any(kw in role_lower for kw in keywords):
                role_cat = cat
                break
                
        level_cat = "senior" if "senior" in data.experience_level.lower() or "lead" in data.experience_level.lower() else "junior"
        
        # If role_cat isn't in QUESTION_BANK (e.g., "mobile", "general"), tech_questions will default to []
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
        answer_lower = data.answer.lower()
        
        # 1. Compare user answer against expected_topics
        if data.expected_topics:
            matched_topics = [t for t in data.expected_topics if t.lower() in answer_lower]
            relevance = len(matched_topics) / len(data.expected_topics)
            display_topics = matched_topics
        else: # Legacy extraction fallback
            display_topics = extract_normalized_skills(data.answer)
            relevance = 1.0 if len(display_topics) >= 2 else (0.5 if len(display_topics) == 1 else 0.0)

        # 2. Rule-based relevance scoring thresholds
        if relevance >= 0.5 and word_count >= 15:
            score = "Pass (Strong)"
            topic_str = f" like: {', '.join(display_topics)}" if display_topics else ""
            feedback = f"Great answer! You provided good depth and properly referenced key concepts{topic_str}."
        elif relevance > 0.1 or word_count > 15:
            score = "Pass"
            feedback = "Acceptable, but try to expand your answer focusing on the core expected technical mechanisms."
        else:
            score = "Fail"
            feedback = "Answer is too short or lacks relevant substance for this question."
            
        return standard_response({
            "score": score, "feedback": feedback, "word_count": word_count, "matched_topics": display_topics, "relevance": relevance
        }, message="Response evaluated successfully")
    except Exception as e:
        return standard_response(success=False, message=str(e))

# --- 4. FraudDetectionAgent ---
@app.post("/agent/fraud-detection")
async def fraud_detection_agent(data: JobPostInput):
    try:
        content = (data.title + " " + data.description).lower()
        
        # High confidence phrases using regex patterns (Pattern, Display Label)
        critical_flags = [
            (r"pay upfront", "pay upfront"), (r"wire transfer", "wire transfer"), 
            (r"wire money", "wire money"), (r"no interview required", "no interview required"), 
            (r"easy money", "easy money"), (r"send crypto", "send crypto"), 
            (r"send bitcoin", "send bitcoin"), (r"pay out of pocket", "pay out of pocket"), 
            (r"western union", "western union")
        ]
        
        # Moderate warning flags using regex patterns to handle slight variations
        warning_flags = [
            (r"start(s)? immediately", "start immediately"),
            (r"unlimited earning(s)?", "unlimited earnings"),
            (r"(?:pay )?cash daily", "cash daily"),
            (r"direct message me|dm me", "direct message me")
        ]
        
        critical_found = [label for pat, label in critical_flags if re.search(pat, content)]
        warning_found = [label for pat, label in warning_flags if re.search(pat, content)]
        
        # Logic: 1 critical flag OR multiple warning flags indicates a scam
        is_fake = len(critical_found) > 0 or len(warning_found) >= 2
        
        all_flags = critical_found + warning_found
        
        return standard_response({
            "is_fake": is_fake,
            "reasoning": f"Suspicious phrases detected: {', '.join(all_flags)}." if is_fake else "Looks legitimate.",
            "flags_found": all_flags
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
