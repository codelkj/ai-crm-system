const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/v1';

async function testMatterCreation() {
  try {
    // Login
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });

    const token = loginRes.data.data.token;
    console.log('Logged in successfully');

    // Get first company
    const companiesRes = await axios.get(`${API_BASE}/crm/companies?limit=1`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const company = companiesRes.data.data[0];
    console.log('Company:', company.id, company.name);

    // Create matter
    const matterData = {
      company_id: company.id,
      title: 'Test Matter Schema Fix',
      matter_type: 'Corporate',
      budget_hours: 50,
      budget_amount: 10000
    };

    console.log('\nCreating matter with data:', JSON.stringify(matterData, null, 2));

    const matterRes = await axios.post(`${API_BASE}/matters`, matterData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\nSuccess!');
    console.log('Matter created:', JSON.stringify(matterRes.data, null, 2));

  } catch (error) {
    console.error('\nError:', error.response?.status);
    console.error('Error data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Error message:', error.message);
  }
}

testMatterCreation();
