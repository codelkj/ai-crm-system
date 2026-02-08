const axios = require('axios');

async function testAIFeatures() {
  const baseURL = 'http://localhost:3000/api/v1';
  let token = '';

  console.log('🧪 AI Features Integration Test\n');
  console.log('='.repeat(50));

  // 1. Login
  try {
    console.log('\n1️⃣ Testing Authentication...');
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });
    token = loginRes.data.data.token;
    console.log('✅ Login successful');
  } catch (err) {
    console.log('❌ Login failed:', err.response?.data?.message || err.message);
    console.log('   Full error:', err.response?.data);
    return;
  }

  const headers = { Authorization: `Bearer ${token}` };

  // 2. Test AI Assistant Chat
  try {
    console.log('\n2️⃣ Testing AI Assistant Chat...');
    const chatRes = await axios.post(`${baseURL}/ai-assistant/chat`, {
      message: 'What AI features are available in this CRM?',
      context: 'general'
    }, { headers, timeout: 30000 });
    console.log('✅ AI Chat working');
    console.log('   Response preview:', chatRes.data.response.substring(0, 100) + '...');
  } catch (err) {
    console.log('❌ AI Chat failed:', err.response?.data?.message || err.message);
  }

  // 3. Test Sales AI Insights
  try {
    console.log('\n3️⃣ Testing Sales AI Insights...');
    const salesRes = await axios.get(`${baseURL}/sales/ai-insights/pipeline`, {
      headers,
      timeout: 30000
    });
    console.log('✅ Sales AI Insights working');
    console.log('   Pipeline health:', salesRes.data.pipelineHealth);
    console.log('   Insights count:', salesRes.data.insights?.length || 0);
  } catch (err) {
    console.log('❌ Sales AI failed:', err.response?.data?.message || err.message);
  }

  // 4. Test Intake Classification
  try {
    console.log('\n4️⃣ Testing Intake Classification...');
    const intakeRes = await axios.post(`${baseURL}/ai/intake-classification`, {
      inquiryNotes: 'Client needs help with a contract dispute. Urgent matter, court date in 2 weeks.',
      clientType: 'corporate'
    }, { headers, timeout: 30000 });
    console.log('✅ Intake Classification working');
    console.log('   Department:', intakeRes.data.department);
    console.log('   Matter Type:', intakeRes.data.matterType);
    console.log('   Urgency:', intakeRes.data.urgency);
    console.log('   Confidence:', Math.round(intakeRes.data.confidence * 100) + '%');
  } catch (err) {
    console.log('❌ Intake Classification failed:', err.response?.data?.message || err.message);
  }

  // 5. Test Financial Projections
  try {
    console.log('\n5️⃣ Testing Financial Projections...');
    const projRes = await axios.get(`${baseURL}/financial/projections`, { headers });
    console.log('✅ Financial Projections working');
    console.log('   Months projected:', projRes.data.length);
  } catch (err) {
    console.log('❌ Financial Projections failed:', err.response?.data?.message || err.message);
  }

  // 6. Test Seasonal Patterns
  try {
    console.log('\n6️⃣ Testing Seasonal Pattern Detection...');
    const seasonalRes = await axios.get(`${baseURL}/financial/projections/seasonal-patterns`, {
      headers,
      timeout: 30000
    });
    console.log('✅ Seasonal Patterns working');
    console.log('   Pattern strength:', seasonalRes.data.patternStrength + '%');
    console.log('   AI Insights:', seasonalRes.data.aiInsights?.length || 0);
  } catch (err) {
    console.log('❌ Seasonal Patterns failed:', err.response?.data?.message || err.message);
  }

  // 7. Test Transaction Categorization
  try {
    console.log('\n7️⃣ Testing Transaction Categorization...');
    const transRes = await axios.get(`${baseURL}/financial/transactions?limit=5`, { headers });
    console.log('✅ Transactions working');
    console.log('   Transactions fetched:', transRes.data.transactions?.length || 0);
    if (transRes.data.transactions?.[0]) {
      const t = transRes.data.transactions[0];
      console.log('   Sample AI confidence:', Math.round((t.ai_confidence || 0) * 100) + '%');
    }
  } catch (err) {
    console.log('❌ Transactions failed:', err.response?.data?.message || err.message);
  }

  // 8. Test Quick Insights
  try {
    console.log('\n8️⃣ Testing Quick Insights...');
    const insightsRes = await axios.post(`${baseURL}/ai-assistant/quick-insights`, {
      context: 'dashboard'
    }, { headers, timeout: 30000 });
    console.log('✅ Quick Insights working');
    console.log('   Insights:', insightsRes.data.insights?.substring(0, 80) + '...');
  } catch (err) {
    console.log('❌ Quick Insights failed:', err.response?.data?.message || err.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n✅ AI Features Test Complete!\n');
}

testAIFeatures().catch(console.error);
