import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Profile from './Profile';
import EmployerProfile from '../components/EmployerProfile';
import { api } from '../api';
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
  CheckCircle,
  Star,
  Mail,
  Zap,
  XCircle,
  BarChart2,
  Loader2
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
  const [applications, setApplications] = useState([]);
  const [isEmployer, setIsEmployer] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [screeningResults, setScreeningResults] = useState({});
  const [screeningLoading, setScreeningLoading] = useState({});
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'interested' | 'screened_rejected'

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const computeProfileState = (userObj) => {
      const isEmp = userObj.role === 'employer';
      let requiredFields = {};
      
      if (isEmp) {
        requiredFields = {
          name: userObj.name || '',
          title: userObj.title || '',
          company: userObj.company || '',
          experience: userObj.experience || '',
          bio: userObj.bio || ''
        };
      } else {
        requiredFields = {
          name: userObj.name || '',
          skills: Array.isArray(userObj.skills) ? userObj.skills.length > 0 : false,
          experience: userObj.experience || '',
          bio: userObj.bio || '',
          education: userObj.education || ''
        };
      }

      const filledFields = Object.entries(requiredFields)
        .filter(([key, value]) => {
          if (key === 'skills') return value === true;
          return value && String(value).trim().length > 0;
        })
        .length;

      const totalFields = Object.keys(requiredFields).length;
      const completion = Math.round((filledFields / totalFields) * 100);
      setProfileCompletion(completion);

      const missing = [];
      Object.entries(requiredFields).forEach(([key, value]) => {
        if (key === 'skills' && !value) missing.push(key);
        else if (key !== 'skills' && !value) missing.push(key);
      });
      setMissingFields(missing);
    };

    const loadDashboardData = async () => {
      const userData = localStorage.getItem('user');
      let parsedUser = {};

      if (userData) {
        try {
          parsedUser = JSON.parse(userData);
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }

      if (parsedUser) {
        setUser(parsedUser);
        setIsEmployer(parsedUser.role === 'employer');
        computeProfileState(parsedUser);
      }

      const applicationsRes = await api.getApplications();
      if (applicationsRes.success) {
        setApplications(applicationsRes.data);
      }

      try {
        const profileRes = await api.getProfile();
        if (profileRes.success && profileRes.data) {
          const mergedUser = {
            ...parsedUser,
            ...profileRes.data
          };
          setUser(mergedUser);
          setIsEmployer(mergedUser.role === 'employer');
          localStorage.setItem('user', JSON.stringify(mergedUser));
          computeProfileState(mergedUser);
        }
      } catch (e) {
        console.error('Failed to refresh profile data:', e);
      }
    };

    loadDashboardData();
  }, [navigate]);

  const handleNavigate = (path) => {
    if (path === '/profile') {
      setIsEditingProfile(true);
    } else {
      navigate(path);
    }
  };

  const handleUpdateStatus = async (appId, status) => {
    const res = await api.updateApplicationStatus(appId, status);
    if (res.success) {
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    }
  };

  // Extract user name (or show "Guest User" if not filled)
  const userName = user?.name && user.name.trim().length > 0 ? user.name : 'Guest User';

  if (isEditingProfile) {
    if (isEmployer) {
      return <EmployerProfile onBack={() => setIsEditingProfile(false)} />;
    }
    return <Profile onBack={() => setIsEditingProfile(false)} />;
  }

  // For employers with empty profile, show Employer Profile form directly
  if (profileCompletion === 0 && isEmployer) {
    return <EmployerProfile onBack={() => window.location.reload()} />;
  }

  // Empty state if candidate profile is incomplete
  if (profileCompletion === 0) {
    return (
      <div className="flex-1 bg-background">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 py-6">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-10"
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

              {!isEmployer && (
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
              )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  </div>
  );
}

// If profile has some data, show dashboard with real metrics
return (
    <div className="flex-1 bg-background">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 py-6">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-10"
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
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isEmployer ? 'Fields Filled' : 'Skills Added'}
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="w-5 h-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              {isEmployer ? (
                <>
                  <div className="flex items-end gap-2 mb-3">
                    <span className="text-4xl font-bold text-foreground">{5 - missingFields.length}</span>
                    <span className="text-lg text-muted-foreground mb-1">/5</span>
                  </div>
                  <Progress value={profileCompletion} className="h-2 [&>div]:bg-accent" />
                  <p className="text-xs text-muted-foreground mt-2">{missingFields.length} field{missingFields.length !== 1 ? 's' : ''} remaining</p>
                </>
              ) : (
                <>
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
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {!isEmployer && (
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
        )}
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
                {(isEmployer ? ['name', 'title', 'company', 'bio', 'experience'] : ['name', 'skills', 'experience', 'bio', 'education']).map((field) => (
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

              {!isEmployer && (
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
              )}

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

      {/* Applications / Screening Section */}
      <motion.div variants={item} className="mt-8">
        {isEmployer ? (
          <EmployerApplicationsSection
            applications={applications}
            screeningResults={screeningResults}
            screeningLoading={screeningLoading}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onScreen={async (jobId) => {
              setScreeningLoading(prev => ({ ...prev, [jobId]: true }));
              try {
                const res = await api.screenCandidates(jobId);
                if (res.success) {
                  setScreeningResults(prev => ({ ...prev, [jobId]: res.data }));
                  // Refresh applications to reflect new statuses
                  const appsRes = await api.getApplications();
                  if (appsRes.success) setApplications(appsRes.data);
                } else {
                  alert(res.message || 'Screening failed');
                }
              } catch(e) {
                alert('Could not reach server. Make sure the backend is running.');
              }
              setScreeningLoading(prev => ({ ...prev, [jobId]: false }));
            }}
            onUpdateStatus={handleUpdateStatus}
          />
        ) : (
          <>
            <h2 className="text-2xl font-bold text-foreground mb-4">Your Applications Tracker</h2>
            {applications.length === 0 ? (
              <Card className="glass-card border-0 py-8 text-center text-muted-foreground">
                You have not applied to any jobs yet.
              </Card>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <Card key={app.id} className="glass-card border border-border/50 hover:border-primary/30 transition-colors p-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{app.job?.title || 'Unknown Job'}</h3>
                        <p className="text-muted-foreground text-sm flex items-center gap-2">
                          <Briefcase className="w-4 h-4" /> {app.job?.company || 'Unknown Company'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        app.status === 'Applied' ? 'bg-primary/20 text-primary' :
                        app.status === 'Interested' ? 'bg-emerald-500/20 text-emerald-600' :
                        app.status === 'Screened_Rejected' ? 'bg-red-500/20 text-red-500' :
                        'bg-chart-3/20 text-chart-3'
                      }`}>
                        {app.status === 'Screened_Rejected' ? 'Not Selected' : app.status}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>

    </motion.div>
      </div>
    </div>
  );
}

// ─── Employer Applications Section with Screener ─────────────────────────────
function EmployerApplicationsSection({ applications, screeningResults, screeningLoading, activeTab, setActiveTab, onScreen, onUpdateStatus }) {
  // Group applications by job
  const jobGroups = {};
  for (const app of applications) {
    const jobId = app.jobId;
    const jobTitle = app.job?.title || `Job #${jobId}`;
    if (!jobGroups[jobId]) jobGroups[jobId] = { jobId, jobTitle, apps: [] };
    jobGroups[jobId].apps.push(app);
  }

  const allJobs = Object.values(jobGroups);
  const interestedApps = applications.filter(a => a.status === 'Interested');
  const rejectedApps = applications.filter(a => a.status === 'Screened_Rejected');

  const tabs = [
    { key: 'all', label: 'All Applicants', count: applications.length, icon: <BarChart2 className="w-4 h-4" /> },
    { key: 'interested', label: 'Interested', count: interestedApps.length, icon: <Star className="w-4 h-4 text-emerald-500" /> },
    { key: 'screened_rejected', label: 'Not Proceeding', count: rejectedApps.length, icon: <XCircle className="w-4 h-4 text-red-400" /> },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" /> Candidate Applications
        </h2>
        <p className="text-sm text-muted-foreground">
          Use <strong>AI Screen</strong> to automatically evaluate candidates and send emails
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon} {tab.label}
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === tab.key ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
            }`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {applications.length === 0 ? (
        <Card className="glass-card border-0 py-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <Briefcase className="w-12 h-12 text-muted-foreground/40" />
            <p className="text-muted-foreground font-medium">No candidates have applied to your jobs yet.</p>
            <p className="text-sm text-muted-foreground">When candidates apply, they will appear here for AI screening.</p>
          </div>
        </Card>
      ) : activeTab === 'all' ? (
        // Group by job with Screen button
        <div className="space-y-6">
          {allJobs.map(({ jobId, jobTitle, apps }) => {
            const isLoading = screeningLoading[jobId];
            const result = screeningResults[jobId];
            const unscreened = apps.filter(a => a.status === 'Applied' || a.status === 'Viewed by Company').length;

            return (
              <Card key={jobId} className="glass-card border border-border/50 overflow-hidden">
                {/* Job Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-border/40 bg-primary/3">
                  <div>
                    <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-primary" /> {jobTitle}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {apps.length} applicant{apps.length !== 1 ? 's' : ''} •{' '}
                      {apps.filter(a => a.status === 'Interested').length} interested •{' '}
                      {unscreened} pending
                    </p>
                  </div>
                  <Button
                    onClick={() => onScreen(jobId)}
                    disabled={isLoading || unscreened === 0}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white gap-2 shrink-0"
                  >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Screening...</>
                    ) : (
                      <><Zap className="w-4 h-4" /> AI Screen {unscreened > 0 ? `(${unscreened})` : ''}</>
                    )}
                  </Button>
                </div>

                {/* Screening result banner */}
                {result && (
                  <div className="px-5 py-3 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border-b border-indigo-200/30 flex flex-wrap gap-4 text-sm">
                    <span className="text-indigo-600 font-semibold flex items-center gap-1">
                      <Zap className="w-4 h-4" /> AI Screened {result.total} candidates
                    </span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> {result.interested} Interested
                    </span>
                    <span className="text-red-500 font-semibold flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> {result.rejected} Not proceeding
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Mail className="w-4 h-4" /> Emails sent automatically
                    </span>
                  </div>
                )}

                {/* Applicants */}
                <div className="divide-y divide-border/30">
                  {apps.map(app => (
                    <ApplicationRow key={app.id} app={app} screeningResults={screeningResults} onUpdateStatus={onUpdateStatus} />
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      ) : activeTab === 'interested' ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 font-semibold mb-2">
            <Star className="w-5 h-5" /> {interestedApps.length} Interested Candidates
          </div>
          {interestedApps.length === 0 ? (
            <Card className="glass-card border-0 py-10 text-center text-muted-foreground">
              No candidates marked as Interested yet. Run <strong>AI Screen</strong> from the All Applicants tab.
            </Card>
          ) : interestedApps.map(app => (
            <ApplicationRow key={app.id} app={app} screeningResults={screeningResults} onUpdateStatus={onUpdateStatus} highlight="interested" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-red-500 font-semibold mb-2">
            <XCircle className="w-5 h-5" /> {rejectedApps.length} Not Proceeding
          </div>
          {rejectedApps.length === 0 ? (
            <Card className="glass-card border-0 py-10 text-center text-muted-foreground">
              No rejected candidates yet.
            </Card>
          ) : rejectedApps.map(app => (
            <ApplicationRow key={app.id} app={app} screeningResults={screeningResults} onUpdateStatus={onUpdateStatus} highlight="rejected" />
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationRow({ app, highlight, onUpdateStatus }) {
  const screening = app.screeningResult;
  const isInterested = app.status === 'Interested';
  const isRejected = app.status === 'Screened_Rejected';

  return (
    <div className={`p-4 transition-colors ${
      isInterested ? 'bg-emerald-500/5' : isRejected ? 'bg-red-500/5' : 'hover:bg-secondary/20'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
              {(app.candidate?.name || 'C').charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{app.candidate?.name || 'Candidate'}</h4>
              <p className="text-xs text-muted-foreground">{app.candidate?.email || 'No email'}</p>
            </div>
            {/* Score badge if screened */}
            {screening && (
              <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                screening.suitable ? 'bg-emerald-500/15 text-emerald-600' : 'bg-red-500/15 text-red-500'
              }`}>
                <BarChart2 className="w-3 h-3" /> {screening.score}% match
              </div>
            )}
          </div>
          {/* Skills */}
          {app.candidate?.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 ml-12">
              {app.candidate.skills.slice(0, 5).map(skill => (
                <span key={skill} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">{skill}</span>
              ))}
              {app.candidate.skills.length > 5 && (
                <span className="px-2 py-0.5 bg-secondary text-muted-foreground rounded-full text-xs">+{app.candidate.skills.length - 5}</span>
              )}
            </div>
          )}
          {/* AI reason */}
          {screening?.reason && (
            <p className="text-xs text-muted-foreground mt-2 ml-12 italic">"{screening.reason}"</p>
          )}
          {/* Strengths / Gaps */}
          {screening && (
            <div className="flex gap-4 mt-2 ml-12">
              {screening.strengths?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-emerald-600 mb-1">Strengths</p>
                  {screening.strengths.map((s, i) => (
                    <p key={i} className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" />{s}</p>
                  ))}
                </div>
              )}
              {screening.gaps?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-red-500 mb-1">Gaps</p>
                  {screening.gaps.map((g, i) => (
                    <p key={i} className="text-xs text-muted-foreground flex items-center gap-1"><XCircle className="w-3 h-3 text-red-400" />{g}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side: status + action */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isInterested ? 'bg-emerald-500/20 text-emerald-600' :
            isRejected ? 'bg-red-500/15 text-red-500' :
            app.status === 'Applied' ? 'bg-primary/20 text-primary' :
            'bg-chart-3/20 text-chart-3'
          }`}>
            {isRejected ? 'Not Proceeding' : isInterested ? '⭐ Interested' : app.status}
          </span>
          {!isInterested && !isRejected && (
            <Button size="sm" variant="outline" onClick={() => onUpdateStatus(app.id, 'Viewed by Company')}
              className="text-xs h-7">
              <Eye className="w-3 h-3 mr-1" /> Mark Viewed
            </Button>
          )}
          {isInterested && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="w-3 h-3 text-emerald-500" /> Acceptance email sent
            </div>
          )}
          {isRejected && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="w-3 h-3 text-red-400" /> Rejection email sent
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
