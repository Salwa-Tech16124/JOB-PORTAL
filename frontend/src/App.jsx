import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Outlet, Navigate } from 'react-router-dom';
import { Briefcase, User, Compass, Mic, PlusCircle, LogOut, Menu, LayoutGrid, Search, Moon, Sun, Bell, ChevronDown, Edit, Image as ImageIcon, X } from 'lucide-react';
import { ToastProvider, useToast } from './context/ToastContext';
import { api } from './api';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import JobBoard from './pages/JobBoard';
import Profile from './pages/Profile';
import Coach from './pages/Coach';
import Interview from './pages/Interview';
import PostJob from './pages/PostJob';
import Dashboard from './pages/Dashboard';

function Layout() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const toast = useToast();
  const [theme, setTheme] = useState('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasNotification, setHasNotification] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load dark mode preference on mount and listen for changes
  React.useEffect(() => {
    const syncTheme = () => {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') {
        document.documentElement.classList.add('dark');
        setTheme('dark');
      } else {
        document.documentElement.classList.remove('dark');
        setTheme('light');
      }
    };
    
    syncTheme();
    window.addEventListener('themeChanged', syncTheme);
    return () => window.removeEventListener('themeChanged', syncTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);
  };

  const handleNotificationClick = () => {
    setHasNotification(false);
  };

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return null;
    return JSON.parse(storedUser);
  });

  const handleSearch = () => {
    const query = searchQuery.trim();
    if (query) {
      navigate(`/jobs?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/jobs');
    }
  };

  const handleLogout = () => {
    // Clear auth state and remove stored user profile data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('profilePicture');
    setUser(null);
    setHasNotification(true);
    toast.success('Logged out successfully', 'Goodbye!');
    setTimeout(() => navigate('/'), 300);
  };

  const fileInputRef = useRef(null);

  const compressImage = (file, maxWidth = 1024, quality = 0.75) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const browserImage = window.Image;
      const image = new browserImage();

      reader.onload = () => {
        const result = reader.result;
        if (!result || typeof result !== 'string') {
          reject(new Error('Unable to read image file.'));
          return;
        }

        image.onload = () => {
          const width = image.width;
          const height = image.height;
          const scale = Math.min(1, maxWidth / width);
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(width * scale);
          canvas.height = Math.round(height * scale);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context unavailable.'));
            return;
          }

          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const dataUrl = canvas.toDataURL(outputType, quality);
          resolve(dataUrl);
        };

        image.onerror = () => reject(new Error('Unable to load image for compression.'));
        image.src = result;
      };

      reader.onerror = () => reject(new Error('Error reading image file.'));
      reader.readAsDataURL(file);
    });
  };

  const estimateBase64Size = (base64) => Math.ceil(base64.length * 3 / 4);

  const handleProfilePictureUpload = async (event) => {
    const file = event.target?.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, JPEG, or PNG images are allowed.');
      return;
    }

    const maxFileSize = 12 * 1024 * 1024; // 12MB original file limit
    if (file.size > maxFileSize) {
      toast.error('Please upload an image smaller than 12MB.');
      return;
    }

    let profilePictureData;
    try {
      profilePictureData = await compressImage(file, 1024, 0.75);
    } catch (error) {
      console.error('Image compression failed:', error);
      toast.error('Unable to compress the selected image. Please try a smaller file.');
      return;
    }

    const approximateSize = estimateBase64Size(profilePictureData.split(',')[1] || profilePictureData);
    if (approximateSize > 50 * 1024 * 1024) {
      toast.error('Compressed image is too large. Please choose a smaller image.');
      return;
    }

    if (user) {
      const updatedUser = { ...user, profilePicture: profilePictureData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      try {
        const response = await api.updateProfile({ profilePicture: profilePictureData });
        if (!response.success) {
          toast.error('Could not save profile picture to server.');
        }
      } catch (error) {
        console.error('Profile picture save error:', error);
        toast.error('Could not save profile picture to server.');
      }
    }

    toast.success('Profile picture updated successfully.');
    window.dispatchEvent(new Event('userUpdated'));
  };

  useEffect(() => {
    const syncUser = () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setUser(null);
        return;
      }
      setUser(JSON.parse(storedUser));
    };

    window.addEventListener('loginSuccess', syncUser);
    window.addEventListener('userUpdated', syncUser);

    return () => {
      window.removeEventListener('loginSuccess', syncUser);
      window.removeEventListener('userUpdated', syncUser);
    };
  }, []);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden pointer-events-auto gap-4">
      {/* Sidebar */}
      <aside className="w-64 glass-card border-r border-[#ffffff20] hidden md:flex flex-shrink-0 flex-col shadow-sm z-40">
        <div className="h-16 flex items-center px-6 border-b border-[#ffffff10]">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="JobPortal Logo" className="h-8 w-auto object-contain" />
            <span className="font-semibold text-lg text-foreground">JobPortal</span>
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <Link to="/dashboard" className="flex items-center px-4 py-3 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors font-medium">
            <LayoutGrid className="w-5 h-5 mr-3" /> Dashboard
          </Link>
          <Link to="/jobs" className="flex items-center px-4 py-3 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors font-medium">
            <Briefcase className="w-5 h-5 mr-3" /> Job Board
          </Link>
          {user?.role !== 'employer' && (
            <>
              <Link to="/coach" className="flex items-center px-4 py-3 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors font-medium">
                <Compass className="w-5 h-5 mr-3" /> Career Coach
              </Link>
              <Link to="/profile" className="flex items-center px-4 py-3 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors font-medium">
                <User className="w-5 h-5 mr-3" /> AI Profile Architect
              </Link>
              <Link to="/interview" className="flex items-center px-4 py-3 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors font-medium">
                <Mic className="w-5 h-5 mr-3" /> Interview Prep
              </Link>
            </>
          )}

          {user?.role === 'employer' && (
            <div className="pt-4 mt-4 border-t border-[#ffffff10]">
              <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Employers</p>
              <Link to="/post-job" className="flex items-center px-4 py-3 text-muted-foreground hover:bg-secondary/10 hover:text-secondary rounded-xl transition-colors font-medium">
                <PlusCircle className="w-5 h-5 mr-3" /> Post Job
              </Link>
            </div>
          )}
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <aside 
            className="w-64 h-full bg-card border-r border-border flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-16 flex items-center justify-between px-6 border-b border-border">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="JobPortal Logo" className="h-8 w-auto object-contain" />
                <span className="font-semibold text-lg text-foreground">JobPortal</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>
            
            <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-3 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors font-medium">
                <LayoutGrid className="w-5 h-5 mr-3" /> Dashboard
              </Link>
              <Link to="/jobs" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-3 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors font-medium">
                <Briefcase className="w-5 h-5 mr-3" /> Job Board
              </Link>
              {user?.role !== 'employer' && (
                <>
                  <Link to="/coach" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-3 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors font-medium">
                    <Compass className="w-5 h-5 mr-3" /> Career Coach
                  </Link>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-3 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors font-medium">
                    <User className="w-5 h-5 mr-3" /> AI Profile Architect
                  </Link>
                  <Link to="/interview" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-3 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors font-medium">
                    <Mic className="w-5 h-5 mr-3" /> Interview Prep
                  </Link>
                </>
              )}

              {user?.role === 'employer' && (
                <div className="pt-4 mt-4 border-t border-border">
                  <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Employers</p>
                  <Link to="/post-job" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-3 text-muted-foreground hover:bg-secondary/10 hover:text-secondary rounded-xl transition-colors font-medium">
                    <PlusCircle className="w-5 h-5 mr-3" /> Post Job
                  </Link>
                </div>
              )}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-16 glass border-b border-border flex items-center justify-between px-6 z-30 sticky top-0 shadow-sm">
          {/* Left: Mobile Menu */}
          <div className="flex items-center gap-2 md:hidden">
            <button onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-6 h-6 text-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="JobPortal Logo" className="h-8 w-auto object-contain" />
              <span className="font-semibold text-lg text-foreground">JobPortal</span>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex flex-1 mx-8 max-w-2xl">
            <div className="flex items-center gap-3 w-full">
              <input
                type="text"
                placeholder="Search jobs, skills, companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                className="flex-1 pr-4 pl-4 py-2 rounded-lg border border-input bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* Right: Icons & Profile */}
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-muted-foreground hover:text-primary"
              title="Toggle dark mode"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            {/* Notification Bell */}
            <button 
              onClick={handleNotificationClick}
              className="relative p-2 hover:bg-primary/10 rounded-lg transition-colors text-muted-foreground hover:text-primary"
              title="View notifications"
            >
              <Bell className="w-5 h-5" />
              {hasNotification && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>

            {/* Profile Dropdown Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 pl-3 pr-2 py-2 hover:bg-primary/10 rounded-lg transition-colors border-l border-border group"
                >
                  <Avatar className="w-8 h-8">
                    {user.profilePicture ? (
                      <AvatarImage src={user.profilePicture} alt={`${user.name || 'User'} profile`} />
                    ) : (
                      <AvatarFallback>{user.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-sm font-semibold text-foreground">{user.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{user.role || 'User'}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/jpg,image/png"
                  capture="user"
                  className="hidden"
                  onChange={handleProfilePictureUpload}
                />

                {/* Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                    <button
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.click();
                        }
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-foreground hover:bg-primary/10 transition-colors flex items-center gap-2 font-medium"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Set Profile Picture
                    </button>
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-foreground hover:bg-primary/10 transition-colors flex items-center gap-2 font-medium border-t border-border"
                    >
                      <Edit className="w-4 h-4" />
                      AI Profile Architect
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2 font-medium border-t border-border"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!token) {
      navigate('/');
    }
  }, [token, navigate]);

  if (!token) {
    return null;
  }

  return children;
}

function ProfileRoute() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const userRole = userStr ? JSON.parse(userStr)?.role : null;

  React.useEffect(() => {
    if (userRole === 'employer') {
      navigate('/dashboard');
    }
  }, [userRole, navigate]);

  if (userRole === 'employer') return null;
  return <Profile />;
}

function HomeRoute() {
  const token = localStorage.getItem('token');
  if (token) return <Navigate to="/dashboard" replace />;
  return <JobBoard />;
}

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Landing Page - Accessible to all */}
          <Route path="/" element={<HomeRoute />} />

          {/* Protected Routes - Only if logged in */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/jobs" element={<JobBoard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<ProfileRoute />} />
            <Route path="/coach" element={<Coach />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/post-job" element={<PostJob />} />
          </Route>
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
