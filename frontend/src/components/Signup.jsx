import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, UserCog, Loader2, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
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

function Signup() {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ 
    email: false, 
    password: false, 
    confirmPassword: false 
  });

  // Validation Functions
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validatePasswordMatch = (password, confirmPassword) => {
    return password === confirmPassword && password.length > 0;
  };

  const getErrors = () => {
    const errors = {};
    
    if (touched.email && !validateEmail(email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (touched.password && !validatePassword(password)) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (touched.confirmPassword && !validatePasswordMatch(password, confirmPassword)) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };

  const errors = getErrors();
  const isFormValid = 
    validateEmail(email) && 
    validatePassword(password) && 
    validatePasswordMatch(password, confirmPassword) && 
    role &&
    !loading;

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (validateEmail(email) && validatePassword(password) && validatePasswordMatch(password, confirmPassword)) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Store user data with EMPTY profile fields (not auto-extracted from email)
        const userData = {
          email,
          name: '',
          role: role,
          skills: [],
          experience: '',
          bio: '',
          education: '',
          signupTime: new Date().toISOString()
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', 'dummy-token-' + Date.now());
        
        toast.success('Account created successfully! Redirecting...', 'Welcome!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        toast.error('Please check all fields', 'Validation Error');
      }
    } catch (err) {
      toast.error('Registration failed. Please try again.', 'Error');
    } finally {
      setLoading(false);
    }
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

            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/60 z-10" />
                <Input 
                  type="password" 
                  placeholder="Confirm Password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                  className={`pl-12 py-6 text-[16px] transition-all ${
                    touched.confirmPassword && errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                />
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
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
                  <span className="ml-2">Creating account...</span>
                </>
              ) : (
                <>
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
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
