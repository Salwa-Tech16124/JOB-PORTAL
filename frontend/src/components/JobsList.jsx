import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Sparkles, Building2, MapPin, AlertCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [matches, setMatches] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState({});

  useEffect(() => {
    api.getJobs().then(res => {
      if (res.success) setJobs(res.data || []);
      setLoading(false);
    });
  }, []);

  const getMatch = async (jobId) => {
    setLoadingMatches(prev => ({ ...prev, [jobId]: true }));
    const res = await api.getMatch(jobId);
    if (res.success) {
      setMatches(prev => ({ ...prev, [jobId]: res.data }));
    } else {
      alert(res.message || 'Error fetching match');
    }
    setLoadingMatches(prev => ({ ...prev, [jobId]: false }));
  };

  const getProgressColor = (percentage) => {
    if (percentage > 75) return 'text-emerald-500';
    if (percentage > 40) return 'text-amber-500';
    return 'text-destructive';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground font-medium">Loading opportunities...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground tracking-tight">Job Board</h2>
        <p className="text-muted-foreground/80 mt-2 text-lg">Discover your next career move curated by AI.</p>
      </div>

      {jobs.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 bg-background/30 shadow-none">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Building2 className="w-8 h-8 text-muted-foreground/60" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No jobs posted yet</h3>
          <p className="text-muted-foreground/80">Create an employer account to post the first opportunity!</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {jobs.map(job => (
            <Card key={job._id} className="hover:-translate-y-1 hover:shadow-2xl transition-all duration-500 cursor-default">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  
                  {/* Left Side: Title and Details */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground mb-2">{job.title}</h3>
                    <div className="flex items-center text-muted-foreground/90 mb-4 font-medium">
                      <Building2 className="w-4 h-4 mr-2 text-primary" />
                      <span>{job.company}</span>
                      <span className="mx-3 text-muted-foreground/30">•</span>
                      <MapPin className="w-4 h-4 mr-1 text-muted-foreground/60" />
                      <span>Remote</span>
                    </div>
                    <p className="text-muted-foreground/90 leading-relaxed mb-6 bg-muted/20 p-5 rounded-2xl border border-white/5">{job.description}</p>
                  </div>

                  {/* Right Side: Match Bubble */}
                  {matches[job._id] && matches[job._id].match_percentage !== undefined && (
                    <div className="flex flex-col items-center justify-center p-5 rounded-2xl border border-white/10 bg-background/40 backdrop-blur-xl shadow-lg min-w-[140px] animate-in fade-in duration-500">
                      <span className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider mb-3">AI Match</span>
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
                          <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6"
                                  strokeDasharray={28 * 2 * Math.PI} 
                                  strokeDashoffset={(28 * 2 * Math.PI) - ((matches[job._id].match_percentage / 100) * (28 * 2 * Math.PI))}
                                  className={`transition-all duration-1000 ease-out drop-shadow-md ${getProgressColor(matches[job._id].match_percentage)}`}
                                  strokeLinecap="round" />
                        </svg>
                        <span className="absolute text-lg font-bold text-foreground">{matches[job._id].match_percentage}%</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Intelligent Missing Skills Warning */}
                {matches[job._id]?.missing_skills?.length > 0 && (
                  <div className="mt-4 mb-6 bg-destructive/10 border border-destructive/20 rounded-xl p-5 flex gap-4 backdrop-blur-md animate-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-destructive mb-3">Missing Requirements</h4>
                      <div className="flex flex-wrap gap-2.5">
                         {matches[job._id].missing_skills.map((skill, idx) => (
                           <Badge key={idx} variant="destructive" className="shadow-sm font-semibold">{skill}</Badge>
                         ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-white/5">
                  <Button onClick={() => alert('Application sent!')} size="lg">
                    Apply Now
                  </Button>
                  <Button 
                    onClick={() => getMatch(job._id)} 
                    disabled={loadingMatches[job._id]}
                    variant="glass"
                    size="lg"
                  >
                    {loadingMatches[job._id] ? (
                      <><div className="w-4 h-4 mr-2 border-2 border-primary/40 border-t-primary rounded-full animate-spin"></div> Analyzing...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2 text-primary" /> Run AI Match</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default JobsList;
