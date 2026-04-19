import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Save, Loader2, CheckCircle, AlertCircle, UserCog } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

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

const AVAILABLE_SKILLS = [
  'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'PostgreSQL',
  'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Git', 'GraphQL',
  'REST API', 'SQL', 'Vue.js', 'Angular', 'CSS', 'HTML',
  'DevOps', 'CI/CD', 'Linux', 'Microservices', 'System Design',
  'Machine Learning', 'Data Science', 'Firebase', 'Redis'
];

function ProfileEditor({ isOpen, onClose, onSave }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    role: '',
    bio: '',
    email: '',
    location: '',
    experience: '',
    education: '',
    skills: [],
    certifications: []
  });

  const [newCert, setNewCert] = useState('');
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Load existing profile data
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setFormData(prev => ({
        ...prev,
        name: userData.name || '',
        email: userData.email || '',
        role: userData.role || '',
        title: userData.title || ''
      }));
    }
  }, [isOpen]);

  // Filter suggested skills
  useEffect(() => {
    if (skillInput.trim()) {
      const filtered = AVAILABLE_SKILLS.filter(
        skill => 
          skill.toLowerCase().includes(skillInput.toLowerCase()) &&
          !formData.skills.includes(skill)
      );
      setSuggestedSkills(filtered);
    } else {
      setSuggestedSkills([]);
    }
  }, [skillInput, formData.skills]);

  // Calculate profile strength
  const calculateStrength = () => {
    let strength = 0;
    if (formData.name) strength += 20;
    if (formData.role) strength += 10;
    if (formData.title) strength += 15;
    if (formData.email) strength += 10;
    if (formData.location) strength += 10;
    if (formData.experience) strength += 15;
    if (formData.skills.length > 0) strength += 15;
    if (formData.certifications.length > 0) strength += 5;
    return Math.min(strength, 100);
  };

  const handleAddSkill = (skill) => {
    if (!formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      setSkillInput('');
      setSuggestedSkills([]);
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleAddCertification = () => {
    if (newCert.trim() && !formData.certifications.includes(newCert)) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCert]
      }));
      setNewCert('');
    }
  };

  const handleRemoveCertification = (cert) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== cert)
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.role) {
        toast.error('Name, email, and career role are required', 'Validation Error');
        setLoading(false);
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Save to localStorage
      const userData = {
        ...formData,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        updateTime: new Date().toISOString()
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('profile', JSON.stringify(formData));

      toast.success('Profile saved successfully!', 'Profile Updated');
      setTimeout(() => {
        onSave && onSave(formData);
        onClose();
      }, 1000);
    } catch (err) {
      toast.error('Failed to save profile. Please try again.', 'Save Error');
    } finally {
      setLoading(false);
    }
  };

  const strength = calculateStrength();
  const strengthColor = strength >= 80 ? 'text-emerald-500' : strength >= 60 ? 'text-amber-500' : 'text-red-500';
  const strengthBg = strength >= 80 ? 'bg-emerald-500/20' : strength >= 60 ? 'bg-amber-500/20' : 'bg-red-500/20';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto"
          >
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border p-6 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold">Edit Your Profile</h2>
                <button 
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <CardContent className="p-6 space-y-6">
                {/* Profile Strength */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 rounded-lg border ${strengthBg} border-transparent`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-muted-foreground">Profile Strength</span>
                    <span className={`font-bold ${strengthColor}`}>{strength}%</span>
                  </div>
                  <div className="w-full bg-background/50 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${strength}%` }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className={`h-full rounded-full ${
                        strength >= 80 ? 'bg-emerald-500' : strength >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                    />
                  </div>
                </motion.div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">Name *</label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      className="py-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">Email *</label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className="py-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">Professional Title</label>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Senior React Developer"
                      className="py-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">Career Role *</label>
                    <div className="relative">
                      <UserCog className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/60 z-10" />
                      <select 
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="bg-background/50 border-input/50 flex h-12 w-full rounded-lg border px-3 py-2 text-sm shadow-sm backdrop-blur-sm transition-all duration-300 outline-none pl-12 hover:bg-background/80 focus-visible:bg-background focus-visible:border-ring focus-visible:ring-ring/50 appearance-none cursor-pointer"
                      >
                        <option value="">Select your career role</option>
                        {CAREER_ROLES.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">Location</label>
                    <Input
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g. San Francisco, CA"
                      className="py-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself..."
                      className="w-full bg-background/50 border border-input/50 rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring"
                      rows="3"
                    />
                  </div>
                </div>

                {/* Experience & Education */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Experience & Education</h3>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">Years of Experience</label>
                    <Input
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      placeholder="e.g. 5+ years in full-stack development"
                      className="py-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">Education</label>
                    <Input
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      placeholder="e.g. BS in Computer Science"
                      className="py-2"
                    />
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Skills ({formData.skills.length})</h3>
                  
                  <div className="relative">
                    <Input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Search and add skills..."
                      className="py-2"
                    />
                    {suggestedSkills.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-background border border-input rounded-lg shadow-lg z-10"
                      >
                        {suggestedSkills.map(skill => (
                          <button
                            key={skill}
                            onClick={() => handleAddSkill(skill)}
                            className="w-full text-left px-4 py-2 hover:bg-primary/10 transition-colors text-sm"
                          >
                            + {skill}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <motion.div
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 group hover:bg-primary/30 transition-colors"
                      >
                        {skill}
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-primary/60 hover:text-primary transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Certifications ({formData.certifications.length})</h3>
                  
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={newCert}
                      onChange={(e) => setNewCert(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCertification()}
                      placeholder="e.g. AWS Certified Solutions Architect"
                      className="py-2 flex-1"
                    />
                    <Button
                      onClick={handleAddCertification}
                      size="sm"
                      variant="outline"
                      className="px-4"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {formData.certifications.map((cert, index) => (
                      <motion.div
                        key={cert}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center justify-between p-3 bg-background/50 border border-border rounded-lg group hover:bg-background/70 transition-colors"
                      >
                        <span className="text-sm">{cert}</span>
                        <button
                          onClick={() => handleRemoveCertification(cert)}
                          className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 sticky bottom-0 bg-background/95 backdrop-blur-sm pt-6 border-t border-border -mx-6 px-6 py-4">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={loading || !formData.name || !formData.email}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ProfileEditor;
