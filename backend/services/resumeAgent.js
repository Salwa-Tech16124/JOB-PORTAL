/**
 * resumeAgent.js
 *
 * Sarvam AI-powered agent for resume analysis, improvement suggestions,
 * and auto-fix content generation.
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const SARVAM_API_KEY = process.env.SARVAM_API_KEY || 'sk_xs5dbt92_YCfO5S7AF3b9DIQxznmH8tao';
const openai = new OpenAI({
  apiKey: SARVAM_API_KEY,
  baseURL: 'https://api.sarvam.ai/v1'
});

/**
 * Calls Sarvam AI with a system + user prompt and returns the raw text response.
 */
async function callSarvam(systemPrompt, userPrompt) {
  const completion = await openai.chat.completions.create({
    model: 'sarvam-105b',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]
  });
  return completion.choices[0].message.content;
}

/**
 * Safely extracts JSON from a string that may have markdown code fences.
 */
function parseJson(raw) {
  // Strip markdown code block wrappers if present
  const stripped = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
  const match = stripped.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON object found in AI response');
  return JSON.parse(match[0]);
}

// ─────────────────────────────────────────────
// 1. ANALYZE RESUME
// ─────────────────────────────────────────────
export const analyzeResumeWithAI = async (resumeText, fileName, fileType, profileRole, profileSkills) => {
  const systemPrompt = `You are a world-class resume analyst and career expert. 
Analyze the resume text provided and return a single JSON object with EXACTLY this schema — no extra fields, no markdown, no explanation:

{
  "extractedSkills": ["skill1", "skill2"],
  "extractedExperience": "concise summary of experience",
  "extractedEducation": "education details",
  "extractedSummary": "professional summary found in the resume",
  "summaryStrength": "Strong summary",
  "missingSections": ["Education"],
  "skillGaps": ["skill1", "skill2"],
  "score": 72
}

Rules:
- summaryStrength must be one of: "Strong summary", "Good summary", "Weak summary", "Missing summary"
- missingSections lists which of [Summary, Experience, Skills, Education] are absent or very weak
- skillGaps are important skills for the target role that are NOT in the resume
- score is 0-100 based on completeness, clarity, and skills match
- Return ONLY valid JSON. No markdown. No code fences.`;

  const userPrompt = `Resume Text (first 4000 chars):
${resumeText.slice(0, 4000)}

Target Role: ${profileRole || 'Software Professional'}
Profile Skills: ${(profileSkills || []).join(', ') || 'None specified'}

Analyze and return the JSON.`;

  try {
    console.log('🤖 [ResumeAgent] Calling Sarvam AI for resume analysis...');
    const raw = await callSarvam(systemPrompt, userPrompt);
    console.log('✅ [ResumeAgent] Analysis response received.');
    const parsed = parseJson(raw);
    return {
      fileName,
      fileType,
      extractedSkills: Array.isArray(parsed.extractedSkills) ? parsed.extractedSkills : [],
      extractedExperience: parsed.extractedExperience || '',
      extractedEducation: parsed.extractedEducation || '',
      extractedSummary: parsed.extractedSummary || '',
      summaryStrength: parsed.summaryStrength || 'Missing summary',
      missingSections: Array.isArray(parsed.missingSections) ? parsed.missingSections : [],
      skillGaps: Array.isArray(parsed.skillGaps) ? parsed.skillGaps : [],
      idealStructure: ['Summary', 'Experience', 'Skills', 'Education'],
      score: typeof parsed.score === 'number' ? parsed.score : 50,
      notes: [
        'Resume analyzed by Sarvam AI — intelligent insights tailored to your profile and target role.',
        'Skill gaps reflect what the target role typically requires beyond your current skillset.'
      ],
      aiPowered: true
    };
  } catch (err) {
    console.error('❌ [ResumeAgent] Sarvam analysis failed:', err.message);
    throw err;
  }
};

// ─────────────────────────────────────────────
// 2. GET SUGGESTIONS
// ─────────────────────────────────────────────
export const getSuggestionsWithAI = async (profile, analysis) => {
  const systemPrompt = `You are an expert career coach and resume consultant.
Generate specific, actionable improvement suggestions for this professional's resume and profile.
Return a single JSON object with EXACTLY this schema — no markdown, no code fences:

{
  "whatToImprove": ["specific actionable suggestion 1", "suggestion 2"],
  "whatToAdd": ["specific section or content to add 1", "content 2"],
  "betterSummary": "A rewritten, compelling professional summary (2-3 sentences)",
  "recommendedSkills": ["skill1", "skill2"],
  "recommendedSections": ["section1"]
}

- whatToImprove: 3-5 specific things to fix or rewrite
- whatToAdd: 2-4 specific sections or content pieces to add
- betterSummary: a concrete rewrite that is strong, quantified, and role-specific
- recommendedSkills: top 4-6 skills they should add based on their role and gaps
- recommendedSections: which resume sections are missing
- Return ONLY valid JSON. No markdown.`;

  const userPrompt = `Professional Profile:
- Name: ${profile.name || 'Not provided'}
- Target Role: ${profile.role || 'Professional'}
- Skills: ${(profile.skills || []).join(', ') || 'None listed'}
- Experience: ${profile.experience || 'Not provided'}
- Education: ${profile.education || 'Not provided'}
- Bio: ${profile.bio || 'Not provided'}

Resume Analysis Results:
- Extracted Skills: ${(analysis.extractedSkills || []).join(', ') || 'None detected'}
- Missing Sections: ${(analysis.missingSections || []).join(', ') || 'None'}
- Summary Strength: ${analysis.summaryStrength || 'Unknown'}
- Skill Gaps: ${(analysis.skillGaps || []).join(', ') || 'None'}
- Resume Score: ${analysis.score || 0}/100

Generate specific, role-tailored improvement suggestions.`;

  try {
    console.log('🤖 [ResumeAgent] Calling Sarvam AI for suggestions...');
    const raw = await callSarvam(systemPrompt, userPrompt);
    console.log('✅ [ResumeAgent] Suggestions received.');
    const parsed = parseJson(raw);
    return {
      whatToImprove: Array.isArray(parsed.whatToImprove) ? parsed.whatToImprove : [],
      whatToAdd: Array.isArray(parsed.whatToAdd) ? parsed.whatToAdd : [],
      betterSummary: parsed.betterSummary || '',
      recommendedSkills: Array.isArray(parsed.recommendedSkills) ? parsed.recommendedSkills : [],
      recommendedSections: Array.isArray(parsed.recommendedSections) ? parsed.recommendedSections : [],
      aiPowered: true
    };
  } catch (err) {
    console.error('❌ [ResumeAgent] Sarvam suggestions failed:', err.message);
    throw err;
  }
};

// ─────────────────────────────────────────────
// 3. IMPROVE RESUME (AUTO-FIX)
// ─────────────────────────────────────────────
export const improveResumeWithAI = async (profile, analysis) => {
  const systemPrompt = `You are a professional resume writer with 10+ years of experience.
Rewrite and improve the user's resume content to be impactful, specific, and ATS-optimized.
Return a single JSON object with EXACTLY this schema — no markdown, no code fences:

{
  "improvedSummary": "rewritten professional summary (2-4 sentences, quantified, role-specific)",
  "improvedExperience": "rewritten experience section with action verbs and metrics",
  "improvedEducation": "formatted education section",
  "addedSkills": ["suggested skill to add 1", "skill 2"],
  "comment": "brief explanation of key improvements made"
}

Rules:
- improvedSummary must be specific to the user's role and skills, not generic
- improvedExperience must start with strong action verbs and include impact/metrics where possible
- addedSkills must be relevant to the target role and not already in their profile
- Return ONLY valid JSON. No markdown.`;

  const userPrompt = `Current Profile:
- Name: ${profile.name || 'Professional'}
- Target Role: ${profile.role || 'Software Professional'}
- Current Skills: ${(profile.skills || []).join(', ') || 'None listed'}
- Current Experience: ${profile.experience || 'Not specified'}
- Current Education: ${profile.education || 'Not specified'}
- Bio/Summary: ${profile.bio || 'Not specified'}

Resume Analysis:
- Missing Sections: ${(analysis.missingSections || []).join(', ') || 'None'}
- Skill Gaps: ${(analysis.skillGaps || []).join(', ') || 'None'}
- Summary Strength: ${analysis.summaryStrength || 'Unknown'}
- Extracted Skills: ${(analysis.extractedSkills || []).join(', ') || 'None detected'}
- Score: ${analysis.score || 0}/100

Rewrite all sections professionally and return the improved JSON.`;

  try {
    console.log('🤖 [ResumeAgent] Calling Sarvam AI for auto-improvement...');
    const raw = await callSarvam(systemPrompt, userPrompt);
    console.log('✅ [ResumeAgent] Improvement content received.');
    const parsed = parseJson(raw);
    return {
      improvedSummary: parsed.improvedSummary || '',
      improvedExperience: parsed.improvedExperience || '',
      improvedEducation: parsed.improvedEducation || '',
      addedSkills: Array.isArray(parsed.addedSkills) ? parsed.addedSkills : [],
      comment: parsed.comment || 'Resume improved by Sarvam AI.',
      aiPowered: true
    };
  } catch (err) {
    console.error('❌ [ResumeAgent] Sarvam improvement failed:', err.message);
    throw err;
  }
};
