const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';
const COMPANY_ID = '942e1bdc-1a9b-4980-b0c1-88b555ef00b6';

(async () => {
  try {
    // Login first
    console.log('🔐 Logging in...');
    const login = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });
    const token = login.data.data.token;
    console.log('✅ Logged in\n');

    // Test specific company
    console.log(`📋 Testing company ID: ${COMPANY_ID}`);
    try {
      const response = await axios.get(`${BASE_URL}/crm/companies/${COMPANY_ID}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Company found:');
      console.log('   Name:', response.data.data.name);
      console.log('   Industry:', response.data.data.industry);
      console.log('   Created:', response.data.data.created_at);
    } catch (error) {
      console.log('❌ Company not found:', error.response?.status, error.response?.data?.message);

      // List all companies
      console.log('\n📊 Fetching all companies...');
      const allCompanies = await axios.get(`${BASE_URL}/crm/companies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`Total companies: ${allCompanies.data.data.length}`);

      if (allCompanies.data.data.length > 0) {
        console.log('\nFirst 5 companies:');
        allCompanies.data.data.slice(0, 5).forEach((c, idx) => {
          console.log(`  ${idx + 1}. ${c.id} | ${c.name}`);
        });
      }
    }

    // Check legal documents
    console.log('\n\n📄 Checking legal documents...');
    try {
      const docs = await axios.get(`${BASE_URL}/legal/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`Total legal documents: ${docs.data.data?.length || 0}`);

      if (docs.data.data && docs.data.data.length > 0) {
        console.log('\nFirst 5 documents:');
        docs.data.data.slice(0, 5).forEach((d, idx) => {
          console.log(`  ${idx + 1}. ${d.title} | Type: ${d.document_type} | Status: ${d.status}`);
        });
      } else {
        console.log('❌ No legal documents found in database');
        console.log('💡 You may need to upload some documents or run a seed script');
      }
    } catch (error) {
      console.log('❌ Legal documents API error:', error.response?.status, error.response?.data?.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
})();
