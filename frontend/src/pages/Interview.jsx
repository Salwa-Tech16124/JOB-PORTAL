import React, { useState } from 'react';
import { Mic, BrainCircuit, PlayCircle, Loader2, Award, Zap } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';

// Mock Interview Questions
const MOCK_INTERVIEW_QUESTIONS = {
  junior: [
    {
      question: 'Tell me about a time when you had to debug a complex problem. How did you approach it?',
      expected_topics: ['Problem-solving', 'Debugging', 'Persistence']
    },
    {
      question: 'Describe your experience with version control. How do you handle merge conflicts?',
      expected_topics: ['Git', 'Version Control', 'Collaboration']
    },
    {
      question: 'What is the most challenging project you\'ve worked on and what did you learn?',
      expected_topics: ['Learning', 'Challenges', 'Growth']
    }
  ],
  senior: [
    {
      question: 'How do you approach system design for a large-scale application?',
      expected_topics: ['Architecture', 'Scalability', 'Design Patterns']
    },
    {
      question: 'Tell me about a time you had to lead a technical team through a major refactor.',
      expected_topics: ['Leadership', 'Communication', 'Technical Excellence']
    },
    {
      question: 'How do you balance technical debt with feature development?',
      expected_topics: ['Management', 'Decision Making', 'Strategy']
    }
  ]
};

function Interview() {
  const [role, setRole] = useState('');
  const [level, setLevel] = useState('junior');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchQuestions = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get questions for selected level
    const selectedQuestions = MOCK_INTERVIEW_QUESTIONS[level] || MOCK_INTERVIEW_QUESTIONS.junior;
    setQuestions(selectedQuestions);
    
    setLoading(false);
  };

  const evaluateAnswer = async (index, question, answer) => {
    if (!answer) return alert("Please type an answer first.");
    
    // Set a local loading state for evaluating this specific question
    setFeedbacks(prev => ({ ...prev, [index]: { ...prev[index], loading: true } }));
    
    // Simulate API evaluation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock feedback
    const scoreOptions = ['Excellent', 'Good', 'Average', 'Needs Improvement'];
    const randomScore = scoreOptions[Math.floor(Math.random() * scoreOptions.length)];
    const mockFeedback = `Great answer! You covered the key points well. Focus on providing specific examples and metrics when explaining your approach.`;
    
    setFeedbacks(prev => ({ 
      ...prev, 
      [index]: { 
        score: randomScore,
        feedback: mockFeedback,
        loading: false
      } 
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center">
         <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mr-4">
            <Mic className="w-6 h-6 text-primary" />
         </div>
         <div>
            <h2 className="text-3xl font-bold text-foreground">Interview Simulator</h2>
            <p className="text-muted-foreground mt-1">Live Q&A practice with an AI Technical Interviewer.</p>
         </div>
      </div>

      {!questions.length ? (
        <Card className="p-8 text-center bg-background/50 backdrop-blur-xl border-dashed">
           <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <BrainCircuit className="w-12 h-12 text-primary" />
           </div>
           
           <h3 className="text-2xl font-bold text-foreground mb-2">Configure Your Interview</h3>
           <p className="text-muted-foreground/80 mb-8 max-w-md mx-auto text-[15px] leading-relaxed">Input your target role and seniority. The AI will generate custom behavioral and technical questions for you to answer.</p>
           
           <form onSubmit={fetchQuestions} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-4">
              <Input 
                required 
                placeholder="Role (e.g. Backend)" 
                value={role} 
                onChange={e => setRole(e.target.value)} 
                className="flex-1 min-w-[200px]"
              />
              <select 
                value={level} 
                onChange={e => setLevel(e.target.value)} 
                className="flex h-11 min-w-[150px] rounded-xl border border-input/50 bg-background/50 px-3 py-2 text-[15px] shadow-sm backdrop-blur-sm transition-all focus-visible:ring-ring focus-visible:ring-[3px] outline-none hover:bg-background/80 cursor-pointer"
              >
                  <option value="junior">Junior Level</option>
                  <option value="senior">Senior Level</option>
              </select>
              <Button 
                type="submit" 
                disabled={loading} 
                className="font-bold shadow-xl shadow-primary/20"
                size="lg"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><PlayCircle className="w-5 h-5 mr-2" /> Start</>}
              </Button>
           </form>
        </Card>
      ) : (
        <div className="space-y-8">
            {questions.map((q, idx) => (
               <Card key={idx} className="hover:shadow-xl transition-all duration-300 glass-card animate-in slide-in-from-bottom-2">
                  <CardContent className="p-6 md:p-8">
                    {/* Question Header */}
                    <div className="flex items-start mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold mr-4 flex-shrink-0 mt-1 shadow-sm">
                        {idx+1}
                      </div>
                      <div>
                         <h4 className="text-xl font-bold text-foreground leading-snug">{q.question}</h4>
                         <p className="text-sm text-muted-foreground mt-2 font-medium flex items-center">
                           <Zap className="w-4 h-4 mr-1 text-primary/80" /> Focus: {q.expected_topics.join(', ')}
                         </p>
                      </div>
                    </div>
                    
                    {/* Textarea */}
                    <div className="ml-14">
                      <Textarea 
                        rows="4" 
                        placeholder="Type your answer here exactly as you would speak it..." 
                        value={answers[idx] || ''} 
                        onChange={e => setAnswers(prev => ({ ...prev, [idx]: e.target.value }))} 
                        className="mb-5 bg-muted/20 border-white/10 resize-y text-[16px] p-5 shadow-inner"
                      />
                      
                      <Button 
                        onClick={() => evaluateAnswer(idx, q.question, answers[idx])} 
                        disabled={feedbacks[idx]?.loading}
                        className="bg-emerald-600/90 text-white hover:bg-emerald-600 shadow-emerald-600/20 shadow-lg border border-emerald-500/50"
                      >
                        {feedbacks[idx]?.loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Grade My Answer'}
                      </Button>
                      
                      {/* Feedback Ribbon */}
                      {feedbacks[idx] && feedbacks[idx].score && (
                          <Alert variant={feedbacks[idx].score.includes('Needs Improvement') ? 'destructive' : 'default'} className="mt-8 border-2 animate-in slide-in-from-top-2 duration-500 backdrop-blur-md bg-background/80">
                              <Award className="w-5 h-5 flex-shrink-0" />
                              <AlertTitle className="text-lg font-bold mb-2 tracking-tight">Grade: {feedbacks[idx].score}</AlertTitle>
                              <AlertDescription className="text-[15px] leading-relaxed font-medium">
                                {feedbacks[idx].feedback}
                              </AlertDescription>
                          </Alert>
                      )}
                    </div>
                  </CardContent>
               </Card>
            ))}
            
            <div className="flex justify-center pt-6">
              <Button onClick={() => setQuestions([])} variant="secondary" size="lg" className="px-8 shadow-xl">
                End Interview & Restart
              </Button>
            </div>
        </div>
      )}
    </div>
  );
}

export default Interview;
