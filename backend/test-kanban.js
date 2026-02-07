const axios = require('axios');

(async () => {
  try {
    // Login
    const loginRes = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'admin@example.com',
      password: 'password123'
    });
    const token = loginRes.data.data.token;
    console.log('✓ Logged in successfully\n');

    // Test kanban endpoint
    const kanbanRes = await axios.get('http://localhost:3000/api/v1/sales/kanban', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✓ Kanban endpoint response:');
    console.log(JSON.stringify(kanbanRes.data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
})();
