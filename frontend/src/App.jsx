import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Briefcase, User, Compass, Mic, PlusCircle, LogOut, Menu } from 'lucide-react';
import JobsList from './components/JobsList';
import Profile from './components/Profile';
import Coach from './components/Coach';
import Interview from './components/Interview';
import PostJob from './components/PostJob';
import Login from './components/Login';
import Signup from './components/Signup';

function Layout({ children }) {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

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
          <div className="flex items-center md:hidden">
             <Menu className="w-6 h-6 text-foreground" />
          </div>
          <div className="hidden md:block">
            {/* Empty for spacing */}
          </div>
          <div className="flex items-center space-x-4 relative z-50 pointer-events-auto">
            {!token ? (
              <>
                <Link style={{position: 'relative', zIndex: 50}} to="/login" className="text-foreground font-medium hover:text-primary transition-colors cursor-pointer">Log In</Link>
                <Link style={{position: 'relative', zIndex: 50}} to="/signup" className="bg-primary text-primary-foreground px-5 py-2 rounded-lg font-medium hover:opacity-90 transition-all shadow-md shadow-primary/30 hover:scale-105 cursor-pointer">Sign Up</Link>
              </>
            ) : (
              <button style={{position: 'relative', zIndex: 50}} onClick={handleLogout} className="flex items-center text-muted-foreground font-medium hover:text-destructive transition-colors cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8 gradient-bg">
           <div className="max-w-5xl mx-auto min-h-full">
              <div className="glass-card shadow-2xl border border-white/5 rounded-[2rem] p-6 md:p-8 min-h-[calc(100vh-8rem)] animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out fill-mode-forwards relative z-10 pointer-events-auto">
                {children}
              </div>
           </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<JobsList />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
