import React, { useState } from 'react';
import { api } from '../api';
import { Compass, Focus, Goal, Loader2, ArrowRight, Target } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';

function Coach() {
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);

  const getAdvice = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await api.getCoach(currentRole, targetRole);
    if (res.success) {
      setAdvice(res.data);
    } else {
      alert(res.message || 'Error occurred fetching roadmap.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center">
         <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mr-4">
            <Compass className="w-6 h-6 text-primary" />
         </div>
         <div>
            <h2 className="text-3xl font-bold text-foreground">Career Coach</h2>
            <p className="text-muted-foreground mt-1">Generate a highly-customized AI learning roadmap.</p>
         </div>
      </div>

      {/* Input Section */}
      <Card className="mb-10">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={getAdvice} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <Label className="flex items-center mb-2">
                 <Focus className="w-4 h-4 mr-2 text-primary" /> Current Role
              </Label>
              <Input 
                required 
                placeholder="e.g. Junior Dev" 
                value={currentRole} 
                onChange={e => setCurrentRole(e.target.value)} 
                className="h-12"
              />
            </div>
            <div>
               <Label className="flex items-center mb-2">
                 <Goal className="w-4 h-4 mr-2 text-primary" /> Target Role
               </Label>
               <Input 
                 required 
                 placeholder="e.g. Senior Cloud Architect" 
                 value={targetRole} 
                 onChange={e => setTargetRole(e.target.value)} 
                 className="h-12"
               />
            </div>
            <Button 
              type="submit" 
              disabled={loading} 
              className="md:col-span-2 h-12 text-base shadow-lg"
            >
              {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Consulting Algorithms...</> : 'Generate Career Roadmap'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {advice && (
        <div className="animate-in slide-in-from-bottom-6 duration-500">
           {/* Core Skills Box */}
          <Card className="bg-primary/5 border-primary/20 p-8 mb-10 shadow-lg relative overflow-hidden backdrop-blur-md">
             <div className="absolute top-0 right-0 p-12 opacity-10">
                <Target className="w-64 h-64 text-primary" />
             </div>
             <h3 className="text-primary font-semibold mb-4 text-lg">Core Skills to Master</h3>
             <div className="flex flex-wrap gap-3">
               {advice.suggested_skills?.map((s,i) => (
                 <Badge key={i} variant="secondary" className="px-4 py-2 text-sm shadow-sm backdrop-blur-md">
                   {s}
                 </Badge>
               ))}
             </div>
          </Card>

          <h3 className="text-2xl font-bold text-foreground mb-8 ml-2">Your Step-by-Step Roadmap</h3>
          
          {/* Vertical Timeline */}
          <div className="relative border-l-2 border-border/50 ml-4 md:ml-6 space-y-10 pb-8">
            {advice.roadmap?.map((phase, i) => (
              <div key={i} className="relative pl-8 md:pl-10">
                {/* Timeline dot */}
                <div className="absolute w-6 h-6 bg-primary rounded-full border-4 border-background -left-[13px] top-1 shadow-sm"></div>
                
                <Card className="hover:shadow-xl transition-shadow duration-300 glass-card">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                       <h4 className="text-xl font-bold text-foreground flex items-center">
                         {phase.phase}
                       </h4>
                       <Badge variant="outline" className="mt-2 md:mt-0 font-bold px-3 py-1 bg-background text-primary border-primary/30">
                         {phase.timeframe}
                       </Badge>
                    </div>
                    
                    <ul className="space-y-4">
                      {phase.steps.map((step, idx) => (
                        <li key={idx} className="flex text-muted-foreground/90 font-medium">
                          <ArrowRight className="w-5 h-5 text-primary/50 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Coach;
