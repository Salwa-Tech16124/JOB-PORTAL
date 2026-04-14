import React, { useState } from 'react';

function Coach() {
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);

  const getAdvice = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/coach', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ current_role: currentRole, target_role: targetRole })
      });
      setAdvice(await res.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2>AI Career Coach</h2>
      <form onSubmit={getAdvice} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
        <input placeholder="Current Role (e.g. Junior Dev)" value={currentRole} onChange={e => setCurrentRole(e.target.value)} required style={{ padding: '10px' }} />
        <input placeholder="Target Role (e.g. Senior Cloud Architect)" value={targetRole} onChange={e => setTargetRole(e.target.value)} required style={{ padding: '10px' }} />
        <button type="submit" disabled={loading} style={{ background: '#2196F3', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          {loading ? 'Consulting AI...' : 'Get Career Roadmap'}
        </button>
      </form>

      {advice && (
        <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '5px' }}>
          <h3>Suggested Skills</h3>
          <ul>{advice.suggested_skills?.map((s,i) => <li key={i}>{s}</li>)}</ul>
          <h3>Roadmap</h3>
          <ul>{advice.roadmap?.map((r,i) => <li key={i}>{r}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

export default Coach;
