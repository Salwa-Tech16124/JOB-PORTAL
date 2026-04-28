import React, { useState, useEffect, useRef } from 'react';
import { User, Save, ArrowLeft, AlertCircle, AlertTriangle, BarChart3, Brain, CheckCircle, Sparkles, Target, Edit3, UserCog, UploadCloud, FileText, Lightbulb, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { useToast } from '../context/ToastContext';

const CAREER_ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Mobile App Developer',
  'Data Scientist',
  'Data Analyst',
  'Product Manager',
  'UX/UI Designer',
  'DevOps Engineer',
  'QA/Test Engineer',
  'Business Analyst',
  'Project Manager',
  'Scrum Master',
  'Database Administrator',
  'Systems Administrator',
  'Network Engineer',
  'Cybersecurity Engineer',
  'Cloud Architect',
  'Machine Learning Engineer',
  'AI/ML Specialist',
  'Recruiter/HR Manager',
  'Sales Manager',
  'Marketing Manager',
  'Business Development',
  'Consultant',
  'Freelancer',
  'Entrepreneur/Founder',
  'Other'
];

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

export default function Profile() {
  const navigate = useNavigate();
  const toast = useToast();
  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    skills: [],
    experience: '',
    bio: '',
    education: ''
  });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [autoFixLoading, setAutoFixLoading] = useState(false);
  const [uploadedResume, setUploadedResume] = useState(null);
  const [uploadedResumeName, setUploadedResumeName] = useState('');
  const [improvementResult, setImprovementResult] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const syncStoredUser = () => {
      const userData = localStorage.getItem('user');
      if (!userData) return;
      let parsedUser = {};

      try {
        parsedUser = JSON.parse(userData) || {};
      } catch (e) {
        console.error('Error parsing user data:', e);
      }

      if (Object.keys(parsedUser).length > 0) {
        setUser(parsedUser);
        setFormData({
          name: parsedUser.name || '',
          role: parsedUser.role || '',
          skills: Array.isArray(parsedUser.skills) ? parsedUser.skills : [],
          experience: parsedUser.experience || '',
          bio: parsedUser.bio || '',
          education: parsedUser.education || ''
        });
      }
    };

    const loadProfile = async () => {
      syncStoredUser();

      try {
        const profileResponse = await api.getProfile();
        if (profileResponse.success && profileResponse.data) {
          const storedUser = localStorage.getItem('user');
          let parsedUser = {};

          if (storedUser) {
            try {
              parsedUser = JSON.parse(storedUser) || {};
            } catch (e) {
              console.error('Error parsing stored user:', e);
            }
          }

          const profileData = profileResponse.data || {};
          const mergedUser = {
            ...parsedUser,
            ...profileData,
            name: profileData.name?.trim() ? profileData.name : (parsedUser.name || ''),
            profilePicture: profileData.profilePicture || parsedUser.profilePicture || '',
            skills: Array.isArray(profileData.skills) ? profileData.skills : (parsedUser.skills || [])
          };
          localStorage.setItem('user', JSON.stringify(mergedUser));
          setUser(mergedUser);
          setFormData({
            name: mergedUser.name || '',
            role: mergedUser.role || '',
            skills: Array.isArray(mergedUser.skills) ? mergedUser.skills : [],
            experience: mergedUser.experience || '',
            bio: mergedUser.bio || '',
            education: mergedUser.education || ''
          });
        }
      } catch (error) {
        console.error('Failed to load persisted profile:', error);
      }
    };

    loadProfile();

    const handleStoredUserUpdate = () => {
      syncStoredUser();
    };

    window.addEventListener('loginSuccess', handleStoredUserUpdate);
    window.addEventListener('userUpdated', handleStoredUserUpdate);

    return () => {
      window.removeEventListener('loginSuccess', handleStoredUserUpdate);
      window.removeEventListener('userUpdated', handleStoredUserUpdate);
    };
  }, [navigate]);

  // Calculate profile completion
  useEffect(() => {
    const requiredFields = {
      name: formData.name.trim().length > 0,
      role: formData.role.trim().length > 0,
      skills: Array.isArray(formData.skills) && formData.skills.length > 0,
      experience: formData.experience.trim().length > 0,
      bio: formData.bio.trim().length > 0,
      education: formData.education.trim().length > 0
    };

    const filledFields = Object.values(requiredFields).filter(v => v).length;
    const completion = Math.round((filledFields / Object.keys(requiredFields).length) * 100);
    setProfileCompletion(completion);
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name.trim()) {
        toast.error('Name is required', 'Validation Error');
        setLoading(false);
        return;
      }

      const profileResponse = await api.updateProfile(formData);
      if (profileResponse.success && profileResponse.data) {
        const updatedUser = {
          ...user,
          ...profileResponse.data,
          ...formData
        };

        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        window.dispatchEvent(new Event('userUpdated'));
        toast.success('Profile saved successfully!', 'Success');
      } else {
        toast.error(profileResponse.message || 'Failed to save profile', 'Error');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error('Failed to save profile', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const scrollToEdit = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getScoreColor = (score) => {
    if (score > 70) return 'text-emerald-500';
    if (score > 40) return 'text-amber-500';
    return 'text-destructive';
  };

  const getResumeScoreColor = (score) => {
    if (score > 70) return 'bg-emerald-500';
    if (score > 40) return 'bg-amber-500';
    return 'bg-destructive';
  };

  const getResumeScoreLabel = (score) => {
    if (score > 70) return 'Strong';
    if (score > 40) return 'متوسط';
    return 'Weak';
  };

  const computeResumeScore = (analysis) => {
    if (!analysis) return 0;
    let score = 85;
    score -= (analysis.missingSections?.length || 0) * 14;
    score -= (analysis.skillGaps?.length || 0) * 8;
    if (analysis.summaryStrength === 'Weak summary') score -= 12;
    if (analysis.summaryStrength === 'Missing summary') score -= 20;
    return Math.min(100, Math.max(0, score));
  };

  const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const base64 = dataUrl?.toString().split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const triggerResumeUpload = () => {
    fileInputRef.current?.click();
  };

  const handleResumeFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const supportedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!supportedTypes.includes(file.type)) {
      toast.error('Resume upload accepts only PDF or DOCX files.', 'Unsupported file');
      event.target.value = '';
      return;
    }

    try {
      const fileData = await readFileAsBase64(file);
      setUploadedResume({ fileName: file.name, fileType: file.type, fileData });
      setUploadedResumeName(file.name);
      setResumeAnalysis(null);
      setSuggestions(null);
      setImprovementResult(null);
      toast.success('Resume ready to analyze.', 'Success');
    } catch (err) {
      console.error('Resume read failed:', err);
      toast.error('Could not read resume file. Please try again.', 'Error');
    } finally {
      event.target.value = '';
    }
  };

  const handleAnalyzeResume = async () => {
    if (!uploadedResume) return;

    setResumeLoading(true);
    setResumeAnalysis(null);
    setSuggestions(null);
    setImprovementResult(null);

    try {
      const response = await api.analyzeResume(uploadedResume);
      if (response.success && response.data) {
        setResumeAnalysis(response.data);
        toast.success('Resume analyzed successfully!', 'Success');
      } else {
        toast.error(response.message || 'Failed to analyze resume', 'Error');
      }
    } catch (err) {
      console.error('Resume analysis failed:', err);
      toast.error('Resume analysis failed. Please try again.', 'Error');
    } finally {
      setResumeLoading(false);
    }
  };

  const handleGetSuggestions = async () => {
    setSuggestionLoading(true);
    setSuggestions(null);

    try {
      const response = await api.getProfileSuggestions({ profile: formData, resumeAnalysis });
      if (response.success && response.data) {
        setSuggestions(response.data);
      } else {
        toast.error(response.message || 'Failed to generate suggestions', 'Error');
      }
    } catch (err) {
      console.error('Suggestion generation failed:', err);
      toast.error('Failed to generate suggestions', 'Error');
    } finally {
      setSuggestionLoading(false);
    }
  };

  const handleAutoFix = async () => {
    if (!resumeAnalysis) return;
    setAutoFixLoading(true);

    try {
      const response = await api.improveResume({ profile: formData, resumeAnalysis });
      if (response.success && response.data) {
        const improvement = response.data;
        const oldSummary = resumeAnalysis.extractedSummary || formData.bio || '';
        setFormData((prev) => ({
          ...prev,
          bio: improvement.improvedSummary || prev.bio,
          experience: improvement.improvedExperience || prev.experience,
          education: improvement.improvedEducation || prev.education,
          skills: Array.from(new Set([...(prev.skills || []), ...(improvement.addedSkills || [])]))
        }));
        setImprovementResult({
          oldSummary,
          newSummary: improvement.improvedSummary || oldSummary
        });
        setSuggestions((prev) => prev ? { ...prev, betterSummary: improvement.improvedSummary || prev.betterSummary } : prev);
        toast.success('Resume improvements applied to your profile.', 'Success');
      } else {
        toast.error(response.message || 'Failed to improve resume', 'Error');
      }
    } catch (err) {
      console.error('Resume auto-fix failed:', err);
      toast.error('Auto-fix failed. Please try again.', 'Error');
    } finally {
      setAutoFixLoading(false);
    }
  };

  const resumeScore = computeResumeScore(resumeAnalysis);
  const resumeLabel = getResumeScoreLabel(resumeScore);
  const canAnalyzeResume = Boolean(uploadedResume);
  const canGetSuggestions = Boolean(resumeAnalysis);
  const canImproveResume = Boolean(resumeAnalysis);

  // Show empty state if no data
  if (profileCompletion === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">AI Profile Architect</h1>
              <p className="text-muted-foreground mt-1">Build your professional profile</p>
            </div>
          </div>
        </motion.div>

        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Profile Incomplete</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Add your profile details to unlock AI insights and career opportunities.
          </p>
          <Button
            onClick={scrollToEdit}
            className="bg-gradient-to-r from-primary to-primary/80"
            size="lg"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Complete Your Profile
          </Button>
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-card/75 p-6 shadow-sm">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleResumeFileChange}
            className="hidden"
          />
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Resume Architect</h3>
                <p className="text-sm text-muted-foreground">Upload your resume and get instant structure feedback before you finish your profile.</p>
              </div>
              <UploadCloud className="w-6 h-6 text-primary" />
            </div>
            <Button type="button" onClick={triggerResumeUpload} className="w-full justify-center gap-2" size="lg">
              <FileText className="w-4 h-4" />
              Upload Resume
            </Button>
            {uploadedResumeName && (
              <p className="text-sm text-muted-foreground">Uploaded file: {uploadedResumeName}</p>
            )}
            {resumeLoading && (
              <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 text-sm text-foreground">
                Analyzing resume, please wait...
              </div>
            )}
            {resumeAnalysis && (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-secondary/5 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Summary</p>
                    <p className="mt-2 text-sm text-foreground">{resumeAnalysis.extractedSummary || 'No summary section found in uploaded resume.'}</p>
                  </div>
                  <div className="rounded-2xl bg-secondary/5 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Strength</p>
                    <p className="mt-2 text-sm font-semibold text-foreground">{resumeAnalysis.summaryStrength}</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-secondary/5 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Skills</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(resumeAnalysis.extractedSkills.length ? resumeAnalysis.extractedSkills : ['No skills extracted yet']).map((skill) => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-secondary/5 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Missing Sections</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(resumeAnalysis.missingSections.length ? resumeAnalysis.missingSections : ['None']).map((section) => (
                        <Badge key={section} variant="outline">{section}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                {resumeAnalysis.skillGaps?.length > 0 && (
                  <div className="rounded-2xl bg-secondary/5 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Skill gaps</p>
                    <ul className="mt-3 list-disc list-inside text-sm text-foreground space-y-1">
                      {resumeAnalysis.skillGaps.map((gap) => (
                        <li key={gap}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    onClick={handleGetSuggestions}
                    disabled={suggestionLoading}
                    className="flex-1 gap-2"
                  >
                    <Lightbulb className="w-4 h-4" />
                    {suggestionLoading ? 'Generating...' : 'Get AI Suggestions'}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAutoFix}
                    disabled={autoFixLoading}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    {autoFixLoading ? 'Improving...' : 'Improve Resume'}
                  </Button>
                </div>
                {suggestions && (
                  <div className="rounded-2xl bg-background/50 border border-white/10 p-4 space-y-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">What to improve</p>
                      <ul className="mt-3 list-disc list-inside text-sm text-foreground space-y-1">
                        {suggestions.whatToImprove.map((note, index) => (
                          <li key={index}>{note}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">What to add</p>
                      <ul className="mt-3 list-disc list-inside text-sm text-foreground space-y-1">
                        {suggestions.whatToAdd.map((note, index) => (
                          <li key={index}>{note}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl bg-secondary/10 p-4">
                      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Better Summary</p>
                      <p className="mt-2 text-sm text-foreground">{suggestions.betterSummary}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Edit Form Section - Full Width Below */}
        <div ref={formRef} className="mt-12">
          <EditProfileForm
            formData={formData}
            skillInput={skillInput}
            loading={loading}
            profileCompletion={profileCompletion}
            onInputChange={handleInputChange}
            onSkillInputChange={setSkillInput}
            onAddSkill={handleAddSkill}
            onRemoveSkill={handleRemoveSkill}
            onSave={handleSave}
            onCancel={() => navigate('/dashboard')}
          />
        </div>
      </div>
    );
  }

  // Full UI with analytics + edit section
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Profile Architect</h1>
            <p className="text-muted-foreground mt-1">Let the AI extract your hidden superpowers.</p>
          </div>
        </div>
        <Button 
          onClick={scrollToEdit}
          size="sm"
          className="gap-2"
        >
          <Edit3 className="w-4 h-4" />
          Edit Profile
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <Card className="shadow-sm border border-white/10">
            <CardHeader className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">Resume Architect</CardTitle>
                  <p className="text-sm text-muted-foreground">Upload, analyze, review, and improve your resume in one clean flow.</p>
                </div>
                <UploadCloud className="w-6 h-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                onChange={handleResumeFileChange}
                className="hidden"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  onClick={triggerResumeUpload}
                  className="w-full justify-center gap-2"
                  size="lg"
                >
                  <FileText className="w-4 h-4" />
                  Upload Resume
                </Button>
                <Button
                  type="button"
                  onClick={handleAnalyzeResume}
                  variant="outline"
                  disabled={!canAnalyzeResume || resumeLoading}
                  className="w-full justify-center gap-2"
                  size="lg"
                >
                  <Sparkles className="w-4 h-4" />
                  Analyze Resume
                </Button>
                <Button
                  type="button"
                  onClick={handleGetSuggestions}
                  variant="outline"
                  disabled={!canGetSuggestions || suggestionLoading}
                  className="w-full justify-center gap-2"
                  size="lg"
                >
                  <Lightbulb className="w-4 h-4" />
                  Get Suggestions
                </Button>
                <Button
                  type="button"
                  onClick={handleAutoFix}
                  variant="outline"
                  disabled={!canImproveResume || autoFixLoading}
                  className="w-full justify-center gap-2"
                  size="lg"
                >
                  <Wand2 className="w-4 h-4" />
                  Improve Resume
                </Button>
              </div>

              {uploadedResumeName && (
                <div className="rounded-2xl border border-muted/20 bg-muted/5 p-4 text-sm text-foreground">
                  <p className="font-medium">Ready to analyze</p>
                  <p className="text-muted-foreground mt-1">{uploadedResumeName}</p>
                </div>
              )}

              {resumeLoading && (
                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 text-sm text-foreground">
                  Analyzing resume, please wait...
                </div>
              )}

              {resumeAnalysis && (
                <div className="space-y-4">
                  <Card className="rounded-3xl border border-white/10 bg-background/60">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Resume Score</p>
                          <div className="mt-2 flex items-center gap-3">
                            <span className="text-3xl font-semibold text-foreground">{resumeScore}</span>
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${resumeScore > 70 ? 'bg-emerald-500/10 text-emerald-500' : resumeScore > 40 ? 'bg-amber-500/10 text-amber-500' : 'bg-destructive/10 text-destructive'}`}>
                              {resumeLabel}
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <div>0</div>
                          <div className="mt-2">100</div>
                        </div>
                      </div>
                      <div className="mt-4 h-3 w-full rounded-full bg-muted/20 overflow-hidden">
                        <div
                          className={`${getResumeScoreColor(resumeScore)} h-full rounded-full transition-all duration-300`}
                          style={{ width: `${resumeScore}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="rounded-3xl border border-white/10">
                      <CardHeader className="p-5 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <CardTitle className="text-sm font-semibold">Extracted Skills</CardTitle>
                      </CardHeader>
                      <CardContent className="p-5">
                        <div className="flex flex-wrap gap-2">
                          {resumeAnalysis.extractedSkills.length > 0 ? (
                            resumeAnalysis.extractedSkills.map(skill => (
                              <Badge key={skill} variant="secondary">{skill}</Badge>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No skills were detected in the uploaded resume.</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="rounded-3xl border border-white/10">
                      <CardHeader className="p-5 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <CardTitle className="text-sm font-semibold">Missing Sections</CardTitle>
                      </CardHeader>
                      <CardContent className="p-5">
                        <div className="flex flex-wrap gap-2">
                          {resumeAnalysis.missingSections.length > 0 ? (
                            resumeAnalysis.missingSections.map(section => (
                              <Badge key={section} variant="outline">{section}</Badge>
                            ))
                          ) : (
                            <Badge variant="secondary">None</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="rounded-3xl border border-white/10">
                      <CardHeader className="p-5 flex items-center gap-3">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        <CardTitle className="text-sm font-semibold">Skill Gaps</CardTitle>
                      </CardHeader>
                      <CardContent className="p-5">
                        {resumeAnalysis.skillGaps.length > 0 ? (
                          <ul className="list-disc list-inside space-y-2 text-sm text-foreground">
                            {resumeAnalysis.skillGaps.map((gap) => (
                              <li key={gap}>{gap}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">Resume matches the core skills for your role.</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="rounded-3xl border border-white/10">
                      <CardHeader className="p-5 flex items-center gap-3">
                        <Brain className="w-5 h-5 text-violet-500" />
                        <CardTitle className="text-sm font-semibold">Summary Feedback</CardTitle>
                      </CardHeader>
                      <CardContent className="p-5">
                        <p className="text-sm font-medium text-foreground">{resumeAnalysis.summaryStrength}</p>
                        <p className="mt-3 text-sm text-muted-foreground">
                          {resumeAnalysis.extractedSummary || 'A stronger summary will help your resume stand out in the first section.'}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {improvementResult && (
                    <Card className="rounded-3xl border border-white/10">
                      <CardHeader className="p-5">
                        <CardTitle className="text-lg">Before / After</CardTitle>
                      </CardHeader>
                      <CardContent className="p-5 grid gap-4 lg:grid-cols-2">
                        <div className="rounded-2xl bg-secondary/5 p-4">
                          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Old Summary</p>
                          <p className="mt-3 text-sm text-foreground whitespace-pre-line">{improvementResult.oldSummary || 'No existing summary available.'}</p>
                        </div>
                        <div className="rounded-2xl bg-primary/5 p-4">
                          <p className="text-sm uppercase tracking-[0.2em] text-primary">Improved Summary</p>
                          <p className="mt-3 text-sm text-foreground whitespace-pre-line">{improvementResult.newSummary}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div ref={formRef}>
            <EditProfileForm
              formData={formData}
              skillInput={skillInput}
              loading={loading}
              profileCompletion={profileCompletion}
              onInputChange={handleInputChange}
              onSkillInputChange={setSkillInput}
              onAddSkill={handleAddSkill}
              onRemoveSkill={handleRemoveSkill}
              onSave={handleSave}
              onCancel={() => navigate('/dashboard')}
            />
          </div>
        </motion.div>
      </div>

    </div>
  );
}

// Reusable Edit Form Component
function EditProfileForm({
  formData,
  skillInput,
  loading,
  profileCompletion,
  onInputChange,
  onSkillInputChange,
  onAddSkill,
  onRemoveSkill,
  onSave,
  onCancel
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl p-8 border border-primary/10"
    >
      <h2 className="text-2xl font-bold text-foreground mb-8">Edit Your Profile</h2>

      <form onSubmit={onSave} className="space-y-6">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Full Name *</label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={onInputChange}
            placeholder="Enter your full name"
            className="w-full"
          />
        </div>

        {/* Role Field */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Career Role *</label>
          <div className="relative">
            <UserCog className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/60 z-10" />
            <select
              name="role"
              value={formData.role}
              onChange={onInputChange}
              className="bg-background/50 border-input/50 flex h-12 w-full rounded-lg border px-3 py-2 text-sm shadow-sm backdrop-blur-sm transition-all duration-300 outline-none pl-12 hover:bg-background/80 focus-visible:bg-background focus-visible:border-ring focus-visible:ring-ring/50 appearance-none cursor-pointer"
            >
              <option value="">Select your career role</option>
              {CAREER_ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Skills Field */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Skills</label>
          <div className="flex gap-2 mb-3">
            <Input
              type="text"
              value={skillInput}
              onChange={(e) => onSkillInputChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAddSkill())}
              placeholder="Add a skill (e.g., React, Python)"
              className="flex-1"
            />
            <Button
              type="button"
              onClick={onAddSkill}
              variant="outline"
              className="px-4"
            >
              Add
            </Button>
          </div>

          {formData.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <div
                  key={skill}
                  className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2 group hover:bg-destructive/20 transition-colors cursor-pointer"
                  onClick={() => onRemoveSkill(skill)}
                >
                  {skill}
                  <span className="text-primary group-hover:text-destructive">×</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Experience Field */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Experience</label>
          <Textarea
            name="experience"
            value={formData.experience}
            onChange={onInputChange}
            placeholder="Describe your professional experience..."
            className="w-full min-h-32"
          />
        </div>

        {/* Bio Field */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Bio/Summary</label>
          <Textarea
            name="bio"
            value={formData.bio}
            onChange={onInputChange}
            placeholder="Tell us about yourself..."
            className="w-full min-h-24"
          />
        </div>

        {/* Education Field */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Education</label>
          <Textarea
            name="education"
            value={formData.education}
            onChange={onInputChange}
            placeholder="Degree, Institution, Graduation Year..."
            className="w-full min-h-24"
          />
        </div>

        {/* Save Button */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={loading || !formData.name.trim()}
            className="flex-1 gap-2"
            size="lg"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Profile'}
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            size="lg"
          >
            Cancel
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
