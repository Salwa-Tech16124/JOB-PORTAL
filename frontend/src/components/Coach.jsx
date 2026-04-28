import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Lightbulb, MessageSquare, Trash2, Loader2, Copy, Check, MapPin, CheckCircle2, BookOpen, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

// Course Recommendations Database
const COURSE_DATABASE = {
  'React': [
    { title: 'React: The Complete Guide', platform: 'Udemy', level: 'Intermediate', duration: '31 hours', rating: 4.8 },
    { title: 'Advanced React Patterns', platform: 'Frontend Masters', level: 'Advanced', duration: '7 hours', rating: 4.9 },
    { title: 'React Performance Optimization', platform: 'Egghead', level: 'Advanced', duration: '4 hours', rating: 4.7 }
  ],
  'TypeScript': [
    { title: 'TypeScript Fundamentals', platform: 'Egghead', level: 'Beginner', duration: '5 hours', rating: 4.8 },
    { title: 'Advanced TypeScript', platform: 'Frontend Masters', level: 'Advanced', duration: '8 hours', rating: 4.9 },
    { title: 'TypeScript for Scale', platform: 'Udemy', level: 'Advanced', duration: '12 hours', rating: 4.7 }
  ],
  'Node.js': [
    { title: 'The Complete Node.js Developer', platform: 'Udemy', level: 'Intermediate', duration: '18 hours', rating: 4.8 },
    { title: 'Node.js Advanced Patterns', platform: 'Frontend Masters', level: 'Advanced', duration: '6 hours', rating: 4.9 }
  ],
  'Python': [
    { title: 'Complete Python Bootcamp', platform: 'Udemy', level: 'Beginner', duration: '22 hours', rating: 4.8 },
    { title: 'Advanced Python', platform: 'Coursera', level: 'Advanced', duration: '30 hours', rating: 4.6 }
  ],
  'AWS': [
    { title: 'AWS Solutions Architect', platform: 'Udemy', level: 'Intermediate', duration: '16 hours', rating: 4.7 },
    { title: 'AWS Advanced Architect', platform: 'A Cloud Guru', level: 'Advanced', duration: '20 hours', rating: 4.8 }
  ],
  'DevOps': [
    { title: 'DevOps Bootcamp', platform: 'Udemy', level: 'Intermediate', duration: '15 hours', rating: 4.7 },
    { title: 'Advanced DevOps', platform: 'Linux Academy', level: 'Advanced', duration: '18 hours', rating: 4.8 }
  ],
  'Docker': [
    { title: 'Docker & Kubernetes', platform: 'Udemy', level: 'Intermediate', duration: '12 hours', rating: 4.8 },
    { title: 'Docker Mastery', platform: 'Udemy', level: 'Intermediate', duration: '9 hours', rating: 4.7 }
  ]
};

// Career Roadmap Phases
const CAREER_ROADMAP = [
  {
    id: 1,
    phase: 'Foundation Phase',
    duration: '0-6 months',
    description: 'Build core fundamentals and master essential skills',
    tasks: [
      'Master core language/framework basics',
      'Complete 5-10 small projects',
      'Learn version control and Git workflows',
      'Understand web fundamentals'
    ]
  },
  {
    id: 2,
    phase: 'Intermediate Phase',
    duration: '6-12 months',
    description: 'Deepen expertise and start contributing to real projects',
    tasks: [
      'Contribute to open-source projects',
      'Learn system design fundamentals',
      'Build 2-3 medium projects from scratch',
      'Start mentoring others'
    ]
  },
  {
    id: 3,
    phase: 'Advanced Phase',
    duration: '12-24 months',
    description: 'Specialize and take on leadership responsibilities',
    tasks: [
      'Master advanced patterns and optimization',
      'Lead technical initiatives',
      'Become an expert in your niche',
      'Publish articles/speak at conferences'
    ]
  },
  {
    id: 4,
    phase: 'Expert Phase',
    duration: '24+ months',
    description: 'Industry leadership and strategic growth',
    tasks: [
      'Build personal brand',
      'Lead architecture decisions',
      'Mentor teams and juniors',
      'Explore leadership roles'
    ]
  }
];

function CareerCoach() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('coach'); // 'coach' or 'roadmap'
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hi! 👋 I\'m your AI Career Coach powered by Google Gemini. I\'m here to help you with personalized career advice, interview prep, skill development, and more. What would you like to discuss today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [careerProgress, setCareerProgress] = useState({});
  const [userData, setUserData] = useState({});
  const messagesEndRef = useRef(null);

  // Load user data and progress
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const progress = JSON.parse(localStorage.getItem('careerProgress') || '{}');
    setUserData(user);
    setCareerProgress(progress);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get AI response from Gemini API with enhanced logging
  const getAIResponse = async (userMessage) => {
    try {
      // Prepare user context - enhanced
      const userContext = {
        name: userData.name || 'Guest User',
        skills: Array.isArray(userData.skills) ? userData.skills : [],
        experience: userData.experience || 'Not specified',
        goal: userData.bio || userData.goal || 'Not specified'
      };

      console.log('\n' + '='.repeat(80));
      console.log('🚀 FRONTEND: SENDING TO AI COACH');
      console.log('='.repeat(80));
      console.log('📩 USER MESSAGE:', userMessage);
      console.log('👤 USER CONTEXT:', userContext);
      console.log('⏰ Timestamp:', new Date().toISOString());
      console.log('='.repeat(80));

      // Call backend endpoint
      const response = await fetch('http://localhost:5000/api/coach/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          userContext
        })
      });

      const data = await response.json();

      console.log('\n' + '='.repeat(80));
      console.log('📥 FRONTEND: RESPONSE FROM BACKEND');
      console.log('='.repeat(80));
      console.log('🎯 INTENT:', data.data?.intent);
      console.log('✅ SUCCESS:', data.success);
      console.log('📊 RESPONSE LENGTH:', data.data?.message?.length || 'N/A');
      console.log('📝 RESPONSE PREVIEW:', data.data?.message?.substring(0, 200) + '...');
      console.log('='.repeat(80) + '\n');

      if (data.success && data.data?.message) {
        return {
          success: true,
          content: data.data.message,
          intent: data.data?.intent || 'general'
        };
      } else {
        // Use fallback response from API
        console.warn('⚠️ USING FALLBACK RESPONSE');
        return {
          success: true,
          content: data.data?.message || 'Let me help you with that. Please try rephrasing your question or contact support if the issue persists.',
          isFallback: true,
          intent: 'fallback'
        };
      }
    } catch (error) {
      console.error('\n❌ FRONTEND ERROR calling AI Coach:', error);
      console.error('Error Details:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      // Fallback responses for network errors
      const fallbackResponses = [
        "I'm having trouble connecting to my AI service right now. However, to give you the best guidance, could you specify:\n\n• Which role interests you? (QA, Frontend, Backend, AI Engineer, etc.)\n• What's your current experience level?\n\nOnce you provide these details, I'll give you a detailed, non-generic roadmap!",
        "I apologize for the technical difficulty. To help you better, please clarify:\n\n• Are you looking for a career roadmap, skill recommendations, or interview prep?\n• Which specific role or area are you targeting?\n\nThis will help me give you the detailed, structured guidance you need!",
        "Experiencing a temporary connection issue! In the meantime, to get the best help when I'm back:\n\n• Be specific about your role/goal\n• Mention your current skills\n• Ask about roadmaps, skills, or interview prep\n\nI'll provide detailed, role-specific guidance, never generic advice!"
      ];
      
      
      return {
        success: false,
        content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
        isFallback: true
      };
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) {
      toast.warning('Please type a message', 'Empty Message');
      return;
    }

    console.log('\n🔹 USER SENT MESSAGE:', inputValue);

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const result = await getAIResponse(inputValue);
      
      console.log('🔹 AI COACH RECEIVED RESPONSE:');
      console.log('   Intent:', result.intent);
      console.log('   Length:', result.content?.length);
      console.log('   Fallback:', result.isFallback);
      console.log('   Preview:', result.content?.substring(0, 150) + '...');

      const aiMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: result.content,
        timestamp: new Date(),
        isFallback: result.isFallback,
        intent: result.intent
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (result.success || result.isFallback) {
        console.log('✅ MESSAGE DISPLAYED IN CHAT');
        toast.success(
          result.isFallback ? 'Using fallback response' : 'AI response generated!',
          'Got It'
        );
      }
    } catch (error) {
      console.error('💥 FRONTEND SEND ERROR:', error);
      toast.error('Failed to get AI response', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (id, content) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.info('Copied to clipboard', 'Copy');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 1,
        type: 'ai',
        content: 'Hi! 👋 I\'m your AI Career Coach powered by Google Gemini. I\'m here to help you with personalized career advice, interview prep, skill development, and more. What would you like to discuss today?',
        timestamp: new Date()
      }
    ]);
    toast.info('Conversation cleared', 'Reset');
  };

  // Toggle phase completion
  const togglePhaseCompletion = (phaseId) => {
    const updatedProgress = {
      ...careerProgress,
      [`phase${phaseId}`]: !careerProgress[`phase${phaseId}`]
    };
    setCareerProgress(updatedProgress);
    localStorage.setItem('careerProgress', JSON.stringify(updatedProgress));
    toast.success(
      updatedProgress[`phase${phaseId}`] ? 'Phase marked complete!' : 'Phase unmarked',
      'Progress Updated'
    );
  };

  // Get recommended courses based on user skills
  const getRecommendedCourses = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userSkills = Array.isArray(user.skills) ? user.skills : [];
    const recommendedCourses = [];
    
    userSkills.forEach(skill => {
      if (COURSE_DATABASE[skill]) {
        COURSE_DATABASE[skill].forEach(course => {
          recommendedCourses.push({
            ...course,
            skill
          });
        });
      }
    });

    return recommendedCourses.slice(0, 6);
  };

  const recommendedCourses = getRecommendedCourses();
  const completedPhases = Object.values(careerProgress).filter(v => v).length;

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Career Coach</h1>
              <p className="text-muted-foreground">Get AI-powered guidance on career growth</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('coach')}
          className={`px-4 py-3 font-medium flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'coach'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          AI Coach
        </button>
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`px-4 py-3 font-medium flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'roadmap'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Career Roadmap
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* AI COACH TAB */}
        {activeTab === 'coach' && (
          <motion.div
            key="coach"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Chat with AI Coach</h2>
              <Button 
                size="sm"
                variant="outline"
                onClick={handleClearHistory}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
            </div>

            {/* Messages Container */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 overflow-y-auto mb-6 space-y-4 pr-2"
            >
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : message.isFallback
                            ? 'bg-yellow-500/10 border border-yellow-500/30 rounded-tl-none'
                            : 'bg-background/50 border border-border rounded-tl-none'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      
                      {message.isFallback && (
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2 font-medium">
                          ⚠️ Fallback response - AI service temporarily unavailable
                        </p>
                      )}
                      
                      {message.type === 'ai' && (
                        <button
                          onClick={() => handleCopyMessage(message.id, message.content)}
                          className="mt-2 text-xs opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1"
                        >
                          {copiedId === message.id ? (
                            <>
                              <Check className="w-3 h-3" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy
                            </>
                          )}
                        </button>
                      )}

                      <span className="text-xs opacity-50 mt-1 block">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-background/50 border border-border rounded-2xl rounded-tl-none px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Coach is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </motion.div>

            {/* Input Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background/50 border border-border rounded-2xl p-4"
            >
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <Input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="Ask me anything about your career..."
                  disabled={loading}
                  className="flex-1"
                />
                <Button 
                  type="submit"
                  disabled={loading || !inputValue.trim()}
                  size="icon"
                  className="rounded-xl"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
              
              {/* Suggested Topics */}
              <div className="mt-4 space-y-2">
                <p className="text-xs text-muted-foreground">Suggested topics:</p>
                <div className="flex flex-wrap gap-2">
                  {['Career Growth', 'Salary Negotiation', 'Interview Prep', 'Skill Development'].map((topic) => (
                    <motion.button
                      key={topic}
                      onClick={() => {
                        setInputValue(`Tell me about ${topic.toLowerCase()}`);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors border border-primary/20"
                    >
                      {topic}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 bg-gradient-to-r from-orange-500/10 to-blue-500/10 border border-orange-500/20 rounded-xl p-3 text-center text-xs text-muted-foreground"
            >
              💡 {messages.length - 1} messages in this conversation • AI Coach is available 24/7
            </motion.div>
          </motion.div>
        )}

        {/* CAREER ROADMAP TAB */}
        {activeTab === 'roadmap' && (
          <motion.div
            key="roadmap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 overflow-y-auto space-y-6 pb-6"
          >
            {/* Progress Overview */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Your Career Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      {completedPhases} of {CAREER_ROADMAP.length} phases completed
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">{Math.round((completedPhases / CAREER_ROADMAP.length) * 100)}%</div>
                    <p className="text-xs text-muted-foreground">Complete</p>
                  </div>
                </div>
                <div className="mt-4 w-full h-2 bg-background/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedPhases / CAREER_ROADMAP.length) * 100}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Career Phases */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Career Roadmap Phases
              </h3>
              
              {CAREER_ROADMAP.map((phase) => (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: phase.id * 0.1 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all ${
                      careerProgress[`phase${phase.id}`]
                        ? 'bg-emerald-500/10 border-emerald-500/20'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => togglePhaseCompletion(phase.id)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 mt-1 ${
                            careerProgress[`phase${phase.id}`]
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'border-muted-foreground hover:border-primary'
                          }`}
                        >
                          {careerProgress[`phase${phase.id}`] && (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          )}
                        </motion.button>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-base">{phase.phase}</h4>
                            <Badge variant="outline" className="text-xs">{phase.duration}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{phase.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {phase.tasks.map((task, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm">
                                <ArrowRight className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                                <span className="text-muted-foreground">{task}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Recommended Courses */}
            {recommendedCourses.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Recommended Courses
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Based on your skills: {recommendedCourses.map(c => c.skill).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendedCourses.map((course, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="h-full hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                        <CardContent className="pt-6">
                          <div className="flex flex-col h-full">
                            <div className="mb-3 flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm mb-1 line-clamp-2">{course.title}</h4>
                                <Badge variant="secondary" className="text-xs">{course.platform}</Badge>
                              </div>
                            </div>
                            
                            <div className="space-y-2 mb-4 flex-1">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{course.level}</span>
                                <span>⭐ {course.rating}</span>
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <span>Duration: {course.duration}</span>
                              </div>
                            </div>
                            
                            <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg text-xs text-primary mb-4">
                              Recommended because you have <strong>{course.skill}</strong> skills
                            </div>
                            
                            <Button size="sm" className="w-full mt-auto" variant="outline">
                              Learn More
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {recommendedCourses.length === 0 && (
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="pt-6 text-center">
                  <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    No courses to recommend yet. Add skills to your profile to get personalized recommendations!
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CareerCoach;
