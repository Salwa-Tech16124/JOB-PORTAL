import React, { useState, useEffect, useRef } from 'react';
import { User, Save, ArrowLeft, AlertCircle, CheckCircle, Sparkles, Target, Edit3, UserCog } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    // Load user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setFormData({
          name: parsedUser.name || '',
          role: parsedUser.role || '',
          skills: Array.isArray(parsedUser.skills) ? parsedUser.skills : [],
          experience: parsedUser.experience || '',
          bio: parsedUser.bio || '',
          education: parsedUser.education || ''
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
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

      const updatedUser = {
        ...user,
        ...formData
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success('Profile saved successfully!', 'Success');
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

      {/* Analytics Section - Keep Original Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Left Col: Analysis */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-1 flex flex-col gap-6"
        >
          {/* Profile Strength Card */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-primary" /> 
                Profile Strength
              </h3>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className={`text-4xl font-bold ${getScoreColor(profileCompletion)}`}>
                    {profileCompletion}
                    <span className="text-lg text-muted-foreground/50">/100</span>
                  </span>
                </div>
                <div className="w-full h-3 bg-muted/30 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${profileCompletion}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full transition-all duration-1000 ease-out shadow-lg ${profileCompletion > 70 ? 'bg-emerald-500' : profileCompletion > 40 ? 'bg-amber-500' : 'bg-destructive'}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills Card */}
          <Card className="bg-primary/5 border-primary/20 shadow-sm backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-primary" />
                Skills ({formData.skills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {formData.skills.length > 0 ? (
                  formData.skills.map((skill, index) => (
                    <motion.div
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Badge 
                        variant="secondary" 
                        className="px-3 py-1.5 text-sm font-semibold shadow-sm"
                      >
                        <CheckCircle className="w-3 h-3 mr-1.5 text-primary/80" />
                        {skill}
                      </Badge>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No skills added yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Info Card */}
          <Card className="bg-secondary/5 border-secondary/20 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-secondary" />
                Profile Info
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">Name</p>
                  <p className="text-foreground font-medium">{formData.name || 'Not added'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">Email</p>
                  <p className="text-foreground font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">Role</p>
                  <p className="text-foreground font-medium">{user?.role || 'Not defined'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Col: Status */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 flex flex-col gap-6"
        >
          {/* Completion Status */}
          <Card className="h-full shadow-lg border border-white/5">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6">Profile Status</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20">
                  <div className="flex items-center gap-3">
                    {formData.name.trim() ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-destructive" />}
                    <span className="font-medium">Full Name</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{formData.name ? '✓' : '×'}</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20">
                  <div className="flex items-center gap-3">
                    {formData.skills.length > 0 ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-destructive" />}
                    <span className="font-medium">Skills Added</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{formData.skills.length > 0 ? `${formData.skills.length}` : '×'}</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20">
                  <div className="flex items-center gap-3">
                    {formData.experience.trim() ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-destructive" />}
                    <span className="font-medium">Experience</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{formData.experience ? '✓' : '×'}</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20">
                  <div className="flex items-center gap-3">
                    {formData.bio.trim() ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-destructive" />}
                    <span className="font-medium">Bio/Summary</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{formData.bio ? '✓' : '×'}</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20">
                  <div className="flex items-center gap-3">
                    {formData.education.trim() ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-destructive" />}
                    <span className="font-medium">Education</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{formData.education ? '✓' : '×'}</span>
                </div>
              </div>

              <Button
                onClick={scrollToEdit}
                className="w-full mt-6 bg-gradient-to-r from-primary to-primary/80"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit & Complete Profile
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Edit Form Section - Scroll Target */}
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
