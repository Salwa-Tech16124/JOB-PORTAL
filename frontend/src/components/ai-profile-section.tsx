"use client"

import { motion } from "framer-motion"
import { 
  User, 
  Mail, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Link2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Code,
  Database,
  Palette,
  Globe,
  Server,
  Smartphone
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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

const skills = [
  { name: "React", icon: Code, level: 95, category: "Frontend" },
  { name: "TypeScript", icon: Code, level: 90, category: "Frontend" },
  { name: "Node.js", icon: Server, level: 85, category: "Backend" },
  { name: "Python", icon: Code, level: 80, category: "Backend" },
  { name: "PostgreSQL", icon: Database, level: 75, category: "Database" },
  { name: "MongoDB", icon: Database, level: 70, category: "Database" },
  { name: "AWS", icon: Globe, level: 72, category: "Cloud" },
  { name: "Docker", icon: Server, level: 78, category: "DevOps" },
  { name: "Figma", icon: Palette, level: 65, category: "Design" },
  { name: "React Native", icon: Smartphone, level: 68, category: "Mobile" },
]

const profileSections = [
  { name: "Basic Info", complete: true, score: 100 },
  { name: "Work Experience", complete: true, score: 100 },
  { name: "Education", complete: true, score: 100 },
  { name: "Skills", complete: true, score: 85 },
  { name: "Projects", complete: false, score: 60 },
  { name: "Certifications", complete: false, score: 40 },
]

export function AIProfileSection() {
  const overallScore = Math.round(
    profileSections.reduce((acc, s) => acc + s.score, 0) / profileSections.length
  )

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
          <h1 className="text-3xl font-bold text-foreground">AI Profile</h1>
          <p className="text-muted-foreground mt-1">Your AI-analyzed career profile</p>
        </div>
        <Button className="gap-2">
          <Edit3 className="w-4 h-4" />
          Edit Profile
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div variants={item} className="lg:col-span-1">
          <Card className="glass-card border-0">
            <CardContent className="pt-6">
              <div className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-primary/20">
                  <AvatarImage src="/avatar.jpg" alt="John Doe" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-2xl">
                    JD
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold text-foreground">John Doe</h2>
                <p className="text-muted-foreground">Senior Software Engineer</p>
                
                <div className="flex justify-center gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{overallScore}</p>
                    <p className="text-xs text-muted-foreground">Profile Score</p>
                  </div>
                  <div className="w-px bg-border" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent">156</p>
                    <p className="text-xs text-muted-foreground">Job Matches</p>
                  </div>
                  <div className="w-px bg-border" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-chart-3">24</p>
                    <p className="text-xs text-muted-foreground">Skills</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">john.doe@email.com</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">San Francisco, CA</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-sm">5+ years experience</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-sm">MS Computer Science, Stanford</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Link2 className="w-4 h-4" />
                  <span className="text-sm">github.com/johndoe</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Strength */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="glass-card border-0 h-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Profile Strength</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Overall Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Completion</span>
                  <span className="text-2xl font-bold text-primary">{overallScore}%</span>
                </div>
                <Progress value={overallScore} className="h-3" />
              </div>

              {/* Section breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profileSections.map((section) => (
                  <div
                    key={section.name}
                    className="p-4 rounded-xl bg-secondary/30 border border-border/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {section.complete ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        )}
                        <span className="font-medium text-sm">{section.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{section.score}%</span>
                    </div>
                    <Progress 
                      value={section.score} 
                      className="h-1.5 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" 
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-sm text-foreground">
                  <strong>AI Tip:</strong> Complete your Projects and Certifications sections to increase your profile score and improve job match accuracy by up to 20%.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Skills */}
      <motion.div variants={item}>
        <Card className="glass-card border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Skills Analysis</CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit3 className="w-4 h-4" />
              Add Skills
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map((skill) => {
                const Icon = skill.icon
                return (
                  <div
                    key={skill.name}
                    className="p-4 rounded-xl bg-secondary/30 border border-border/30 hover:border-primary/30 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{skill.name}</h4>
                        <p className="text-xs text-muted-foreground">{skill.category}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {skill.level}%
                      </Badge>
                    </div>
                    <Progress value={skill.level} className="h-1.5" />
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
