import React, { useState, useEffect } from 'react';

function Profile() {
  const [experience, setExperience] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/profile', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const dataWrapper = await res.json();
      if (dataWrapper.success && dataWrapper.data) {
          setProfileData(dataWrapper.data);
          if (dataWrapper.data.experience) setExperience(dataWrapper.data.experience);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEnhance = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("You must be logged in to use this feature!");
        setLoading(false);
        return;
      }

      const res = await fetch('http://localhost:5000/api/profile', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ experience, name: profileData?.name || 'User' })
      });
      const dataWrapper = await res.json();
      
      if (dataWrapper.success) {
        setProfileData(dataWrapper.data);
        alert(dataWrapper.message || "Profile Successfully Enhanced!");
      } else {
        alert(dataWrapper.message || 'An error occurred linking to the backend.');
      }
    } catch (e) {
      alert("Failed to connect to backend server. Make sure Node.js is running.");
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', background: '#fff', padding: '3rem', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }}>
      <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>🤖 AI Profile Architect</h2>
      
      {profileData && profileData.profile_score !== undefined && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <strong>Profile Strength</strong>
            <span>{profileData.profile_score}%</span>
          </div>
          <div style={{ width: '100%', background: '#e0e0e0', borderRadius: '10px', height: '12px', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              background: profileData.profile_score > 70 ? '#4caf50' : profileData.profile_score > 40 ? '#ffb300' : '#f44336', 
              width: `${profileData.profile_score}%`,
              transition: 'width 0.5s ease'
            }}></div>
          </div>
        </div>
      )}

      {profileData && profileData.skills?.length > 0 && (
        <div style={{ background: '#e3f2fd', borderLeft: '4px solid #1976d2', padding: '1.5rem', borderRadius: '0 8px 8px 0', marginBottom: '1.5rem' }}>
          <strong style={{ display: 'block', marginBottom: '10px', color: '#1565c0' }}>🎯 Extracted Superpowers:</strong> 
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {profileData.skills.map((skill, index) => (
              <span key={index} style={{ background: '#1976d2', color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleEnhance} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label style={{ fontWeight: 'bold', color: '#555' }}>Raw Experience / Resume Text</label>
        <textarea 
          placeholder="Paste your raw experience, bio, or resume text here to let the AI intelligently extract your skills..." 
          value={experience} 
          onChange={e => setExperience(e.target.value)} 
          rows="8"
          style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem', boxSizing: 'border-box' }}
        />
        <button type="submit" disabled={loading} style={{ background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)', color: 'white', padding: '15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(37,117,252,0.3)' }}>
          {loading ? '🔮 AI is Magic-Enhancing...' : '✨ Magic Enhance Profile ✨'}
        </button>
      </form>
    </div>
  );
}

export default Profile;
