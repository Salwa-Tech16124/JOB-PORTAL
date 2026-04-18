import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { User, Sparkles, CheckCircle, Target, ArrowRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Label } from './ui/label';

function Profile() {
  const [experience, setExperience] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const res = await api.getProfile();
    if (res.success && res.data) {
      setProfileData(res.data);
      if (res.data.experience) setExperience(res.data.experience);
    }
  };

  const handleEnhance = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await api.updateProfile(experience, profileData?.name || 'User');
    if (res.success) {
      setProfileData(res.data);
      // Optional: replace alert with toast in the future
      alert(res.message || "Profile Magic Enhanced!");
    } else {
      alert(res.message || 'An error occurred.');
    }
    setLoading(false);
  };

  const getScoreColor = (score) => {
    if (score > 70) return 'bg-emerald-500 text-emerald-500';
    if (score > 40) return 'bg-amber-500 text-amber-500';
    return 'bg-destructive text-destructive';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center">
         <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mr-4">
            <User className="w-6 h-6 text-primary" />
         </div>
         <div>
            <h2 className="text-3xl font-bold text-foreground">AI Profile Architect</h2>
            <p className="text-muted-foreground mt-1">Let the AI extract your hidden superpowers.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Col: Analysis */}
        <div className="md:col-span-1 flex flex-col gap-6">
           <Card className="shadow-sm">
             <CardContent className="p-6">
               <h3 className="font-semibold text-foreground mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-primary" /> 
                  Profile Strength
               </h3>
               {profileData?.profile_score !== undefined ? (
                 <div>
                   <div className="flex justify-between items-end mb-2">
                     <span className={`text-4xl font-bold ${getScoreColor(profileData.profile_score).split(' ')[1]}`}>
                       {profileData.profile_score}
                       <span className="text-lg text-muted-foreground/50">/100</span>
                     </span>
                   </div>
                   <div className="w-full h-3 bg-muted/30 rounded-full overflow-hidden border border-white/5">
                     <div 
                       className={`h-full transition-all duration-1000 ease-out shadow-lg ${getScoreColor(profileData.profile_score).split(' ')[0]}`}
                       style={{ width: `${profileData.profile_score}%` }}
                     ></div>
                   </div>
                 </div>
               ) : (
                  <p className="text-muted-foreground/60 text-sm italic">Analyze your profile to see score.</p>
               )}
             </CardContent>
           </Card>

           <Card className="bg-primary/5 border-primary/20 shadow-sm backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center">
                   <Sparkles className="w-5 h-5 mr-2 text-primary" />
                   Superpowers
                </h3>
                {profileData?.skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill, index) => (
                      <Badge 
                        key={index}
                        variant="secondary" 
                        className="px-3 py-1.5 text-sm font-semibold shadow-sm"
                      >
                        <CheckCircle className="w-3 h-3 mr-1.5 text-primary/80" />
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                   <p className="text-primary/60 text-sm italic">Paste your resume text to extract skills.</p>
                )}
              </CardContent>
           </Card>
        </div>

        {/* Right Col: Editor */}
        <div className="md:col-span-2 flex flex-col">
          <Card className="h-full flex flex-col shadow-xl border border-white/5">
            <CardContent className="p-6 md:p-8 flex-1 flex flex-col">
              <form onSubmit={handleEnhance} className="flex flex-col h-full">
                <Label className="mb-3 block">Raw Experience / Bio</Label>
                <Textarea 
                  className="flex-1 w-full min-h-[300px] text-[16px] resize-none shadow-inner"
                  placeholder="Paste your raw experience, bio, or resume text here to let the AI intelligently extract your skills..." 
                  value={experience} 
                  onChange={e => setExperience(e.target.value)} 
                />
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="mt-6 w-full h-14 text-[16px] font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]"
                >
                  {loading ? (
                     <><div className="w-5 h-5 mr-3 border-2 border-primary/40 border-t-background rounded-full animate-spin"></div> AI is analyzing...</>
                  ) : (
                     <><Sparkles className="w-5 h-5 mr-2" /> Magic Enhance Profile <ArrowRight className="w-5 h-5 ml-2 opacity-70" /></>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Profile;
