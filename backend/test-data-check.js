const axios = require('axios');

(async () => {
  try {
    const login = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'admin@example.com',
      password: 'password123'
    });
    const token = login.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    
    console.log('📊 Checking Data Availability:\n');
    
    // Companies
    try {
      const companies = await axios.get('http://localhost:3000/api/v1/crm/companies', { headers });
      console.log('✅ Companies:', companies.data.data?.length || 0);
    } catch(e) { 
      console.log('❌ Companies:', e.response?.status, e.response?.data?.message || e.message); 
    }
    
    // Invoices
    try {
      const invoices = await axios.get('http://localhost:3000/api/v1/invoicing/invoices', { headers });
      console.log('✅ Invoices:', invoices.data.data?.length || 0);
    } catch(e) { 
      console.log('❌ Invoices:', e.response?.status, e.response?.data?.message || e.message); 
    }
    
    // Legal Documents
    try {
      const docs = await axios.get('http://localhost:3000/api/v1/legal/documents', { headers });
      console.log('✅ Legal Docs:', docs.data.data?.length || 0);
    } catch(e) { 
      console.log('❌ Legal Docs:', e.response?.status, e.response?.data?.message || e.message); 
    }
    
    // Matters
    try {
      const matters = await axios.get('http://localhost:3000/api/v1/matters', { headers });
      console.log('✅ Matters:', matters.data.data?.length || 0);
    } catch(e) { 
      console.log('❌ Matters:', e.response?.status, e.response?.data?.message || e.message); 
    }
    
    // Time Entries
    try {
      const timesheet = await axios.get('http://localhost:3000/api/v1/time-tracking/entries', { headers });
      console.log('✅ Time Entries:', timesheet.data.data?.length || 0);
    } catch(e) { 
      console.log('❌ Time Entries:', e.response?.status, e.response?.data?.message || e.message); 
    }
    
    // Lightning Path
    try {
      const lightning = await axios.get('http://localhost:3000/api/v1/lightning-path', { headers });
      console.log('✅ Lightning Path:', lightning.data.data?.length || 0);
    } catch(e) { 
      console.log('❌ Lightning Path:', e.response?.status, e.response?.data?.message || e.message); 
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
