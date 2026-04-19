import React, { useState, useEffect } from 'react';
import { User, Sparkles, CheckCircle, Target, ArrowRight, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Label } from './ui/label';
import ProfileEditor from './ProfileEditor';

function Profile() {
  const [experience, setExperience] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    title: '',
    role: '',
    email: '',
    skills: [],
    profile_score: 0,
    bio: '',
    certifications: []
  });
  const [loading, setLoading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    // Load profile from localStorage
    const user = localStorage.getItem('user');
    const profile = localStorage.getItem('profile');
    
    if (profile) {
      const profileFromStorage = JSON.parse(profile);
      setProfileData(prev => ({
        ...prev,
        ...profileFromStorage,
        role: profileFromStorage.role || ''
      }));
    } else if (user) {
      const userData = JSON.parse(user);
      setProfileData(prev => ({
        ...prev,
        name: userData.name || '',
        title: userData.title || '',
        role: userData.role || '',
        email: userData.email || ''
      }));
    }
  }, []);

  const handleEnhance = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Extract skills from experience text (simple demo)
      const aiExtractedSkills = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS'];
      
      setProfileData(prev => ({
        ...prev,
        skills: [...new Set([...prev.skills, ...aiExtractedSkills])],
        profile_score: Math.min(100, prev.profile_score + 10)
      }));
    } catch (err) {
      console.error('Error enhancing profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score > 70) return 'bg-emerald-500 text-emerald-500';
    if (score > 40) return 'bg-amber-500 text-amber-500';
    return 'bg-destructive text-destructive';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
         <div className="flex items-center">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mr-4">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">AI Profile Architect</h2>
              <p className="text-muted-foreground mt-1">Let the AI extract your hidden superpowers.</p>
            </div>
         </div>
         <Button 
           onClick={() => setEditorOpen(true)}
           size="sm"
           className="gap-2"
         >
           <Edit3 className="w-4 h-4" />
           Edit Profile
         </Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Col: Analysis */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-1 flex flex-col gap-6"
        >
           <Card className="shadow-sm">
             <CardContent className="p-6">
               <h3 className="font-semibold text-foreground mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-primary" /> 
                  Profile Strength
               </h3>
               <div>
                 <div className="flex justify-between items-end mb-2">
                   <span className={`text-4xl font-bold ${getScoreColor(profileData.profile_score).split(' ')[1]}`}>
                     {profileData.profile_score}
                     <span className="text-lg text-muted-foreground/50">/100</span>
                   </span>
                 </div>
                 <div className="w-full h-3 bg-muted/30 rounded-full overflow-hidden border border-white/5">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${profileData.profile_score}%` }}
                     transition={{ duration: 0.8 }}
                     className={`h-full transition-all duration-1000 ease-out shadow-lg ${getScoreColor(profileData.profile_score).split(' ')[0]}`}
                   />
                 </div>
               </div>
             </CardContent>
           </Card>

           <Card className="bg-primary/5 border-primary/20 shadow-sm backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center">
                   <Sparkles className="w-5 h-5 mr-2 text-primary" />
                   Superpowers ({profileData.skills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((skill, index) => (
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
                  ))}
                </div>
              </CardContent>
           </Card>

           <Card className="bg-blue-500/5 border-blue-500/20 shadow-sm">
             <CardContent className="p-6">
               <h3 className="font-semibold text-foreground mb-4 flex items-center">
                 <User className="w-5 h-5 mr-2 text-blue-500" />
                 Profile Info
               </h3>
               <div className="space-y-3 text-sm">
                 <div>
                   <span className="text-muted-foreground">Name:</span>
                   <p className="text-foreground font-medium">{profileData.name || 'Not set'}</p>
                 </div>
                 <div>
                   <span className="text-muted-foreground">Email:</span>
                   <p className="text-foreground font-medium text-sm break-all">{profileData.email || 'Not set'}</p>
                 </div>
                 <div>
                   <span className="text-muted-foreground">Account Type:</span>
                   <p className="text-foreground font-medium"><Badge variant="outline">{profileData.role || 'Not set'}</Badge></p>
                 </div>
               </div>
             </CardContent>
           </Card>

           {profileData.certifications?.length > 0 && (
             <Card className="bg-secondary/5 border-secondary/20 shadow-sm">
               <CardContent className="p-6">
                 <h3 className="font-semibold text-foreground mb-4 flex items-center">
                   <CheckCircle className="w-5 h-5 mr-2 text-secondary" />
                   Certifications ({profileData.certifications.length})
                 </h3>
                 <div className="space-y-2">
                   {profileData.certifications.map((cert, index) => (
                     <motion.div
                       key={cert}
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: index * 0.05 }}
                       className="text-sm text-muted-foreground flex items-center gap-2"
                     >
                       <div className="w-2 h-2 bg-secondary rounded-full" />
                       {cert}
                     </motion.div>
                   ))}
                 </div>
               </CardContent>
             </Card>
           )}
        </motion.div>

        {/* Right Col: Editor */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 flex flex-col"
        >
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
                     <>
                       <div className="w-5 h-5 mr-3 border-2 border-primary/40 border-t-background rounded-full animate-spin"></div>
                       AI is analyzing...
                     </>
                  ) : (
                     <>
                       <Sparkles className="w-5 h-5 mr-2" /> Magic Enhance Profile <ArrowRight className="w-5 h-5 ml-2 opacity-70" />
                     </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Profile Editor Modal */}
      <ProfileEditor 
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={(data) => setProfileData(prev => ({ ...prev, ...data }))}
      />
    </div>
  );
}

export default Profile;
