"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  MessageSquare, 
  Send, 
  Mic, 
  MicOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Zap,
  Play,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Bot,
  User
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

const interviewTypes = [
  { id: "behavioral", name: "Behavioral", icon: MessageSquare, color: "from-blue-500 to-cyan-500" },
  { id: "technical", name: "Technical", icon: Zap, color: "from-orange-500 to-blue-500" },
  { id: "system-design", name: "System Design", icon: Bot, color: "from-emerald-500 to-teal-500" },
]

const sampleConversation = [
  {
    role: "ai",
    content: "Welcome to your mock interview! I&apos;m your AI interviewer today. Let&apos;s start with a behavioral question: Tell me about a time when you had to deal with a difficult team member. How did you handle the situation?",
    timestamp: "10:00 AM"
  },
  {
    role: "user",
    content: "In my previous role at Tech Corp, I worked with a team member who often missed deadlines. Instead of escalating immediately, I scheduled a private conversation to understand their challenges. I discovered they were overwhelmed with tasks. Together, we created a priority system and I offered to help with some tasks. This improved our collaboration significantly.",
    timestamp: "10:02 AM",
    feedback: {
      score: 85,
      strengths: ["Clear structure", "Empathy shown", "Problem-solving approach"],
      improvements: ["Could add specific metrics", "Mention long-term impact"]
    }
  },
  {
    role: "ai",
    content: "Great response! You demonstrated empathy and problem-solving skills. Now, let&apos;s move to a technical question: Can you explain the difference between REST and GraphQL APIs, and when would you choose one over the other?",
    timestamp: "10:03 AM"
  }
]

const pastInterviews = [
  { type: "Behavioral", date: "2 days ago", score: 85, status: "passed" },
  { type: "Technical", date: "1 week ago", score: 78, status: "passed" },
  { type: "System Design", date: "2 weeks ago", score: 62, status: "needs-work" },
]

export function InterviewSimulatorSection() {
  const [isRecording, setIsRecording] = useState(false)
  const [answer, setAnswer] = useState("")
  const [activeInterview, setActiveInterview] = useState<string | null>(null)

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Interview Simulator</h1>
          <p className="text-muted-foreground mt-1">Practice with AI-powered mock interviews</p>
        </div>
      </motion.div>

      {/* Interview Type Selection */}
      <motion.div variants={item}>
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Choose Interview Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {interviewTypes.map((type) => {
                const Icon = type.icon
                const isActive = activeInterview === type.id
                return (
                  <button
                    key={type.id}
                    onClick={() => setActiveInterview(type.id)}
                    className={`p-6 rounded-2xl border transition-all duration-300 text-left ${
                      isActive 
                        ? "bg-primary/10 border-primary shadow-lg shadow-primary/20" 
                        : "bg-secondary/30 border-border/30 hover:border-primary/30"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground">{type.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {type.id === "behavioral" && "Situational & soft skills"}
                      {type.id === "technical" && "Coding & algorithms"}
                      {type.id === "system-design" && "Architecture & scalability"}
                    </p>
                    {isActive && (
                      <Button className="w-full mt-4 gap-2">
                        <Play className="w-4 h-4" />
                        Start Interview
                      </Button>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Chat Interface */}
      <motion.div variants={item}>
        <Card className="glass-card border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">AI Interviewer</CardTitle>
                <p className="text-xs text-muted-foreground">Behavioral Interview Session</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Clock className="w-3 h-3" />
                15:32
              </Badge>
              <Button variant="outline" size="sm" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Restart
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Conversation */}
            <div className="h-[400px] overflow-y-auto space-y-4 mb-4 p-4 rounded-xl bg-secondary/20">
              <AnimatePresence>
                {sampleConversation.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === "ai" 
                        ? "bg-gradient-to-br from-primary to-accent" 
                        : "bg-secondary"
                    }`}>
                      {message.role === "ai" ? (
                        <Bot className="w-4 h-4 text-white" />
                      ) : (
                        <User className="w-4 h-4 text-foreground" />
                      )}
                    </div>
                    <div className={`max-w-[70%] ${message.role === "user" ? "text-right" : ""}`}>
                      <div className={`p-4 rounded-2xl ${
                        message.role === "ai" 
                          ? "bg-card rounded-tl-sm" 
                          : "bg-primary text-primary-foreground rounded-tr-sm"
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{message.timestamp}</p>
                      
                      {/* Feedback card for user answers */}
                      {message.feedback && (
                        <div className="mt-3 p-4 rounded-xl bg-card border border-border/50 text-left">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-foreground">AI Feedback</span>
                            <Badge className={`${
                              message.feedback.score >= 80 ? "bg-emerald-500" :
                              message.feedback.score >= 60 ? "bg-amber-500" :
                              "bg-red-500"
                            } text-white border-0`}>
                              {message.feedback.score}/100
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs font-medium text-emerald-500 mb-1">Strengths:</p>
                              <div className="flex flex-wrap gap-1">
                                {message.feedback.strengths.map((s, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    {s}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-amber-500 mb-1">To Improve:</p>
                              <div className="flex flex-wrap gap-1">
                                {message.feedback.improvements.map((s, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs bg-amber-500/10 text-amber-600">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {s}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Textarea
                  placeholder="Type your answer here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="min-h-[80px] pr-12 bg-secondary/30 border-0 focus-visible:ring-1 focus-visible:ring-primary resize-none"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsRecording(!isRecording)}
                  className={`absolute right-2 bottom-2 rounded-xl ${
                    isRecording ? "bg-red-500 text-white hover:bg-red-600" : ""
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              </div>
              <Button size="lg" className="h-auto px-6">
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Past Interviews */}
      <motion.div variants={item}>
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Past Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastInterviews.map((interview, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/30 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      interview.status === "passed" ? "bg-emerald-500/10" : "bg-amber-500/10"
                    }`}>
                      {interview.status === "passed" ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{interview.type} Interview</p>
                      <p className="text-sm text-muted-foreground">{interview.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">{interview.score}</p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                    <Badge className={`${
                      interview.status === "passed" ? "bg-emerald-500" : "bg-amber-500"
                    } text-white border-0`}>
                      {interview.status === "passed" ? "Passed" : "Needs Work"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
