import React, { useState } from 'react';
import { Mail, Lock, UserCog, Loader2, ArrowRight, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import { api } from '../api';

function SignupModal({ isOpen, onClose, onSignupSuccess }) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('candidate');
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
    !loading;

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (validateEmail(email) && validatePassword(password) && validatePasswordMatch(password, confirmPassword)) {
        const response = await api.signup(email, password, role);
        if (response.success && response.data?.token) {
          const nameFromEmail = email.split('@')[0].replace(/[._-]/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          const userData = {
            ...response.data.user,
            name: response.data.user.name || nameFromEmail,
            signupTime: new Date().toISOString()
          };

          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('token', response.data.token);

          toast.success(`Welcome ${nameFromEmail}! Account created successfully!`, 'Success!');

          // Reset form
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setRole('candidate');
          setTouched({ email: false, password: false, confirmPassword: false });

          // Close modal and trigger success callback
          setTimeout(() => {
            onClose();
            onSignupSuccess?.();
          }, 500);
        } else {
          toast.error(response.message || 'Please check all fields', 'Validation Error');
        }
      } else {
        toast.error('Please check all fields', 'Validation Error');
      }
    } catch (err) {
      toast.error('Registration failed. Please try again.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <Card className="w-full max-w-md relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

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
                  <option value="candidate">I am a Candidate</option>
                  <option value="employer">I am an Employer</option>
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
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default SignupModal;

