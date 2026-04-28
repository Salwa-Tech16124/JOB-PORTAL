import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, TrendingUp, ChevronRight, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import JobCard from '../components/JobCard';
import LoginModal from './Login';
import SignupModal from './Signup';
import { api } from '../api';

function JobBoard() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [sortBy, setSortBy] = useState('match'); // 'match' or 'salary'
  const [applied, setApplied] = useState(new Set());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signupModalOpen, setSignupModalOpen] = useState(false);

  // Fetch live jobs and applications from backend
  useEffect(() => {
    const checkLoginAndFetchData = async () => {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      const isLogged = !!(user && token);
      setIsLoggedIn(isLogged);

      try {
        setIsLoading(true);
        // Fetch Jobs
        const jobsRes = await api.getJobs();
        if (jobsRes.success) {
          setJobs(jobsRes.data);
        }

        // If logged in, fetch user's previous applications to update "Applied" button UI
        if (isLogged) {
          const appsRes = await api.getApplications();
          if (appsRes.success) {
            const appliedJobIds = new Set(appsRes.data.map(app => app.jobId));
            setApplied(appliedJobIds);
          }
        }
      } catch (err) {
        toast.error('Failed to communicate with server');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkLoginAndFetchData();
    
    // Listen for login success from modal
    const handleLoginSuccess = () => checkLoginAndFetchData();
    window.addEventListener('loginSuccess', handleLoginSuccess);
    return () => window.removeEventListener('loginSuccess', handleLoginSuccess);
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(location.search).get('q') || '';
    if (query && query !== searchTerm) {
      setSearchTerm(query);
    }
  }, [location.search]);

  // Get all available skills dynamically
  const allSkills = Array.from(new Set(jobs.flatMap(job => job.skills || []))).sort();

  const searchQuery = searchTerm.trim().toLowerCase();

  const searchMatches = jobs.filter(job => {
    return (
      searchQuery === '' ||
      job.title.toLowerCase().includes(searchQuery) ||
      job.company.toLowerCase().includes(searchQuery) ||
      (job.skills || []).some(skill => skill.toLowerCase().includes(searchQuery))
    );
  });

  const filteredJobs = searchMatches
    .filter(job => {
      return selectedSkills.length === 0 || 
        selectedSkills.some(skill => (job.skills || []).includes(skill));
    })
    .sort((a, b) => {
      if (sortBy === 'match') {
        return b.match - a.match;
      }
      return 0;
    });

  const searchSuggestions = searchQuery === ''
    ? []
    : jobs.filter(job => (
        job.title.toLowerCase().includes(searchQuery) ||
        job.company.toLowerCase().includes(searchQuery) ||
        (job.skills || []).some(skill => skill.toLowerCase().includes(searchQuery))
      )).slice(0, 5);

  // Featured Jobs (Top 4 by match)
  const featuredJobs = [...jobs].sort((a, b) => b.match - a.match).slice(0, 4);

  const handleToggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleApply = async (jobId) => {
    if (!isLoggedIn) {
      setLoginModalOpen(true);
      return;
    }
    
    if (applied.has(jobId)) {
      toast.info('You have already applied to this position.', 'Already Applied');
      return;
    }

    try {
      const res = await api.applyJob(jobId);
      if (res.success) {
        setApplied(prev => {
          const newSet = new Set(prev);
          newSet.add(jobId);
          return newSet;
        });
        const jobName = jobs.find(j => j.id === jobId)?.title || 'Job';
        toast.success(`Your application for ${jobName} has been submitted!`, 'Application Sent');
      } else {
        toast.error(res.message || 'Failed to apply');
      }
    } catch (e) {
      toast.error('Server connection failed');
    }
  };

  const handleEnterDashboard = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      setLoginModalOpen(true);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Landing Page Hero Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 px-4 py-20"
        >
          <div className="text-center max-w-2xl mx-auto space-y-8">
            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 justify-center">
                <img src="/logo.png" alt="JobPortal Logo" className="h-8 w-auto object-contain" />
                <span className="font-semibold text-lg text-foreground">JobPortal</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
                Your Next Opportunity Awaits
              </h1>
              <p className="text-xl text-muted-foreground">
                Discover perfect job matches tailored to your skills and experience
              </p>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8"
            >
              {[
                { icon: '🎯', title: 'Smart Matching', desc: 'AI-powered job recommendations' },
                { icon: '📊', title: 'Career Insights', desc: 'Track trends and opportunities' },
                { icon: '🚀', title: 'Quick Apply', desc: 'Apply with one click' }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all"
                >
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex gap-4 justify-center flex-wrap"
            >
              <Button 
                size="lg"
                onClick={handleEnterDashboard}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 px-8 py-6 text-lg"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Enter Dashboard
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => setSignupModalOpen(true)}
                className="px-8 py-6 text-lg"
              >
                Create Account
              </Button>
            </motion.div>

            {/* Sign In Link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground"
            >
              Already have an account?{' '}
              <button 
                onClick={() => setLoginModalOpen(true)}
                className="text-primary hover:underline font-semibold transition-all"
              >
                Sign In
              </button>
            </motion.p>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center gap-6 flex-wrap text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>5000+ Active Jobs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Trusted by Professionals</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Modals */}
        <LoginModal 
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onLoginSuccess={() => {
            // Dispatch event to trigger App re-render
            window.dispatchEvent(new Event('loginSuccess'));
            // Redirect to dashboard
            navigate('/dashboard');
          }}
        />
        <SignupModal 
          isOpen={signupModalOpen}
          onClose={() => setSignupModalOpen(false)}
          onSignupSuccess={() => {
            // Dispatch event to trigger App re-render
            window.dispatchEvent(new Event('loginSuccess'));
            // Redirect to dashboard
            navigate('/dashboard');
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 py-6">
        <div className="space-y-8 pb-12">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-2"
          >
        <h1 className="text-4xl font-bold">Job Opportunities</h1>
        <p className="text-muted-foreground text-lg">
          {filteredJobs.length} {filteredJobs.length === 1 ? 'position' : 'positions'} matching your profile
        </p>
      </motion.div>

      {/* Featured Jobs Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-orange-500" />
            Featured Opportunities
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth">
            {featuredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex-shrink-0"
              >
                <div className="w-72 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 hover:border-primary/40 transition-all cursor-pointer">
                  <div className="mb-3">
                    <h3 className="font-bold text-lg">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-semibold">
                      {job.match}% Match
                    </span>
                    <span className="text-sm font-semibold text-emerald-500">{job.salary}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(job.skills || []).slice(0, 3).map(skill => (
                      <span key={skill} className="text-xs bg-background/50 text-muted-foreground px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                    {(job.skills || []).length > 3 && (
                      <span className="text-xs text-muted-foreground px-2 py-1">+{(job.skills || []).length - 3}</span>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleApply(job.id)}
                    variant={applied.has(job.id) ? "outline" : "default"}
                  >
                    {applied.has(job.id) ? '✅ Applied' : 'Apply Now'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="space-y-4"
      >
        {/* Search Bar */}
        <div className="space-y-2 relative">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/60" />
              <Input 
                placeholder="Search by job title, company, or skill..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-12 py-6 text-[15px]"
              />
            </div>
            <Button 
              size="sm"
              onClick={() => setSearchTerm(searchTerm.trim())}
              className="min-w-[120px] py-6"
            >
              Search
            </Button>
          </div>

          {searchTerm.trim().length > 0 && (
            <div className="absolute left-0 right-0 z-20 mt-1 bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
              {searchSuggestions.length > 0 ? (
                searchSuggestions.map(job => (
                  <button
                    key={job.id}
                    onClick={() => setSearchTerm(job.title)}
                    className="w-full text-left px-4 py-3 hover:bg-primary/10 transition-colors"
                  >
                    <div className="flex justify-between items-center gap-3">
                      <span className="font-medium text-foreground">{job.title}</span>
                      <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Job</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-muted-foreground">No results found</div>
              )}
            </div>
          )}
        </div>

        {/* Skill Filters */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-semibold text-muted-foreground">Filter by Skills</span>
            {selectedSkills.length > 0 && (
              <span className="ml-auto text-xs bg-primary/20 text-primary px-3 py-1 rounded-full">
                {selectedSkills.length} selected
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {allSkills.map(skill => (
              <motion.button
                key={skill}
                onClick={() => handleToggleSkill(skill)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedSkills.includes(skill)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background/50 border border-input/50 text-muted-foreground hover:border-input'
                }`}
              >
                {skill}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Button 
            size="sm"
            variant={sortBy === 'match' ? 'default' : 'outline'}
            onClick={() => setSortBy('match')}
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            Best Match
          </Button>
          <Button 
            size="sm"
            variant={sortBy === 'salary' ? 'default' : 'outline'}
            onClick={() => setSortBy('salary')}
          >
            Salary
          </Button>
        </div>
      </motion.div>

      {/* Jobs List */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        {filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <JobCard 
                  job={job} 
                  onApply={() => handleApply(job.id)}
                  isApplied={applied.has(job.id)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground text-lg mb-2">No results found</p>
            <p className="text-muted-foreground text-sm">Try adjusting your filters or search term</p>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedSkills([]);
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Modals - available when logged in */}
      <LoginModal 
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsLoggedIn(true);
          toast.success('Logged in successfully!', 'Welcome back');
        }}
      />
      <SignupModal 
        isOpen={signupModalOpen}
        onClose={() => setSignupModalOpen(false)}
        onSignupSuccess={() => {
          setIsLoggedIn(true);
          toast.success('Account created successfully!', 'Welcome');
        }}
      />
        </div>
      </div>
    </div>
  );
}

export default JobBoard;
