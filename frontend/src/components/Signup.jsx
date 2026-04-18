import React, { useState } from 'react';
import { api } from '../api';
import { Mail, Lock, UserCog, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('candidate');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await api.signup(email, password, role);
    if (res.success) {
        alert('Registered successfully! Please login.');
        window.location.href = '/login';
    } else {
        alert(res.message || 'Registration failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center pt-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-extrabold">Create Account</CardTitle>
          <CardDescription className="text-[16px] mt-2">Join to explore curated AI job matches.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/60 z-10" />
              <Input 
                type="email" 
                placeholder="Email address" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                className="pl-12 py-6 text-[16px]"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/60 z-10" />
              <Input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                className="pl-12 py-6 text-[16px]"
              />
            </div>

            <div className="relative">
              <UserCog className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/60 z-10" />
              <select 
                value={role} 
                onChange={e => setRole(e.target.value)}
                className="bg-background/50 border-input/50 flex h-14 w-full rounded-xl border px-3 py-2 text-[15px] shadow-sm backdrop-blur-sm transition-all duration-300 outline-none pl-12 hover:bg-background/80 focus-visible:bg-background focus-visible:border-ring focus-visible:ring-ring/50 appearance-none cursor-pointer"
              >
                <option value="candidate">I am a Candidate</option>
                <option value="employer">I am an Employer</option>
              </select>
            </div>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 py-6 text-[16px]"
              size="lg"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Get Started <ArrowRight className="w-4 h-4 ml-2" /></>}
            </Button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
             <p className="text-muted-foreground/80 font-medium text-[15px]">Already have an account? <Link to="/login" className="text-primary font-bold hover:underline ml-1">Log in</Link></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Signup;
