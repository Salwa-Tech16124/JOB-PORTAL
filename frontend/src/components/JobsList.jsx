import React, { useState, useEffect } from 'react';

function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [matches, setMatches] = useState({});

  useEffect(() => {
    fetch('http://localhost:5000/api/jobs')
      .then(res => res.json())
      .then(resData => {
         if (resData.success) {
            setJobs(resData.data || []);
         } else {
            console.error(resData.message);
         }
      })
      .catch(err => console.error('Error connecting to background server'));
  }, []);

  const getMatch = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return alert('You must be logged in to run AI Match.');

      const res = await fetch(`http://localhost:5000/api/jobs/${jobId}/match`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();
      
      if (resData.success) {
        setMatches(prev => ({ ...prev, [jobId]: resData.data }));
      } else {
        alert(resData.message || 'Error fetching match');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to connect to backend AI server.');
    }
  };

  const getColorForMatch = (percentage) => {
    if (percentage > 75) return { bg: '#e8f5e9', text: '#2e7d32' };   // Green
    if (percentage > 40) return { bg: '#fff3e0', text: '#ef6c00' };   // Orange
    return { bg: '#ffebee', text: '#c62828' };                        // Red
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Active Job Listings</h2>
      {jobs.length === 0 ? <p style={{ color: '#666', fontStyle: 'italic' }}>No jobs available. Create an employer account and post something!</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {jobs.map(job => (
            <div key={job._id} style={{ background: '#fff', border: '1px solid #eaeaea', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', transition: 'transform 0.2s ease', cursor: 'default' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#1a1a1a', fontSize: '1.4rem' }}>{job.title}</h3>
                  <p style={{ color: '#1976d2', margin: '0 0 15px 0', fontWeight: 'bold' }}>🏢 {job.company}</p>
                </div>
                {matches[job._id] && matches[job._id].match_percentage !== undefined && (
                  <div style={{ 
                    background: getColorForMatch(matches[job._id].match_percentage).bg, 
                    color: getColorForMatch(matches[job._id].match_percentage).text, 
                    padding: '8px 15px', 
                    borderRadius: '20px', 
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    border: `1px solid ${getColorForMatch(matches[job._id].match_percentage).text}40`
                  }}>
                    {matches[job._id].match_percentage}% AI Match
                  </div>
                )}
              </div>
              
              <p style={{ color: '#555', lineHeight: '1.6', background: '#f9f9f9', padding: '15px', borderRadius: '8px', borderLeft: '3px solid #ccc' }}>{job.description}</p>
              
              <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
                <button onClick={() => alert('Application sent successfully!')} style={{ background: '#333', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Apply Now</button>
                <button onClick={() => getMatch(job._id)} style={{ background: '#e3f2fd', color: '#1565c0', border: '1px solid #1565c0', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>✨ Run AI Match</button>
              </div>

              {matches[job._id]?.missing_skills?.length > 0 && (
                <div style={{ marginTop: '20px', fontSize: '0.95em', color: '#d32f2f', background: '#ffebee', padding: '10px 15px', borderRadius: '6px' }}>
                  <strong>⚠️ Missing Requirements:</strong> {matches[job._id].missing_skills.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default JobsList;
