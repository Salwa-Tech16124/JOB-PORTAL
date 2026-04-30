import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SARVAM_API_KEY = process.env.SARVAM_API_KEY || "sk_xs5dbt92_YCfO5S7AF3b9DIQxznmH8tao";

const sarvam = new OpenAI({
  apiKey: SARVAM_API_KEY,
  baseURL: "https://api.sarvam.ai/v1"
});

/**
 * Screens a single candidate against a job posting using Sarvam AI.
 * Returns { suitable: bool, score: 0-100, reason: string, strengths: [], gaps: [] }
 */
export async function screenCandidate({ candidateProfile, jobTitle, jobDescription, jobSkills = [] }) {
  const candidateName = candidateProfile.name || 'Candidate';
  const candidateSkills = Array.isArray(candidateProfile.skills) ? candidateProfile.skills.join(', ') : 'Not specified';
  const candidateExperience = candidateProfile.experience || 'Not specified';
  const candidateBio = candidateProfile.bio || '';
  const candidateEducation = candidateProfile.education || 'Not specified';
  const requiredSkills = jobSkills.length ? jobSkills.join(', ') : 'See job description';

  const prompt = `You are a professional HR recruiter and AI screening agent. Evaluate the following candidate for the job opening.

JOB DETAILS:
- Title: ${jobTitle}
- Required Skills: ${requiredSkills}
- Description: ${jobDescription}

CANDIDATE PROFILE:
- Name: ${candidateName}
- Skills: ${candidateSkills}
- Experience: ${candidateExperience}
- Education: ${candidateEducation}
- Bio/Summary: ${candidateBio}

Your task:
1. Assess if this candidate is SUITABLE for this job (threshold: score >= 60)
2. Give an overall match score from 0 to 100
3. List up to 3 key STRENGTHS (short phrases)
4. List up to 3 key GAPS (short phrases)
5. Write a short 1-sentence reason for your decision

Respond ONLY with a valid JSON object in this exact format (no markdown, no extra text):
{
  "suitable": true,
  "score": 75,
  "reason": "Strong React and Node.js skills align well with the full stack role.",
  "strengths": ["Experienced with React", "Node.js backend knowledge", "3+ years experience"],
  "gaps": ["No Docker experience mentioned", "Missing cloud deployment skills"]
}`;

  try {
    const response = await sarvam.chat.completions.create({
      model: 'sarvam-m',
      messages: [
        { role: 'system', content: 'You are an expert HR recruiter and AI screening agent. Always respond with valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 400
    });

    const raw = response.choices[0]?.message?.content?.trim() || '';
    // Extract JSON from the response (remove markdown if present)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    
    const result = JSON.parse(jsonMatch[0]);
    return {
      suitable: Boolean(result.suitable),
      score: Number(result.score) || 0,
      reason: result.reason || 'AI screening completed.',
      strengths: Array.isArray(result.strengths) ? result.strengths : [],
      gaps: Array.isArray(result.gaps) ? result.gaps : [],
      aiPowered: true
    };
  } catch (err) {
    console.warn('⚠️ Sarvam AI screening failed, using rule-based fallback:', err.message);
    return ruleBasedScreen({ candidateProfile, jobSkills, jobTitle });
  }
}

/**
 * Fallback rule-based screening if AI is unavailable.
 */
function ruleBasedScreen({ candidateProfile, jobSkills, jobTitle }) {
  const candidateSkills = Array.isArray(candidateProfile.skills)
    ? candidateProfile.skills.map(s => s.toLowerCase())
    : [];

  let matchedSkills = 0;
  const strengths = [];
  const gaps = [];

  if (jobSkills.length > 0) {
    for (const skill of jobSkills) {
      if (candidateSkills.some(cs => cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs))) {
        matchedSkills++;
        strengths.push(`Has ${skill}`);
      } else {
        gaps.push(`Missing ${skill}`);
      }
    }
  }

  if (candidateProfile.experience) strengths.push('Has experience listed');
  if (candidateProfile.bio) strengths.push('Has a profile summary');
  if (candidateSkills.length >= 3) strengths.push(`${candidateSkills.length} skills on profile`);

  const baseScore = jobSkills.length > 0
    ? Math.round((matchedSkills / jobSkills.length) * 100)
    : (candidateSkills.length >= 2 ? 60 : 30);

  const score = Math.min(100, baseScore + (candidateProfile.experience ? 10 : 0));
  const suitable = score >= 55;

  return {
    suitable,
    score,
    reason: suitable
      ? `Candidate matches ${matchedSkills} of ${jobSkills.length} required skills for ${jobTitle}.`
      : `Candidate only matches ${matchedSkills} of ${jobSkills.length} required skills.`,
    strengths: strengths.slice(0, 3),
    gaps: gaps.slice(0, 3),
    aiPowered: false
  };
}
