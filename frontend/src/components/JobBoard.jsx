import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, TrendingUp, ChevronRight, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import JobCard from './JobCard';

// Mock Job Data
const MOCK_JOBS = [
  {
    id: 1,
    title: 'Senior React Developer',
    company: 'TechCorp Inc',
    location: 'San Francisco, CA',
    salary: '$150k - $200k',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    match: 95,
    description: 'Build scalable web applications with React and TypeScript'
  },
  {
    id: 2,
    title: 'Full Stack Engineer',
    company: 'StartupXYZ',
    location: 'Remote',
    salary: '$120k - $160k',
    skills: ['JavaScript', 'React', 'Python', 'AWS'],
    match: 88,
    description: 'Lead frontend and backend development for our platform'
  },
  {
    id: 3,
    title: 'Backend Developer',
    company: 'CloudSys Ltd',
    location: 'New York, NY',
    salary: '$130k - $170k',
    skills: ['Node.js', 'PostgreSQL', 'Docker', 'Kubernetes'],
    match: 82,
    description: 'Design and maintain scalable backend systems'
  },
  {
    id: 4,
    title: 'DevOps Engineer',
    company: 'InfraCloud',
    location: 'Seattle, WA',
    salary: '$140k - $180k',
    skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
    match: 78,
    description: 'Optimize deployment pipelines and infrastructure'
  },
  {
    id: 5,
    title: 'Data Engineer',
    company: 'DataMind',
    location: 'Boston, MA',
    salary: '$135k - $175k',
    skills: ['Python', 'SQL', 'Apache Spark', 'AWS'],
    match: 72,
    description: 'Build data pipelines and analytics solutions'
  },
  {
    id: 6,
    title: 'Frontend Specialist',
    company: 'DesignStudio',
    location: 'Austin, TX',
    salary: '$110k - $150k',
    skills: ['React', 'Tailwind', 'Figma', 'JavaScript'],
    match: 92,
    description: 'Create beautiful and responsive user interfaces'
  },
  {
    id: 7,
    title: 'ML Engineer',
    company: 'AI Labs',
    location: 'San Jose, CA',
    salary: '$160k - $210k',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Data Science'],
    match: 68,
    description: 'Develop machine learning models and solutions'
  },
  {
    id: 8,
    title: 'Solutions Architect',
    company: 'Enterprise Co',
    location: 'Chicago, IL',
    salary: '$145k - $185k',
    skills: ['AWS', 'Azure', 'System Design', 'Leadership'],
    match: 75,
    description: 'Design enterprise-scale solutions for clients'
  }
];

function JobBoard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [sortBy, setSortBy] = useState('match'); // 'match' or 'salary'
  const [applied, setApplied] = useState(new Set());
  const [userNotLoggedIn, setUserNotLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      setUserNotLoggedIn(true);
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [navigate]);

  // Get all available skills
  const allSkills = Array.from(new Set(MOCK_JOBS.flatMap(job => job.skills))).sort();

  // Filter and Sort Jobs
  const filteredJobs = jobs
    .filter(job => {
      const matchesSearch = 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSkills = selectedSkills.length === 0 || 
        selectedSkills.some(skill => job.skills.includes(skill));
      
      return matchesSearch && matchesSkills;
    })
    .sort((a, b) => {
      if (sortBy === 'match') {
        return b.match - a.match;
      }
      return 0;
    });

  // Featured Jobs (Top 4 by match)
  const featuredJobs = [...jobs].sort((a, b) => b.match - a.match).slice(0, 4);

  const handleToggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleApply = (jobId) => {
    if (!localStorage.getItem('user')) {
      navigate('/login');
      return;
    }
    setApplied(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
        toast.info('Application withdrawn', 'Removed');
      } else {
        newSet.add(jobId);
        const job = MOCK_JOBS.find(j => j.id === jobId);
        toast.success(`Applied to ${job.title}!`, 'Application Sent');
      }
      return newSet;
    });
  };

  if (userNotLoggedIn) {
    return (
      <div className="flex items-center justify-center pt-20">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-yellow-500 mb-4">
              <AlertCircle className="w-6 h-6" />
              <span className="font-semibold">Please log in to view jobs</span>
            </div>
            <p className="text-muted-foreground mb-4">Redirecting to login...</p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
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
                    {job.skills.slice(0, 3).map(skill => (
                      <span key={skill} className="text-xs bg-background/50 text-muted-foreground px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span className="text-xs text-muted-foreground px-2 py-1">+{job.skills.length - 3}</span>
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
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/60" />
          <Input 
            placeholder="Search by job title or company..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-12 py-6 text-[15px]"
          />
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
        className="space-y-3"
      >
        {filteredJobs.length > 0 ? (
          <div className="space-y-3">
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
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
            <p className="text-muted-foreground text-lg mb-2">No jobs found</p>
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
    </div>
  );
}

export default JobBoard;
