import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Outlet } from 'react-router-dom';
import { Briefcase, User, Compass, Mic, PlusCircle, LogOut, Menu, LayoutGrid, Search, Moon, Sun, Bell, ChevronDown, Edit } from 'lucide-react';
import { ToastProvider, useToast } from './context/ToastContext';
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

  // Load dark mode preference on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', newTheme);
  };

  const handleNotificationClick = () => {
    setHasNotification(false);
  };

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Reset notification state
    setHasNotification(true);
    // Show logout confirmation
    toast.success('Logged out successfully', 'Goodbye!');
    // Navigate to landing page
    setTimeout(() => navigate('/'), 300);
  };

  // Get user name from localStorage
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden pointer-events-auto">
      {/* Sidebar */}
      <aside className="w-64 glass-card border-r border-[#ffffff20] hidden md:flex flex-col shadow-sm fixed inset-y-0 left-0 z-40">
        <div className="h-16 flex items-center px-6 border-b border-[#ffffff10]">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center mr-3 shadow-md shadow-primary/30 animate-pulse-glow">
            <span className="text-white font-bold text-lg">AI</span>
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">JobPortal</h1>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <Link to="/dashboard" className="flex items-center px-4 py-3 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors font-medium">
            <LayoutGrid className="w-5 h-5 mr-3" /> Dashboard
          </Link>
          <Link to="/" className="flex items-center px-4 py-3 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors font-medium">
            <Briefcase className="w-5 h-5 mr-3" /> Job Board
          </Link>
          <Link to="/profile" className="flex items-center px-4 py-3 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors font-medium">
            <User className="w-5 h-5 mr-3" /> AI Profile
          </Link>
          <Link to="/coach" className="flex items-center px-4 py-3 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors font-medium">
            <Compass className="w-5 h-5 mr-3" /> Career Coach
          </Link>
          <Link to="/interview" className="flex items-center px-4 py-3 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors font-medium">
            <Mic className="w-5 h-5 mr-3" /> Interview Prep
          </Link>
          <div className="pt-4 mt-4 border-t border-[#ffffff10]">
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Employers</p>
            <Link to="/post-job" className="flex items-center px-4 py-3 text-muted-foreground hover:bg-secondary/10 hover:text-secondary rounded-xl transition-colors font-medium">
              <PlusCircle className="w-5 h-5 mr-3" /> Post Job
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-[256px] flex flex-col overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-16 glass border-b border-border flex items-center justify-between px-6 z-30 sticky top-0 shadow-sm">
          {/* Left: Mobile Menu */}
          <div className="flex items-center md:hidden">
            <Menu className="w-6 h-6 text-foreground" />
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex flex-1 mx-8 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Search jobs, skills, companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold shadow-md">
                    {user.name
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase() || 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-sm font-semibold text-foreground">{user.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{user.role || 'User'}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>

                {/* Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-foreground hover:bg-primary/10 transition-colors flex items-center gap-2 font-medium"
                    >
                      <User className="w-4 h-4" />
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-foreground hover:bg-primary/10 transition-colors flex items-center gap-2 font-medium border-t border-border"
                    >
                      <Edit className="w-4 h-4" />
                      Complete Profile
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

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Landing Page - Accessible to all */}
          <Route path="/" element={<JobBoard />} />

          {/* Protected Routes - Only if logged in */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
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
