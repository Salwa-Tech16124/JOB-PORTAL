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
      const data = await res.json();
      setProfileData(data);
      if (data.experience) setExperience(data.experience);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEnhance = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/profile', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ experience, name: profileData?.name || 'User' })
      });
      const data = await res.json();
      setProfileData(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2>My Profile (AI Enhanced)</h2>
      {profileData?.skills?.length > 0 && (
        <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '5px', marginBottom: '1rem' }}>
          <strong>Extracted Skills:</strong> {profileData.skills.join(', ')}
        </div>
      )}
      <form onSubmit={handleEnhance} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <textarea 
          placeholder="Paste your raw experience or resume text here..." 
          value={experience} 
          onChange={e => setExperience(e.target.value)} 
          rows="6"
          style={{ width: '100%', padding: '10px' }}
        />
        <button type="submit" disabled={loading} style={{ background: '#4CAF50', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          {loading ? 'AI is Magic-Enhancing...' : '✨ Magic Enhance Profile ✨'}
        </button>
      </form>
    </div>
  );
}

export default Profile;
