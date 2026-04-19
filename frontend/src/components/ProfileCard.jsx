import React from 'react';
import { User, Briefcase, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function ProfileCard({ profile, onEdit }) {
  return (
    <div className="glass-card border border-border rounded-2xl p-8 mb-8">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
            <p className="text-muted-foreground">{profile.role}</p>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 hover:scale-105"
        >
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-secondary/20 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-primary">{profile.score}</p>
          <p className="text-xs text-muted-foreground mt-1">Profile Score</p>
        </div>
        <div className="bg-secondary/20 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-accent">{profile.matches}</p>
          <p className="text-xs text-muted-foreground mt-1">Job Matches</p>
        </div>
        <div className="bg-secondary/20 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-chart-3">{profile.skills}</p>
          <p className="text-xs text-muted-foreground mt-1">Skills</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Profile Strength</h3>
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">Overall</p>
            <span className="text-sm font-bold text-primary">{profile.strength}%</span>
          </div>
          <Progress value={profile.strength} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {[
            { label: 'Basic Info', value: 100 },
            { label: 'Experience', value: 75 },
            { label: 'Skills', value: 60 },
            { label: 'Certifications', value: 40 }
          ].map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                <span className="text-xs text-muted-foreground">{item.value}%</span>
              </div>
              <Progress value={item.value} className="h-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
