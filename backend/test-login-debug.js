const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'admin@example.com',
      password: 'password123'
    });

    console.log('Login Response Status:', response.status);
    console.log('Login Response Data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Login Error:', error.response?.data || error.message);
  }
}

testLogin();
