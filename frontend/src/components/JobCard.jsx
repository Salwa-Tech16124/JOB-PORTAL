import React from 'react';
import { MapPin, Zap, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function JobCard({ job, onApply, isApplied, hideApply }) {
  return (
    <div className="glass-card border border-border rounded-xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
            {job.title}
          </h3>
          <p className="text-sm text-muted-foreground">{job.company}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{job.match}%</div>
          <p className="text-xs text-muted-foreground">match</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          {job.location}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <DollarSign className="w-4 h-4" />
          {job.salary}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs font-semibold text-muted-foreground mb-2">SKILLS</p>
        <div className="flex flex-wrap gap-2">
          {job.skills.map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      {!hideApply && (
        <button
          onClick={() => onApply(job.id)}
          disabled={isApplied}
          className={`w-full py-2 rounded-lg font-medium transition-all duration-300 ${
            isApplied
              ? 'bg-green-500/10 text-green-500 cursor-default'
              : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105'
          }`}
        >
          {isApplied ? '✅ Applied' : 'Apply Now'}
        </button>
      )}
    </div>
  );
}

export default JobCard;
