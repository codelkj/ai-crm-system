const axios = require('axios');

(async () => {
  try {
    const loginRes = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'admin@example.com',
      password: 'password123'
    });
    const token = loginRes.data.data.token;

    const txRes = await axios.get('http://localhost:3000/api/v1/financial/transactions?limit=2', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(JSON.stringify(txRes.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
})();
