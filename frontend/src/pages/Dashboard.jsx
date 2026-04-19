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
  Target,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';

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
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [missingFields, setMissingFields] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    // Load user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Calculate profile completion based on actual filled fields
        const requiredFields = {
          name: parsedUser.name || '',
          skills: Array.isArray(parsedUser.skills) ? parsedUser.skills.length > 0 : false,
          experience: parsedUser.experience || '',
          bio: parsedUser.bio || '',
          education: parsedUser.education || ''
        };

        const filledFields = Object.entries(requiredFields)
          .filter(([key, value]) => {
            if (key === 'skills') return value === true;
            return value && String(value).trim().length > 0;
          })
          .length;

        const totalFields = Object.keys(requiredFields).length;
        const completion = Math.round((filledFields / totalFields) * 100);
        setProfileCompletion(completion);

        // Calculate missing fields
        const missing = [];
        if (!requiredFields.name) missing.push('name');
        if (!requiredFields.skills) missing.push('skills');
        if (!requiredFields.experience) missing.push('experience');
        if (!requiredFields.bio) missing.push('bio');
        if (!requiredFields.education) missing.push('education');
        setMissingFields(missing);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, [navigate]);

  const handleNavigate = (path) => {
    navigate(path);
  };

  // Extract user name (or show "Guest User" if not filled)
  const userName = user?.name && user.name.trim().length > 0 ? user.name : 'Guest User';

  // Empty state if profile is incomplete
  if (profileCompletion === 0) {
    return (
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6 p-6"
      >
        {/* Welcome */}
        <motion.div variants={item}>
          <h1 className="text-3xl font-bold text-foreground">Welcome!</h1>
          <p className="text-muted-foreground mt-1">Let's build your professional profile</p>
        </motion.div>

        {/* Empty State Card */}
        <motion.div variants={item}>
          <Card className="glass-card border-0 overflow-hidden bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">No Data Yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Add your profile details to unlock AI insights and job recommendations.
              </p>
              <Button
                onClick={() => handleNavigate('/profile')}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                size="lg"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Complete Your Profile
              </Button>
            </CardContent>
          </Card>
        </motion.div>

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
                    <p className="text-xs text-muted-foreground group-hover:text-primary-foreground/70">Get started</p>
                  </div>
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
                    <p className="font-semibold">Browse Jobs</p>
                    <p className="text-xs text-muted-foreground group-hover:text-white/70">Explore</p>
                  </div>
                </Button>

                <Button
                  onClick={() => handleNavigate('/coach')}
                  variant="outline"
                  className="h-auto py-6 flex flex-col items-center gap-3 bg-secondary/30 border-0 hover:bg-accent hover:text-accent-foreground group transition-all duration-300 cursor-pointer hover:scale-105"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <Briefcase className="w-6 h-6 text-accent group-hover:text-accent-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">Career Coach</p>
                    <p className="text-xs text-muted-foreground group-hover:text-accent-foreground/70">Get guidance</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  // If profile has some data, show dashboard with real metrics
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 p-6"
    >
      {/* Welcome - conditional based on name */}
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome{user?.name ? `, ${user.name}` : ''}!
        </h1>
        <p className="text-muted-foreground mt-1">Your profile progress: {profileCompletion}% complete</p>
      </motion.div>

      {/* Profile Completion Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={item}>
          <Card className="glass-card border-0 overflow-hidden group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Profile Score</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <User className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl font-bold text-foreground">{profileCompletion}</span>
                <span className="text-lg text-muted-foreground mb-1">%</span>
              </div>
              <Progress value={profileCompletion} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {profileCompletion === 0 && 'Start filling your profile'}
                {profileCompletion > 0 && profileCompletion < 100 && `${100 - profileCompletion}% to complete`}
                {profileCompletion === 100 && 'Profile complete!'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="glass-card border-0 overflow-hidden group hover:shadow-xl hover:shadow-accent/10 transition-all duration-300 cursor-pointer hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Skills Added</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="w-5 h-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl font-bold text-foreground">{Array.isArray(user?.skills) ? user.skills.length : 0}</span>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex-1 h-2 rounded-full bg-accent/20" style={{ opacity: i < (Array.isArray(user?.skills) ? user.skills.length : 0) ? 1 : 0.3 }}>
                    <div className="h-full rounded-full bg-accent" style={{ width: '100%' }} />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {Array.isArray(user?.skills) && user.skills.length > 0 ? `${user.skills.length} skill${user.skills.length > 1 ? 's' : ''}` : 'Add your skills'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="glass-card border-0 overflow-hidden group hover:shadow-xl hover:shadow-chart-3/10 transition-all duration-300 cursor-pointer hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Fields Filled</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-chart-3/20 to-chart-3/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 text-chart-3" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl font-bold text-foreground">{5 - missingFields.length}</span>
                <span className="text-lg text-muted-foreground mb-1">/5</span>
              </div>
              <Progress value={profileCompletion} className="h-2 [&>div]:bg-chart-3" />
              <p className="text-xs text-muted-foreground mt-2">{missingFields.length} field{missingFields.length !== 1 ? 's' : ''} remaining</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Missing Fields Checklist */}
      {missingFields.length > 0 && (
        <motion.div variants={item}>
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Missing Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['name', 'skills', 'experience', 'bio', 'education'].map((field) => (
                  <div key={field} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                    {missingFields.includes(field) ? (
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    )}
                    <span className="capitalize text-foreground font-medium flex-1">
                      {field === 'bio' ? 'Bio/Summary' : field.charAt(0).toUpperCase() + field.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

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
              </Button>

              <Button
                onClick={() => handleNavigate('/coach')}
                variant="outline"
                className="h-auto py-6 flex flex-col items-center gap-3 bg-secondary/30 border-0 hover:bg-accent hover:text-accent-foreground group transition-all duration-300 cursor-pointer hover:scale-105"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Play className="w-6 h-6 text-accent group-hover:text-accent-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">Career Coach</p>
                  <p className="text-xs text-muted-foreground group-hover:text-accent-foreground/70">Get guidance</p>
                </div>
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
                  <p className="font-semibold">Browse Jobs</p>
                  <p className="text-xs text-muted-foreground group-hover:text-white/70">Find opportunities</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
