import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const SARVAM_API_KEY = process.env.SARVAM_API_KEY || "sk_xs5dbt92_YCfO5S7AF3b9DIQxznmH8tao";
let openai = null;

try {
  openai = new OpenAI({ 
      apiKey: SARVAM_API_KEY,
      baseURL: "https://api.sarvam.ai/v1"
  });
} catch (error) {
  console.error('❌ Failed to initialize Sarvam AI API for Interview Agent:', error.message);
}

const callSarvam = async (systemPrompt, userPrompt) => {
  if (!openai) throw new Error('Sarvam API not configured');
  
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    model: "sarvam-105b",
    temperature: 0.3
  });
  
  let text = completion.choices[0].message.content;
  // Clean potential markdown blocks
  text = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(text);
};

export const generateInterview = async (role, level) => {
  const systemPrompt = `You are an expert technical interviewer and recruiter. Output ONLY valid JSON, without any markdown formatting or extra text.`;
  const userPrompt = `Generate a mock interview test for a ${level} level ${role}.
Include exactly 3 multiple-choice questions (mcq) and 2 descriptive questions.
Also provide 5 of the most commonly asked interview questions for this specific role.

JSON Format Requirements:
{
  "questions": [
    { 
      "id": 1, 
      "type": "mcq", 
      "question": "question text", 
      "options": ["A) opt1", "B) opt2", "C) opt3", "D) opt4"] 
    },
    { 
      "id": 2, 
      "type": "descriptive", 
      "question": "question text", 
      "expected_topics": ["topic1", "topic2"] 
    }
  ],
  "commonQuestions": ["Q1", "Q2", "Q3", "Q4", "Q5"]
}`;

  try {
    return await callSarvam(systemPrompt, userPrompt);
  } catch (err) {
    console.error('Sarvam generateInterview error:', err);
    throw new Error('Failed to generate interview from AI');
  }
};

export const evaluateInterview = async (role, level, questions, answers) => {
  const systemPrompt = `You are an expert technical interviewer evaluating a candidate's test. Output ONLY valid JSON, without any markdown formatting or extra text.`;
  
  const payload = JSON.stringify({ questions, answers });
  
  const userPrompt = `Evaluate this completed mock interview for a ${level} ${role}.
Here is the test data:
${payload}

Provide an overall score out of 100.
Provide feedback for each question by ID.
For MCQs, state if it was correct and what the correct answer is.
For descriptive, evaluate based on expected topics and depth.

JSON Format Requirements:
{
  "score": 85,
  "feedbacks": {
    "1": { "score": "Correct/Incorrect/Good/Needs Improvement", "feedback": "Detailed feedback..." },
    "2": { "score": "Good", "feedback": "..." }
  },
  "overallSummary": "A brief summary of their performance."
}`;

  try {
    return await callSarvam(systemPrompt, userPrompt);
  } catch (err) {
    console.error('Sarvam evaluateInterview error:', err);
    throw new Error('Failed to evaluate interview from AI');
  }
};
