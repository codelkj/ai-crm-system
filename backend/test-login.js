const axios = require('axios');

(async () => {
  try {
    console.log('🔐 Testing login endpoint...\n');

    const response = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'admin@example.com',
      password: 'password123' // From login page demo credentials
    });

    console.log('✅ Login successful!\n');

    const { token, user } = response.data.data;

    // Decode JWT
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, 'base64')
        .toString('ascii')
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);

    console.log('User from response:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Firm ID:', user.firm_id);

    console.log('\nDecoded JWT Token:');
    console.log(JSON.stringify(decoded, null, 2));

    if (decoded.firm_id) {
      console.log('\n✅ Token INCLUDES firm_id:', decoded.firm_id);
    } else {
      console.log('\n❌ Token MISSING firm_id!');
      console.log('This is the problem - the token generation is not including firm_id');
    }

  } catch (error) {
    if (error.response) {
      console.error('❌ Login failed:', error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
})();
