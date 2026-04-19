import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, ArrowRight, AlertCircle, CheckCircle, UserCog } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';

const CAREER_ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Mobile App Developer',
  'Data Scientist',
  'Data Analyst',
  'Product Manager',
  'UX/UI Designer',
  'DevOps Engineer',
  'QA/Test Engineer',
  'Business Analyst',
  'Project Manager',
  'Scrum Master',
  'Database Administrator',
  'Systems Administrator',
  'Network Engineer',
  'Cybersecurity Engineer',
  'Cloud Architect',
  'Machine Learning Engineer',
  'AI/ML Specialist',
  'Recruiter/HR Manager',
  'Sales Manager',
  'Marketing Manager',
  'Business Development',
  'Consultant',
  'Freelancer',
  'Entrepreneur/Founder',
  'Other'
];

function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  // Validation Functions
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const getErrors = () => {
    const errors = {};
    if (touched.email && !validateEmail(email)) {
      errors.email = 'Please enter a valid email';
    }
    if (touched.password && !validatePassword(password)) {
      errors.password = 'Password must be at least 6 characters';
    }
    return errors;
  };

  const errors = getErrors();
  const isFormValid = validateEmail(email) && validatePassword(password) && role && !loading;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      if (validateEmail(email) && validatePassword(password)) {
        // Store user data with EMPTY profile fields (not auto-extracted from email)
        const userData = {
          email,
          name: '',
          role: role,
          skills: [],
          experience: '',
          bio: '',
          education: '',
          loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', 'dummy-token-' + Date.now());
        
        toast.success('Welcome back! Redirecting...', 'Login Successful');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        toast.error('Invalid email or password', 'Login Failed');
      }
    } catch (err) {
      toast.error('Login failed. Please try again.', 'Error');
    } finally {
      setLoading(false);
    }
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
            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/60 z-10" />
                <Input 
                  type="email" 
                  placeholder="Email address" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  className={`pl-12 py-6 text-[16px] transition-all ${
                    touched.email && errors.email ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                />
              </div>
              {touched.email && errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            
            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/60 z-10" />
                <Input 
                  type="password" 
                  placeholder="Password (min 6 characters)" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  className={`pl-12 py-6 text-[16px] transition-all ${
                    touched.password && errors.password ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                />
              </div>
              {touched.password && errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
            
            <div className="relative">
              <UserCog className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/60 z-10" />
              <select 
                value={role} 
                onChange={e => setRole(e.target.value)}
                className="bg-background/50 border-input/50 flex h-14 w-full rounded-xl border px-3 py-2 text-[15px] shadow-sm backdrop-blur-sm transition-all duration-300 outline-none pl-12 hover:bg-background/80 focus-visible:bg-background focus-visible:border-ring focus-visible:ring-ring/50 appearance-none cursor-pointer"
              >
                <option value="">Select your career role</option>
                {CAREER_ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            
            <Button 
              type="submit" 
              disabled={!isFormValid || Object.keys(errors).length > 0}
              className="w-full mt-6 py-6 text-[16px] disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="ml-2">Logging in...</span>
                </>
              ) : (
                <>
                  Log In <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Demo Info */}
          <div className="mt-6 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg text-sm text-muted-foreground">
            <p className="font-semibold text-blue-500 mb-1">Demo Credentials:</p>
            <p>Email: demo@example.com</p>
            <p>Password: demo123</p>
          </div>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
             <p className="text-muted-foreground font-medium text-[15px]">Don't have an account? <Link to="/signup" className="text-primary font-bold hover:underline ml-1">Sign up</Link></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;
