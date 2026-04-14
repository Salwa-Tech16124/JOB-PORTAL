import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import JobsList from './components/JobsList.jsx';
import Profile from './components/Profile.jsx';
import Coach from './components/Coach.jsx';

function App() {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: 'Arial, sans-serif', background: '#f0f2f5', minHeight: '100vh' }}>
        <nav style={{ background: '#1976d2', padding: '1rem', display: 'flex', gap: '20px', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Job Board</Link>
          <Link to="/profile" style={{ color: 'white', textDecoration: 'none' }}>AI Profile</Link>
          <Link to="/coach" style={{ color: 'white', textDecoration: 'none' }}>Career Coach</Link>
          <div style={{ flex: 1 }}></div>
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
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
