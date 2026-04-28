"use client"

import { motion } from "framer-motion"
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Building2, 
  ChevronLeft, 
  ChevronRight,
  Bookmark,
  ExternalLink,
  Filter,
  SlidersHorizontal
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRef } from "react"

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

const featuredJobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "Google",
    location: "Mountain View, CA",
    salary: "$180k - $250k",
    type: "Full-time",
    match: 95,
    skills: ["React", "TypeScript", "Node.js"],
    logo: "G",
    color: "from-blue-500 to-green-500",
    posted: "2 days ago"
  },
  {
    id: 2,
    title: "Full Stack Engineer",
    company: "Meta",
    location: "Menlo Park, CA",
    salary: "$170k - $240k",
    type: "Full-time",
    match: 92,
    skills: ["React", "Python", "GraphQL"],
    logo: "M",
    color: "from-orange-500 to-blue-500",
    posted: "3 days ago"
  },
  {
    id: 3,
    title: "AI/ML Engineer",
    company: "OpenAI",
    location: "San Francisco, CA",
    salary: "$200k - $300k",
    type: "Full-time",
    match: 88,
    skills: ["Python", "TensorFlow", "PyTorch"],
    logo: "O",
    color: "from-emerald-500 to-teal-500",
    posted: "1 day ago"
  },
  {
    id: 4,
    title: "Product Designer",
    company: "Apple",
    location: "Cupertino, CA",
    salary: "$160k - $220k",
    type: "Full-time",
    match: 85,
    skills: ["Figma", "UI/UX", "Prototyping"],
    logo: "A",
    color: "from-gray-600 to-gray-800",
    posted: "5 days ago"
  },
]

const allJobs = [
  ...featuredJobs,
  {
    id: 5,
    title: "Backend Developer",
    company: "Netflix",
    location: "Los Gatos, CA",
    salary: "$165k - $230k",
    type: "Full-time",
    match: 82,
    skills: ["Java", "Microservices", "AWS"],
    logo: "N",
    color: "from-red-600 to-red-800",
    posted: "1 week ago"
  },
  {
    id: 6,
    title: "DevOps Engineer",
    company: "Amazon",
    location: "Seattle, WA",
    salary: "$155k - $210k",
    type: "Full-time",
    match: 78,
    skills: ["Kubernetes", "Docker", "Terraform"],
    logo: "A",
    color: "from-orange-500 to-yellow-500",
    posted: "4 days ago"
  },
]

function getMatchColor(match: number) {
  if (match >= 90) return "bg-emerald-500"
  if (match >= 80) return "bg-accent"
  if (match >= 70) return "bg-yellow-500"
  return "bg-orange-500"
}

export function JobBoardSection() {
  const carouselRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 360
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      })
    }
  }

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
          <h1 className="text-3xl font-bold text-foreground">Job Board</h1>
          <p className="text-muted-foreground mt-1">156 jobs match your profile</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Sort
          </Button>
        </div>
      </motion.div>

      {/* Featured Jobs Carousel */}
      <motion.div variants={item}>
        <Card className="glass-card border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Featured Jobs</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => scroll("left")}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => scroll("right")}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div 
              ref={carouselRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {featuredJobs.map((job) => (
                <div
                  key={job.id}
                  className="min-w-[340px] p-5 rounded-2xl bg-gradient-to-br from-secondary/50 to-secondary/30 border border-border/30 hover:border-primary/30 transition-all duration-300 group"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${job.color} flex items-center justify-center text-white font-bold text-lg`}>
                      {job.logo}
                    </div>
                    <Badge className={`${getMatchColor(job.match)} text-white border-0`}>
                      {job.match}% Match
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-1">{job.title}</h3>
                  <p className="text-muted-foreground flex items-center gap-1 mb-3">
                    <Building2 className="w-4 h-4" />
                    {job.company}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-background/50">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {job.salary}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* All Jobs */}
      <motion.div variants={item}>
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">All Jobs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {allJobs.map((job) => (
              <div
                key={job.id}
                className="p-5 rounded-2xl bg-secondary/30 border border-border/30 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${job.color} flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}>
                    {job.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {job.company}
                        </p>
                      </div>
                      <Badge className={`${getMatchColor(job.match)} text-white border-0 flex-shrink-0`}>
                        {job.match}% Match
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {job.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="bg-background/50">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {job.salary}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {job.posted}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="rounded-xl">
                          <Bookmark className="w-5 h-5" />
                        </Button>
                        <Button className="rounded-xl gap-2">
                          Apply
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
