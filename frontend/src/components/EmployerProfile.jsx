import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Save, Building, User, Briefcase, FileText } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Button } from './ui/button';

export default function EmployerProfile({ onBack }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    title: '', // designation
    company: '', // company/org
    experience: '',
    bio: '' // description
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setFormData({
          name: user.name || '',
          title: user.title || '',
          company: user.company || '',
          experience: user.experience || '',
          bio: user.bio || ''
        });
      } catch(e) {}
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.updateProfile(formData);
      if (res.success) {
        // Always update localStorage with the form data
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const currentUser = JSON.parse(userStr);
          const updatedUser = { ...currentUser, ...formData };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        toast.success('Profile saved successfully!');
        if (onBack) onBack();
      } else {
        toast.error(res.message || 'Failed to update profile');
      }
    } catch(err) {
      console.error('Save error:', err);
      toast.error('Failed to communicate with server. Please make sure the backend is running.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Employer Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your company presence</p>
        </div>
      </div>

      <Card className="glass-card shadow-xl border-0">
        <CardContent className="p-8">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Full Name
                </Label>
                <Input 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" /> Designation
                </Label>
                <Input 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Hiring Manager"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building className="w-4 h-4 text-primary" /> Company / Organization
              </Label>
              <Input 
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g. Acme Corp"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Company Description & Bio
              </Label>
              <Textarea 
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Describe your organization and your role..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Experience
              </Label>
              <Textarea 
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="Briefly describe your recruiting or industry experience..."
                rows={3}
              />
            </div>

            <div className="pt-4 mt-6 border-t border-border/50">
              <Button type="submit" className="w-full h-12" disabled={loading}>
                {loading ? 'Saving...' : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Save Employer Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
