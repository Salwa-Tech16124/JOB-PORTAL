"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Sparkles, ArrowRight, Briefcase, Users, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-bg">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, 50, 0], 
            y: [0, 30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, -30, 0], 
            y: [0, -50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-white/90 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            AI-Powered Career Platform
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 text-balance leading-tight"
        >
          Your Career Journey,
          <br />
          <span className="bg-gradient-to-r from-white via-orange-200 to-blue-200 bg-clip-text text-transparent">
            Supercharged by AI
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-white/80 mb-10 max-w-2xl mx-auto text-pretty"
        >
          Discover perfect job matches, simulate interviews, and get personalized career guidance 
          with our intelligent multi-agent AI system.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="glass-card rounded-2xl p-2 flex items-center gap-2">
            <div className="flex-1 flex items-center gap-3 px-4">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search jobs, skills, or companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0 text-lg placeholder:text-muted-foreground/60"
              />
            </div>
            <Button size="lg" className="rounded-xl px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30">
              Search
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-8 md:gap-16"
        >
          <div className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 rounded-xl glass flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold">50K+</p>
              <p className="text-white/70 text-sm">Active Jobs</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 rounded-xl glass flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold">100K+</p>
              <p className="text-white/70 text-sm">Users</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 rounded-xl glass flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold">95%</p>
              <p className="text-white/70 text-sm">Match Rate</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-white"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  )
}
