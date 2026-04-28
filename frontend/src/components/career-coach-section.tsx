"use client"

import { motion } from "framer-motion"
import { 
  GraduationCap, 
  CheckCircle2, 
  Circle, 
  Lock,
  BookOpen,
  Code,
  Award,
  Briefcase,
  ArrowRight,
  Clock,
  Star,
  Play
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

const roadmap = [
  {
    phase: "Phase 1",
    title: "Foundation",
    description: "Master the fundamentals",
    status: "completed",
    progress: 100,
    items: [
      { name: "JavaScript Fundamentals", completed: true },
      { name: "React Basics", completed: true },
      { name: "CSS & Styling", completed: true },
    ]
  },
  {
    phase: "Phase 2",
    title: "Advanced Skills",
    description: "Level up your expertise",
    status: "in-progress",
    progress: 65,
    items: [
      { name: "TypeScript Mastery", completed: true },
      { name: "State Management", completed: true },
      { name: "Testing & QA", completed: false },
      { name: "Performance Optimization", completed: false },
    ]
  },
  {
    phase: "Phase 3",
    title: "Specialization",
    description: "Choose your path",
    status: "locked",
    progress: 0,
    items: [
      { name: "System Design", completed: false },
      { name: "Leadership Skills", completed: false },
      { name: "Architecture Patterns", completed: false },
    ]
  },
]

const recommendedCourses = [
  {
    title: "Advanced React Patterns",
    provider: "Frontend Masters",
    duration: "6 hours",
    rating: 4.9,
    icon: Code,
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Testing JavaScript",
    provider: "Testing Library",
    duration: "4 hours",
    rating: 4.8,
    icon: CheckCircle2,
    color: "from-emerald-500 to-teal-500"
  },
  {
    title: "System Design Interview",
    provider: "Educative",
    duration: "12 hours",
    rating: 4.7,
    icon: Briefcase,
    color: "from-orange-500 to-blue-500"
  },
]

export function CareerCoachSection() {
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
          <h1 className="text-3xl font-bold text-foreground">Career Coach</h1>
          <p className="text-muted-foreground mt-1">Your personalized learning roadmap</p>
        </div>
        <Button className="gap-2">
          <GraduationCap className="w-4 h-4" />
          Generate New Path
        </Button>
      </motion.div>

      {/* Progress Overview */}
      <motion.div variants={item}>
        <Card className="glass-card border-0 bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Your Learning Journey</h3>
                <p className="text-muted-foreground">You&apos;re 55% through your roadmap to Senior Engineer</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">12</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-accent">8</p>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={55} className="h-3" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Roadmap Timeline */}
      <motion.div variants={item}>
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Learning Roadmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
              
              <div className="space-y-8">
                {roadmap.map((phase, index) => {
                  const isCompleted = phase.status === "completed"
                  const isInProgress = phase.status === "in-progress"
                  const isLocked = phase.status === "locked"
                  
                  return (
                    <div key={phase.phase} className="relative pl-16">
                      {/* Timeline node */}
                      <div className={`absolute left-4 w-5 h-5 rounded-full border-2 ${
                        isCompleted ? "bg-emerald-500 border-emerald-500" :
                        isInProgress ? "bg-primary border-primary animate-pulse" :
                        "bg-muted border-border"
                      } flex items-center justify-center`}>
                        {isCompleted && <CheckCircle2 className="w-3 h-3 text-white" />}
                        {isInProgress && <Circle className="w-2 h-2 text-white" />}
                        {isLocked && <Lock className="w-2 h-2 text-muted-foreground" />}
                      </div>
                      
                      <div className={`p-5 rounded-2xl border ${
                        isCompleted ? "bg-emerald-500/5 border-emerald-500/20" :
                        isInProgress ? "bg-primary/5 border-primary/20" :
                        "bg-muted/30 border-border/50 opacity-60"
                      }`}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <Badge variant={isCompleted ? "default" : isInProgress ? "secondary" : "outline"} className="mb-2">
                              {phase.phase}
                            </Badge>
                            <h3 className="text-xl font-semibold text-foreground">{phase.title}</h3>
                            <p className="text-muted-foreground text-sm">{phase.description}</p>
                          </div>
                          {!isLocked && (
                            <div className="text-right">
                              <p className="text-2xl font-bold text-primary">{phase.progress}%</p>
                              <p className="text-xs text-muted-foreground">Complete</p>
                            </div>
                          )}
                        </div>
                        
                        {!isLocked && <Progress value={phase.progress} className="h-2 mb-4" />}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {phase.items.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className={`flex items-center gap-2 p-2 rounded-lg ${
                                item.completed ? "text-muted-foreground" : "text-foreground"
                              }`}
                            >
                              {item.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                              ) : isLocked ? (
                                <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-primary flex-shrink-0" />
                              )}
                              <span className={`text-sm ${item.completed ? "line-through" : ""}`}>
                                {item.name}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        {isInProgress && (
                          <Button className="mt-4 w-full sm:w-auto gap-2">
                            Continue Learning
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recommended Courses */}
      <motion.div variants={item}>
        <Card className="glass-card border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recommended for You</CardTitle>
            <Button variant="ghost" className="gap-2">
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedCourses.map((course, index) => {
                const Icon = course.icon
                return (
                  <div
                    key={index}
                    className="p-5 rounded-2xl bg-secondary/30 border border-border/30 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-1">{course.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{course.provider}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        {course.rating}
                      </span>
                    </div>
                    <Button variant="secondary" className="w-full mt-4 gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Play className="w-4 h-4" />
                      Start Course
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
