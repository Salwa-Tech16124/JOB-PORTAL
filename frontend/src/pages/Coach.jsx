import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Lightbulb, MessageSquare, Trash2, Loader2, Copy, Check, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { api } from '../api';

const renderMessageContent = (content) => {
  if (typeof content !== 'string') return String(content);
  return content.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <span key={i}>
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
        {i < content.split('\n').length - 1 && <br />}
      </span>
    );
  });
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-8 text-red-500 bg-red-100 rounded">
        <h1>Something went wrong.</h1>
        <pre className="mt-4">{this.state.error?.toString()}</pre>
        <pre className="mt-2 text-xs">{this.state.error?.stack}</pre>
      </div>;
    }
    return this.props.children;
  }
}

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
  const [profileData, setProfileData] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const messagesEndRef = useRef(null);

  // Load profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userStr = localStorage.getItem('user');
        const userObj = userStr ? JSON.parse(userStr) : {};
        const profileRes = await api.getProfile();
        
        if (profileRes.success && profileRes.data) {
          const profile = profileRes.data;
          const data = {
            name: userObj.name || profile.name || 'Guest User',
            skills: profile.skills || [],
            experience: profile.experience || '',
            goal: profile.careerGoal || profile.targetRole || '',
            currentRole: profile.currentRole || ''
          };
          setProfileData(data);

          // Check if profile is complete enough for personalized advice
          if (data.skills.length > 0 && data.experience) {
            setProfileComplete(true);
          } else {
            setProfileComplete(false);
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };

    loadProfile();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) {
      toast.warning('Please type a message', 'Empty Message');
      return;
    }

    const currentInput = inputValue;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: currentInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const res = await api.sendMessageCoach(currentInput, profileData || {});
      
      let aiResponseText = '';
      if (res.success && res.data && res.data.message) {
        aiResponseText = res.data.message;
      } else {
        // Fallback structurally if API call fails entirely
        aiResponseText = "I encountered an error analyzing your request. Here's a brief fallback: Please clearly state your target role, so I can generate a roadmap.";
      }

      const aiMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: aiResponseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      toast.success('AI response generated!', 'Got It');
    } catch (err) {
      toast.error('Failed to communicate with AI Coach', 'Error');
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
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-orange-500" />
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

      {/* Profile Warning Banner */}
      {!profileComplete && profileData && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl p-3 mb-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p><strong>{profileData.name || 'Guest User'}</strong> | Incomplete Profile: Our AI provides much better guidance with a completed tech profile.</p>
          </div>
          <Link to="/profile">
            <Button size="sm" variant="outline" className="h-8 border-amber-500/50 hover:bg-amber-500/10">
              Update Profile
            </Button>
          </Link>
        </motion.div>
      )}

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
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-background/50 border border-border rounded-tl-none'
                }`}
              >
                <div className="text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap">
                  {renderMessageContent(message.content)}
                </div>
                
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
    </div>
  );
}

export default function CareerCoachWrapper(props) {
  return (
    <ErrorBoundary>
      <CareerCoach {...props} />
    </ErrorBoundary>
  );
}
