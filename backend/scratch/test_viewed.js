import fetch from 'node-fetch';

async function test() {
    // 1. Login as employer
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'kazmisalwa1@gmail.com', password: '123456' })
    });
    const { data: { token } } = await loginRes.json();

    // 2. Update status of app 3 (the one the subagent created) to 'Applied' first to reset
    await fetch('http://localhost:5000/api/applications/3/status', {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Applied' })
    });

    // 3. Update status to 'Viewed by Company'
    const updateRes = await fetch('http://localhost:5000/api/applications/3/status', {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Viewed by Company' })
    });
    console.log(await updateRes.json());
}

test();
