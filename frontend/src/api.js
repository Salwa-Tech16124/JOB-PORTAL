const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const handleResponse = async (res) => {
    try {
        const data = await res.json();
        return data; 
    } catch (err) {
        return { success: false, data: null, message: 'Server did not return JSON' };
    }
};

export const api = {
    login: async (email, password) => {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ email, password })
        });
        return handleResponse(res);
    },
    signup: async (email, password, role) => {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ email, password, role })
        });
        return handleResponse(res);
    },
    getJobs: async () => {
        const res = await fetch(`${BASE_URL}/jobs`, { headers: getHeaders() });
        return handleResponse(res);
    },
    postJob: async (title, company, description) => {
        const res = await fetch(`${BASE_URL}/jobs`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ title, company, description })
        });
        return handleResponse(res);
    },
    getMatch: async (jobId) => {
        const res = await fetch(`${BASE_URL}/jobs/${jobId}/match`, { headers: getHeaders() });
        return handleResponse(res);
    },
    getProfile: async () => {
        const res = await fetch(`${BASE_URL}/profile`, { headers: getHeaders() });
        return handleResponse(res);
    },
    updateProfile: async (experience, name) => {
        const res = await fetch(`${BASE_URL}/profile`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ experience, name })
        });
        return handleResponse(res);
    },
    getCoach: async (currentRole, targetRole) => {
        const res = await fetch(`${BASE_URL}/coach`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ current_role: currentRole, target_role: targetRole })
        });
        return handleResponse(res);
    },
    getInterview: async (role, level) => {
        const res = await fetch(`${BASE_URL}/interview`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ role, experience_level: level })
        });
        return handleResponse(res);
    },
    evaluateInterview: async (question, answer) => {
        const res = await fetch(`${BASE_URL}/interview/evaluate`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ question, answer })
        });
        return handleResponse(res);
    }
};
