const axios = require('axios');

(async () => {
  try {
    const loginRes = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'admin@example.com',
      password: 'password123'
    });
    const token = loginRes.data.data.token;
    console.log('✓ Logged in successfully\n');

    // Test companies endpoint
    const companiesRes = await axios.get('http://localhost:3000/api/v1/crm/companies', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✓ Companies endpoint response:');
    console.log(`Total companies: ${companiesRes.data.data.length}`);
    console.log('\nFirst 3 companies:');
    companiesRes.data.data.slice(0, 3).forEach((company, i) => {
      console.log(`\n${i + 1}. ${company.name}`);
      console.log(`   Industry: ${company.industry}`);
      console.log(`   Website: ${company.website}`);
      console.log(`   City: ${company.city}, ${company.state}`);
    });
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
})();
