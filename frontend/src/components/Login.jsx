import React, { useState } from 'react';
import { api } from '../api';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await api.login(email, password);
    if (res.success) {
      localStorage.setItem('token', res.data.token);
      alert('Logged in successfully!');
      window.location.href = '/';
    } else {
      alert(res.message || 'Login failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center pt-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-extrabold">Welcome Back</CardTitle>
          <CardDescription className="text-[16px] mt-2">Log in to unleash the power of AI on your career.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
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
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 py-6 text-[16px]"
              size="lg"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Log In <ArrowRight className="w-4 h-4 ml-2" /></>}
            </Button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
             <p className="text-muted-foreground font-medium text-[15px]">Don't have an account? <Link to="/signup" className="text-primary font-bold hover:underline ml-1">Sign up</Link></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;
