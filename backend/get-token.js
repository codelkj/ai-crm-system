/**
 * Get JWT Token - Quick helper script
 */

const axios = require('axios');

async function getToken() {
  const BASE_URL = 'http://localhost:3000/api/v1';

  console.log('🔐 Getting JWT Token...\n');

  try {
    // Try to register a new user
    const email = `user-${Date.now()}@example.com`;
    const password = 'Test123!';

    console.log(`📧 Email: ${email}`);
    console.log(`🔒 Password: ${password}\n`);

    const res = await axios.post(`${BASE_URL}/auth/register`, {
      email,
      password,
      first_name: 'API',
      last_name: 'User'
    });

    const token = res.data.data.token;

    console.log('✅ Token Generated Successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 COPY THIS TOKEN:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(token);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎯 How to Use in Swagger UI:');
    console.log('   1. Go to: http://localhost:3000/api/v1/docs');
    console.log('   2. Click the green "Authorize" button');
    console.log('   3. Paste the token above');
    console.log('   4. Click "Authorize" then "Close"\n');

    console.log('💡 Or use in curl:');
    console.log(`   curl -H "Authorization: Bearer ${token.substring(0, 20)}..." http://localhost:3000/api/v1/financial/categories\n`);

    console.log('📧 Login credentials saved:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}\n`);

  } catch (error) {
    if (error.response?.status === 409) {
      console.log('❌ User already exists. Let me try logging in...\n');
    } else {
      console.error('❌ Error:', error.response?.data || error.message);
    }
  }
}

getToken();
