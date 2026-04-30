import React, { useState } from 'react';
import { Mic, BrainCircuit, PlayCircle, Loader2, Award, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { api } from '../api';
import { useToast } from '../context/ToastContext';

function Interview() {
  const toast = useToast();
  const [role, setRole] = useState('');
  const [level, setLevel] = useState('beginner');
  const [questions, setQuestions] = useState([]);
  const [commonQuestions, setCommonQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  const startInterview = async (e) => {
    e.preventDefault();
    if (!role.trim()) {
      toast.warning('Please enter a role', 'Missing Input');
      return;
    }
    
    setLoading(true);
    setResult(null);
    setAnswers({});
    
    try {
      const res = await api.getInterview(role, level);
      if (res.success && res.data && res.data.questions) {
        setQuestions(res.data.questions);
        setCommonQuestions(res.data.commonQuestions || []);
        toast.success('Mock interview generated!', 'Ready');
      } else {
        toast.error('Failed to generate interview', 'Error');
      }
    } catch (err) {
      toast.error('Server error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const submitTest = async () => {
    // Check if all questions answered
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      toast.warning('Please answer all questions before submitting', 'Incomplete');
      return;
    }

    setEvaluating(true);
    try {
      const res = await api.evaluateInterview(role, level, questions, answers);
      if (res.success && res.data) {
        setResult(res.data);
        toast.success('Test evaluated successfully!', 'Done');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        toast.error('Failed to evaluate test', 'Error');
      }
    } catch (err) {
      toast.error('Server error', 'Error');
    } finally {
      setEvaluating(false);
    }
  };

  const restart = () => {
    setQuestions([]);
    setResult(null);
    setAnswers({});
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8 flex items-center">
         <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mr-4">
            <Mic className="w-6 h-6 text-primary" />
         </div>
         <div>
            <h2 className="text-3xl font-bold text-foreground">Interview Simulator</h2>
            <p className="text-muted-foreground mt-1">Live virtual written test with AI Interviewer.</p>
         </div>
      </div>

      {!questions.length && !result ? (
        <Card className="p-8 text-center bg-background/50 backdrop-blur-xl border-dashed">
           <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <BrainCircuit className="w-12 h-12 text-primary" />
           </div>
           
           <h3 className="text-2xl font-bold text-foreground mb-2">Configure Your Interview</h3>
           <p className="text-muted-foreground/80 mb-8 max-w-md mx-auto text-[15px] leading-relaxed">Input your target role and seniority. The AI will generate custom behavioral, technical, and multiple-choice questions for you to answer.</p>
           
           <form onSubmit={startInterview} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-4">
              <Input 
                required 
                placeholder="Role (e.g. Full Stack Developer)" 
                value={role} 
                onChange={e => setRole(e.target.value)} 
                className="flex-1 min-w-[200px]"
              />
              <select 
                value={level} 
                onChange={e => setLevel(e.target.value)} 
                className="flex h-11 min-w-[150px] rounded-xl border border-input/50 bg-background/50 px-3 py-2 text-[15px] shadow-sm backdrop-blur-sm transition-all focus-visible:ring-ring focus-visible:ring-[3px] outline-none hover:bg-background/80 cursor-pointer"
              >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="hard">Hard</option>
              </select>
              <Button 
                type="submit" 
                disabled={loading} 
                className="font-bold shadow-xl shadow-primary/20"
                size="lg"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><PlayCircle className="w-5 h-5 mr-2" /> Start Test</>}
              </Button>
           </form>
        </Card>
      ) : result ? (
        <div className="space-y-6">
          {/* Scoreboard */}
          <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <CardContent className="p-8 text-center">
              <Award className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-4xl font-extrabold mb-2 text-foreground">{result.score}/100</h2>
              <p className="text-xl font-medium text-muted-foreground mb-4">Overall Score</p>
              <p className="max-w-2xl mx-auto text-foreground/90 leading-relaxed">{result.overallSummary}</p>
            </CardContent>
          </Card>

          {/* Common Questions */}
          {commonQuestions.length > 0 && (
            <Card className="border-dashed bg-muted/30">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center text-foreground">
                  <Zap className="w-5 h-5 mr-2 text-amber-500" />
                  Top Commonly Asked Questions for {role}
                </h3>
                <ul className="space-y-2">
                  {commonQuestions.map((q, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-primary font-bold mr-2 mt-0.5">•</span>
                      <span className="text-muted-foreground">{q}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Detailed Feedback */}
          <h3 className="text-2xl font-bold mt-8 mb-4">Detailed Feedback</h3>
          {questions.map((q, idx) => {
            const fb = result.feedbacks[q.id] || result.feedbacks[String(q.id)];
            const isCorrect = fb?.score?.toLowerCase().includes('correct') && !fb?.score?.toLowerCase().includes('incorrect');
            const isGood = fb?.score?.toLowerCase().includes('good') || fb?.score?.toLowerCase().includes('excellent');
            
            return (
              <Card key={idx} className="hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold mr-3 mt-1 flex-shrink-0">
                      {idx+1}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-foreground leading-snug">{q.question}</h4>
                      <p className="text-sm text-muted-foreground mt-2 font-medium">Your Answer: {answers[q.id]}</p>
                    </div>
                  </div>
                  <Alert variant={isCorrect || isGood ? 'default' : 'destructive'} className="ml-11 border-2 bg-background">
                    {isCorrect || isGood ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5" />}
                    <AlertTitle className="text-md font-bold mb-1 tracking-tight">Grade: {fb?.score || 'N/A'}</AlertTitle>
                    <AlertDescription className="text-sm leading-relaxed font-medium">
                      {fb?.feedback || 'No specific feedback provided.'}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )
          })}
          
          <div className="flex justify-center pt-6">
            <Button onClick={restart} size="lg" className="px-8 shadow-xl">
              Take Another Mock Test
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-center justify-between">
              <div>
                <h3 className="font-bold text-foreground">Virtual Written Test</h3>
                <p className="text-sm text-muted-foreground">Role: <span className="text-primary font-medium">{role}</span> | Level: <span className="capitalize text-primary font-medium">{level}</span></p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{Object.keys(answers).length} / {questions.length}</p>
                <p className="text-xs text-muted-foreground">Answered</p>
              </div>
            </div>

            {questions.map((q, idx) => (
               <Card key={idx} className="hover:shadow-xl transition-all duration-300 glass-card">
                  <CardContent className="p-6 md:p-8">
                    {/* Question Header */}
                    <div className="flex items-start mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold mr-4 flex-shrink-0 mt-1 shadow-sm">
                        {idx+1}
                      </div>
                      <div className="w-full">
                         <h4 className="text-xl font-bold text-foreground leading-snug mb-2">{q.question}</h4>
                         {q.type === 'descriptive' && (
                           <p className="text-xs text-muted-foreground font-medium flex items-center mb-4">
                             <Zap className="w-3 h-3 mr-1 text-primary/80" /> Topics: {q.expected_topics?.join(', ')}
                           </p>
                         )}
                         
                         {q.type === 'mcq' ? (
                           <div className="space-y-3 mt-4">
                             {q.options?.map((opt, oIdx) => (
                               <label key={oIdx} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${answers[q.id] === opt ? 'bg-primary/10 border-primary' : 'bg-background hover:bg-muted'}`}>
                                 <input 
                                   type="radio" 
                                   name={`q-${q.id}`} 
                                   value={opt} 
                                   checked={answers[q.id] === opt}
                                   onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                   className="w-4 h-4 text-primary bg-background border-input"
                                 />
                                 <span className="ml-3 text-[15px] font-medium">{opt}</span>
                               </label>
                             ))}
                           </div>
                         ) : (
                           <Textarea 
                             rows="5" 
                             placeholder="Type your detailed answer here..." 
                             value={answers[q.id] || ''} 
                             onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))} 
                             className="bg-muted/20 border-white/10 resize-y text-[16px] p-5 shadow-inner mt-2"
                           />
                         )}
                      </div>
                    </div>
                  </CardContent>
               </Card>
            ))}
            
            <div className="flex justify-center pt-6 gap-4">
              <Button onClick={restart} variant="secondary" size="lg" className="px-8 shadow-md">
                Cancel Test
              </Button>
              <Button 
                onClick={submitTest} 
                disabled={evaluating || Object.keys(answers).length < questions.length}
                size="lg" 
                className="px-8 shadow-xl bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {evaluating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Award className="w-5 h-5 mr-2" />}
                Submit & Get Score
              </Button>
            </div>
        </div>
      )}
    </div>
  );
}

export default Interview;
