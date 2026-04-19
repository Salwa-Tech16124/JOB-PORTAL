import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Lightbulb, MessageSquare, Trash2, Loader2, Copy, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';

// AI Response Templates
const AI_RESPONSES = {
  career: [
    "To advance your career, focus on these key areas: 1) Continuous skill development in emerging technologies, 2) Building a strong professional network, 3) Taking on leadership opportunities, 4) Documenting your achievements and impact.",
    "Career growth is a marathon, not a sprint. Set clear, measurable goals for the next 12 months. Break them into quarterly milestones and track your progress regularly.",
    "Consider a skills audit - list your current strengths and identify gaps in the market. Then create a targeted learning plan to address those gaps within 3-6 months."
  ],
  salary: [
    "When negotiating salary, research market rates using Glassdoor, Levels.fyi, and similar tools. Base your ask on: experience level, location, company size, and your unique value proposition.",
    "Document your achievements with metrics: increased revenue by X%, improved performance by Y%, reduced costs by Z%. These quantified results are powerful in salary negotiations.",
    "Consider the total compensation package: base salary, bonuses, stock options, benefits, remote flexibility, PTO, and professional development budget. Sometimes a lower base with better benefits is actually better."
  ],
  skills: [
    "Focus on these in-demand skills: 1) System Design, 2) Cloud Technologies (AWS/Azure/GCP), 3) DevOps/CI-CD, 4) Full-stack development, 5) Data science/ML fundamentals.",
    "Create a learning roadmap: pick 2-3 skills to master over the next 6 months. Use resources like LeetCode, Udemy, Coursera, or YouTube. Build projects to apply your learning.",
    "The best way to learn is by building. Pick a real-world project, encounter challenges, and solve them. This practical experience is worth more than passive learning."
  ],
  interview: [
    "Prepare using the STAR method: Situation, Task, Action, Result. Practice 10-15 behavioral questions and have concrete examples ready for common scenarios like conflict resolution, failures, and achievements.",
    "Technical interviews: Practice on LeetCode (aim for 50+ problems). Focus on understanding algorithms, not memorizing solutions. Explain your thought process clearly during interviews.",
    "Always ask thoughtful questions at the end: 'What does success look like in this role?', 'What are the biggest challenges?', 'How is the team structured?'. This shows genuine interest."
  ],
  general: [
    "Building a successful tech career requires: continuous learning, strong communication skills, networking, taking calculated risks, and being adaptable to industry changes.",
    "Don't underestimate soft skills - they're often what separates great engineers from exceptional leaders. Focus on communication, collaboration, and problem-solving.",
    "Your first 5 years in tech are crucial. Choose companies and roles that will teach you the most. Don't just chase salary - invest in learning and growth."
  ]
};

function CareerCoach() {
  const toast = useToast();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hi! 👋 I\'m your AI Career Coach. I\'m here to help you with career advice, interview prep, skill development, and more. What would you like to discuss today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Categorize questions
  const getCategory = (question) => {
    const q = question.toLowerCase();
    if (q.includes('salary') || q.includes('pay') || q.includes('negotiate')) return 'salary';
    if (q.includes('skill') || q.includes('learn') || q.includes('improve')) return 'skills';
    if (q.includes('interview') || q.includes('prepare') || q.includes('leet')) return 'interview';
    if (q.includes('career') || q.includes('job') || q.includes('advance')) return 'career';
    return 'general';
  };

  // Get AI response
  const getAIResponse = (question) => {
    const category = getCategory(question);
    const responses = AI_RESPONSES[category];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) {
      toast.warning('Please type a message', 'Empty Message');
      return;
    }

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Get AI response
    const aiResponse = getAIResponse(inputValue);
    const aiMessage = {
      id: messages.length + 2,
      type: 'ai',
      content: aiResponse,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
    setLoading(false);
    toast.success('AI response generated!', 'Got It');
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
        content: 'Hi! 👋 I\'m your AI Career Coach. I\'m here to help you with career advice, interview prep, skill development, and more. What would you like to discuss today?',
        timestamp: new Date()
      }
    ]);
    toast.info('Conversation cleared', 'Reset');
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Career Coach</h1>
              <p className="text-muted-foreground">Get AI-powered guidance on career growth</p>
            </div>
          </div>
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
      </motion.div>

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
                    : 'bg-background/50 border border-border rounded-tl-none'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                
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
        className="mt-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-3 text-center text-xs text-muted-foreground"
      >
        💡 {messages.length - 1} messages in this conversation • AI Coach is available 24/7
      </motion.div>
    </div>
  );
}

export default CareerCoach;
