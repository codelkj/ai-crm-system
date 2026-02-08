const axios = require('axios');

async function testAuth() {
  try {
    console.log('Testing authentication...');
    const response = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'admin@example.com',
      password: 'password123'
    });

    console.log('✅ Authentication successful!');
    console.log('Full response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Authentication failed');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
    console.log('Full error:', error.message);
  }
}

testAuth();
