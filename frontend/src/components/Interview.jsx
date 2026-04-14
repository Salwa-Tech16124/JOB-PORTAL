import React, { useState } from 'react';

function Interview() {
  const [role, setRole] = useState('');
  const [level, setLevel] = useState('junior');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchQuestions = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ role, experience_level: level })
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        setQuestions(resData.data.questions || []);
      } else {
        alert(resData.message || "Failed to fetch. Are you logged in?");
      }
    } catch (err) { 
        console.error(err); 
        alert('Failed to connect to backend.');
    }
    setLoading(false);
  };

  const evaluateAnswer = async (index, question, answer) => {
    if (!answer) return alert("Please type an answer first.");
    try {
      const res = await fetch('http://localhost:5000/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ question, answer })
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        setFeedbacks(prev => ({ ...prev, [index]: resData.data }));
      } else {
        alert(resData.message || 'Error scoring answer.');
      }
    } catch (err) { 
        console.error(err); 
        alert('Failed to connect to backend.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', padding: '3rem', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }}>
      <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>🎙️ AI Interview Simulator</h2>
      
      {!questions.length ? (
        <form onSubmit={fetchQuestions} style={{ display: 'flex', gap: '15px' }}>
            <input required placeholder="Target Role (e.g. Backend)" value={role} onChange={e => setRole(e.target.value)} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', flex: 1, fontSize: '1rem' }} />
            <select value={level} onChange={e => setLevel(e.target.value)} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}>
                <option value="junior">Junior Level</option>
                <option value="senior">Senior Level</option>
            </select>
            <button type="submit" disabled={loading} style={{ background: '#2196F3', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
              {loading ? 'Thinking...' : 'Start Interview'}
            </button>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {questions.map((q, idx) => (
               <div key={idx} style={{ background: '#f5f5f5', padding: '25px', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                  <h4 style={{ margin: '0 0 15px 0', color: '#1565c0', fontSize: '1.2rem' }}>Q{idx+1}: {q}</h4>
                  <textarea rows="4" placeholder="Type your answer here..." value={answers[idx] || ''} onChange={e => setAnswers(prev => ({ ...prev, [idx]: e.target.value }))} style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', marginBottom: '15px', fontFamily: 'inherit', fontSize: '1rem' }}></textarea>
                  
                  <button onClick={() => evaluateAnswer(idx, q, answers[idx])} style={{ background: '#4caf50', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Grade My Answer</button>
                  
                  {feedbacks[idx] && feedbacks[idx].score && (
                      <div style={{ marginTop: '20px', padding: '15px', background: feedbacks[idx].score.includes('Fail') ? '#ffebee' : '#e8f5e9', borderRadius: '8px', border: '1px solid #ccc' }}>
                          <strong style={{ color: '#333', fontSize: '1.1rem' }}>Grade: <span style={{ color: feedbacks[idx].score.includes('Fail') ? '#c62828' : '#2e7d32' }}>{feedbacks[idx].score}</span></strong>
                          <p style={{ margin: '8px 0 0 0', color: '#555', lineHeight: '1.5' }}>💬 {feedbacks[idx].feedback}</p>
                      </div>
                  )}
               </div>
            ))}
            <button onClick={() => setQuestions([])} style={{ background: '#999', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '20px' }}>End Interview & Restart</button>
        </div>
      )}
    </div>
  );
}

export default Interview;
