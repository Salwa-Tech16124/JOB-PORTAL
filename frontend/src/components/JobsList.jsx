import React, { useState, useEffect } from 'react';

function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [matches, setMatches] = useState({});

  useEffect(() => {
    fetch('http://localhost:5000/api/jobs')
      .then(res => res.json())
      .then(data => setJobs(data))
      .catch(err => console.error(err));
  }, []);

  const getMatch = async (jobId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${jobId}/match`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMatches(prev => ({ ...prev, [jobId]: data }));
      } else {
        alert(data.message || 'Error fetching match');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2>Job Listings</h2>
      {jobs.length === 0 ? <p>No jobs available.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {jobs.map(job => (
            <div key={job._id} style={{ background: '#fff', border: '1px solid #e0e0e0', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{job.title}</h3>
                {matches[job._id] && (
                  <div style={{ background: matches[job._id].match_percentage > 70 ? '#e8f5e9' : '#fff3e0', color: matches[job._id].match_percentage > 70 ? '#2e7d32' : '#ef6c00', padding: '5px 10px', borderRadius: '15px', fontWeight: 'bold' }}>
                    {matches[job._id].match_percentage}% Match
                  </div>
                )}
              </div>
              <p style={{ color: '#666', margin: '0 0 15px 0' }}><strong>{job.company}</strong></p>
              <p style={{ color: '#444' }}>{job.description}</p>
              
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button onClick={() => alert('Applied!')} style={{ background: '#1976d2', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Apply Now</button>
                <button onClick={() => getMatch(job._id)} style={{ background: '#e0e0e0', color: '#333', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>✨ Check AI Match</button>
              </div>

              {matches[job._id]?.missing_skills?.length > 0 && (
                <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#d32f2f' }}>
                  <strong>Missing Skills:</strong> {matches[job._id].missing_skills.join(', ')}
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
