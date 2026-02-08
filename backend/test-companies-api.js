const axios = require('axios');

(async () => {
  try {
    console.log('🔍 Testing companies API...\n');

    // First login to get a token
    const loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'admin@example.com',
      password: 'password123'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    console.log('Token firm_id:', loginResponse.data.data.user.firm_id);

    // Now test companies API
    console.log('\n🏢 Fetching companies...');
    const companiesResponse = await axios.get('http://localhost:3000/api/v1/crm/companies', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Success! Companies found:', companiesResponse.data.data?.length || 0);
    console.log('\nFirst 3 companies:');
    companiesResponse.data.data?.slice(0, 3).forEach((company, i) => {
      console.log(`  ${i + 1}. ${company.name} (${company.industry || 'No industry'})`);
    });

  } catch (error) {
    if (error.response) {
      console.error('\n❌ API Error:', error.response.status);
      console.error('Error data:', JSON.stringify(error.response.data, null, 2));

      if (error.response.status === 500) {
        console.error('\n💡 This is a backend error. Check server logs for details.');
      }
    } else {
      console.error('❌ Error:', error.message);
    }
  }
})();
