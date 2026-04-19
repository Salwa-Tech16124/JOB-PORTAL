import React, { useState } from 'react';
import { Lock, Mail, Loader2, ArrowRight, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';

function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
  const isFormValid = validateEmail(email) && validatePassword(password) && !loading;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      if (validateEmail(email) && validatePassword(password)) {
        // Extract name from email (first part before @)
        const nameFromEmail = email.split('@')[0].replace(/[._-]/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        
        // Store user data in localStorage
        const userData = {
          email,
          name: nameFromEmail,
          role: 'Professional',
          loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', 'dummy-token-' + Date.now());
        
        toast.success('Welcome back!', 'Login Successful');
        
        // Reset form
        setEmail('');
        setPassword('');
        setTouched({ email: false, password: false });
        
        // Close modal and trigger success callback
        setTimeout(() => {
          onClose();
          onLoginSuccess?.();
        }, 500);
      } else {
        toast.error('Invalid email or password', 'Login Failed');
      }
    } catch (err) {
      toast.error('Login failed. Please try again.', 'Error');
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
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default LoginModal;
