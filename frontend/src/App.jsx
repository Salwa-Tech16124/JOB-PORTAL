import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import JobsList from './components/JobsList.jsx';
import Profile from './components/Profile.jsx';
import Coach from './components/Coach.jsx';
import PostJob from './components/PostJob.jsx';
import Interview from './components/Interview.jsx';

function App() {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: 'Arial, sans-serif', background: '#f0f2f5', minHeight: '100vh' }}>
        <nav style={{ background: '#1976d2', padding: '1rem', display: 'flex', gap: '20px', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>📋 Job Board</Link>
          <Link to="/profile" style={{ color: 'white', textDecoration: 'none' }}>🤖 AI Profile</Link>
          <Link to="/coach" style={{ color: 'white', textDecoration: 'none' }}>🧭 Career Coach</Link>
          <Link to="/interview" style={{ color: 'white', textDecoration: 'none' }}>🎙️ AI Interview</Link>
          <div style={{ flex: 1 }}></div>
          <Link to="/post-job" style={{ color: '#ffeb3b', textDecoration: 'none', fontWeight: 'bold', background: '#d32f2f', padding: '8px 16px', borderRadius: '6px' }}>+ Post a Job</Link>
          <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
          <Link to="/signup" style={{ color: 'white', textDecoration: 'none' }}>Signup</Link>
        </nav>
        <div style={{ padding: '2rem' }}>
          <Routes>
            <Route path="/" element={<JobsList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/coach" element={<Coach />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/interview" element={<Interview />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
