import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Briefcase,
  Award,
  TrendingUp,
  ArrowUpRight,
  Edit3,
  Play,
  Eye,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    profileScore: 0,
    jobMatch: 0,
    skills: 0
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    const userObj = JSON.parse(userData);
    setUser(userObj);

    // Calculate profile completion based on required fields
    // Required fields: name, role, skills, experience, bio, education
    const requiredFields = [
      userObj.name,
      userObj.role,
      userObj.skills && Array.isArray(userObj.skills) && userObj.skills.length > 0,
      userObj.experience,
      userObj.bio,
      userObj.education
    ];
    
    const filledFields = requiredFields.filter(Boolean).length;
    const profileScore = Math.round((filledFields / requiredFields.length) * 100);

    setDashboardData({
      profileScore,
      jobMatch: Math.max(50, profileScore + 15),
      skills: userObj.skills && Array.isArray(userObj.skills) ? userObj.skills.length : 0
    });
  }, [navigate]);

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Welcome */}
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.name || 'User'}!</h1>
        <p className="text-muted-foreground mt-1">Here's your career progress overview</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={item} className="cursor-pointer" onClick={() => handleNavigate('/profile')}>
          <Card className="glass-card border-0 overflow-hidden group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Profile Score</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <User className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl font-bold text-foreground">{dashboardData.profileScore}</span>
                <span className="text-lg text-muted-foreground mb-1">/100</span>
                <span className="flex items-center text-sm text-emerald-500 mb-1 ml-auto">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +5%
                </span>
              </div>
              <Progress value={dashboardData.profileScore} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">Complete your profile to improve</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="cursor-pointer" onClick={() => handleNavigate('/')}>
          <Card className="glass-card border-0 overflow-hidden group hover:shadow-xl hover:shadow-accent/10 transition-all duration-300 cursor-pointer hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Job Match Score</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-5 h-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl font-bold text-foreground">{dashboardData.jobMatch}</span>
                <span className="text-lg text-muted-foreground mb-1">%</span>
                <span className="flex items-center text-sm text-emerald-500 mb-1 ml-auto">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12%
                </span>
              </div>
              <Progress value={dashboardData.jobMatch} className="h-2 [&>div]:bg-accent" />
              <p className="text-xs text-muted-foreground mt-2">Based on 156 available jobs</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="cursor-pointer" onClick={() => handleNavigate('/profile')}>
          <Card className="glass-card border-0 overflow-hidden group hover:shadow-xl hover:shadow-chart-3/10 transition-all duration-300 cursor-pointer hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Skills Count</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-chart-3/20 to-chart-3/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="w-5 h-5 text-chart-3" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl font-bold text-foreground">{dashboardData.skills}</span>
                <span className="text-lg text-muted-foreground mb-1">skills</span>
                <span className="flex items-center text-sm text-emerald-500 mb-1 ml-auto">
                  <Award className="w-4 h-4 mr-1" />
                  +3 new
                </span>
              </div>
              <div className="flex gap-1">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-2 rounded-full bg-chart-3/20"
                    style={{ opacity: i < 6 ? 1 : 0.3 }}
                  >
                    <div className="h-full rounded-full bg-chart-3" style={{ width: `${Math.random() * 40 + 60}%` }} />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">8 skills trending in your field</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button
                onClick={() => handleNavigate('/profile')}
                variant="outline"
                className="h-auto py-6 flex flex-col items-center gap-3 bg-secondary/30 border-0 hover:bg-primary hover:text-primary-foreground group transition-all duration-300 cursor-pointer hover:scale-105"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Edit3 className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">Update Profile</p>
                  <p className="text-xs text-muted-foreground group-hover:text-primary-foreground/70">Improve your score</p>
                </div>
                <ArrowUpRight className="w-4 h-4 absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>

              <Button
                onClick={() => handleNavigate('/interview')}
                variant="outline"
                className="h-auto py-6 flex flex-col items-center gap-3 bg-secondary/30 border-0 hover:bg-accent hover:text-accent-foreground group transition-all duration-300 cursor-pointer hover:scale-105"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Play className="w-6 h-6 text-accent group-hover:text-accent-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">Start Interview</p>
                  <p className="text-xs text-muted-foreground group-hover:text-accent-foreground/70">Practice with AI</p>
                </div>
                <ArrowUpRight className="w-4 h-4 absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>

              <Button
                onClick={() => handleNavigate('/')}
                variant="outline"
                className="h-auto py-6 flex flex-col items-center gap-3 bg-secondary/30 border-0 hover:bg-chart-3 hover:text-white group transition-all duration-300 cursor-pointer hover:scale-105"
              >
                <div className="w-12 h-12 rounded-xl bg-chart-3/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Eye className="w-6 h-6 text-chart-3 group-hover:text-white" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">View Jobs</p>
                  <p className="text-xs text-muted-foreground group-hover:text-white/70">156 matches found</p>
                </div>
                <ArrowUpRight className="w-4 h-4 absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
