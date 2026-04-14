import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PostJob() {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePost = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title, company, description })
      });

      const dataWrapper = await res.json();
      
      if (dataWrapper.success) {
        alert(dataWrapper.message || "Job Posted Successfully!");
        navigate('/'); // Redirect to job board
      } else {
        if (dataWrapper.data && dataWrapper.data.flags) {
            alert(`🚨 AI Fraud Detect:\n${dataWrapper.message}\nFlags: ${dataWrapper.data.flags.join(", ")}`);
        } else {
            alert(dataWrapper.message || "An error occurred");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to server. Did you login using an Employer account?");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '3rem', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }}>
      <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>📢 Post a New Job</h2>
      <p style={{ color: '#666', fontStyle: 'italic', marginBottom: '20px' }}>*All posts are automatically scanned by our AI Fraud Agent.</p>
      
      <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#333' }}>Job Title</label>
          <input required placeholder="e.g. Senior Backend Dev" value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#333' }}>Company</label>
          <input required placeholder="e.g. Acme Corp" value={company} onChange={e => setCompany(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#333' }}>Job Description</label>
          <textarea required rows="6" placeholder="Describe the job, skills required, etc. (Try typing 'pay upfront' to trigger the Fraud AI!)" value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontFamily: 'inherit' }}></textarea>
        </div>
        
        <button type="submit" disabled={loading} style={{ background: '#d32f2f', color: 'white', padding: '15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}>
          {loading ? 'Processing...' : 'Post Job to Board'}
        </button>
      </form>
    </div>
  );
}

export default PostJob;
