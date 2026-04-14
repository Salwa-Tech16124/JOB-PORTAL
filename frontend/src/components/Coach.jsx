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
      const resData = await res.json();
      if (resData.success) {
          setAdvice(resData.data);
      } else {
          alert(resData.message || 'Error occurred fetching roadmap.');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to connect to backend server.');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', padding: '3rem', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }}>
      <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>🧭 AI Career Coach</h2>
      
      <form onSubmit={getAdvice} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Current Role</label>
          <input placeholder="e.g. Junior Dev" value={currentRole} onChange={e => setCurrentRole(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
        </div>
        <div>
           <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Target Role</label>
           <input placeholder="e.g. Senior Cloud Architect" value={targetRole} onChange={e => setTargetRole(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
        </div>
        <button type="submit" disabled={loading} style={{ gridColumn: 'span 2', background: '#2196F3', color: 'white', padding: '15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(33,150,243,0.3)' }}>
          {loading ? '🧠 Consulting AI Algorithms...' : 'Generate AI Career Roadmap'}
        </button>
      </form>

      {advice && (
        <div>
          <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, color: '#1565c0' }}>Core Skills to Master</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {advice.suggested_skills?.map((s,i) => (
                <span key={i} style={{ background: '#e0e0e0', color: '#333', padding: '6px 14px', borderRadius: '20px', fontWeight: 'bold' }}>{s}</span>
              ))}
            </div>
          </div>

          <h3 style={{ color: '#333' }}>Your Step-by-Step Roadmap</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {advice.roadmap?.map((phase, i) => (
              <div key={i} style={{ borderLeft: '4px solid #2196F3', background: '#fafafa', padding: '20px', borderRadius: '0 8px 8px 0', position: 'relative' }}>
                <span style={{ position: 'absolute', top: '20px', right: '20px', background: '#e3f2fd', color: '#1565c0', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  {phase.timeframe}
                </span>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#2c3e50' }}>{phase.phase}</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#555' }}>
                  {phase.steps.map((step, idx) => (
                    <li key={idx} style={{ marginBottom: '8px' }}>{step}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Coach;
