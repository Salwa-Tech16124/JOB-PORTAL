import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { AlertTriangle, PlusCircle, Building, Briefcase, Loader2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

function PostJob() {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePost = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await api.postJob(title, company, description);
    
    if (res.success) {
      alert(res.message || "Job Posted Successfully!");
      navigate('/');
    } else {
      if (res.data && res.data.flags) {
          alert(`🚨 AI Fraud Detect:\n${res.message}\nFlags: ${res.data.flags.join(", ")}`);
      } else {
          alert(res.message || "An error occurred");
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex items-center">
         <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center mr-4">
            <PlusCircle className="w-6 h-6 text-destructive" />
         </div>
         <div>
            <h2 className="text-3xl font-bold text-foreground">Post a New Job</h2>
            <p className="text-muted-foreground mt-1 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-primary/80" /> All posts are automatically scanned by our AI Fraud Agent.
            </p>
         </div>
      </div>
      
      <Card className="shadow-2xl">
        <CardContent className="p-6 md:p-10">
          <form onSubmit={handlePost} className="space-y-6">
            <div>
              <Label className="flex items-center mb-2">
                <Briefcase className="w-4 h-4 mr-2 text-primary" /> Job Title
              </Label>
              <Input 
                required 
                placeholder="e.g. Senior Backend Architect" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="h-12 text-[16px]"
              />
            </div>

            <div>
              <Label className="flex items-center mb-2">
                <Building className="w-4 h-4 mr-2 text-primary" /> Company Name
              </Label>
              <Input 
                required 
                placeholder="e.g. Acme Corp" 
                value={company} 
                onChange={e => setCompany(e.target.value)} 
                className="h-12 text-[16px]"
              />
            </div>

            <div>
              <Label className="flex items-center mb-2">Job Description</Label>
              <Textarea 
                required 
                rows="6" 
                placeholder="Describe the role, responsibilities, and technical requirements... (Try typing 'pay upfront' to trigger the Fraud AI!)" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="text-[16px] p-4 resize-y"
              />
            </div>
            
            <div className="pt-4 mt-8 border-t border-border/50">
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-14 text-[16px] shadow-lg"
              >
                {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing AI Scan...</> : 'Publish to Job Board'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default PostJob;
