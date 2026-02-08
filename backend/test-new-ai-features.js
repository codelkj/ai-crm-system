const axios = require('axios');

async function testNewAIIntegrations() {
  const baseURL = 'http://localhost:3000/api/v1';
  let token = '';

  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║     🤖 NEW AI INTEGRATIONS TEST SUITE                  ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  // 1. Login
  try {
    console.log('🔐 Authenticating...');
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });
    token = loginRes.data.data.token;
    console.log('✅ Authentication successful\n');
  } catch (err) {
    console.log('❌ Login failed:', err.response?.data?.message || err.message);
    return;
  }

  const headers = { Authorization: `Bearer ${token}` };

  // Test 1: Intake Classification (NEW INTEGRATION)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1️⃣  INTAKE CLASSIFIER (Dashboard & Lightning Path)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const intakeRes = await axios.post(`${baseURL}/ai/intake/classify`, {
      notes: 'Client needs help with a shareholder dispute. Two partners want to buy out the third. Urgent meeting scheduled for next week. Business value approximately R5 million.',
      clientType: 'corporate'
    }, { headers, timeout: 30000 });

    const data = intakeRes.data.data || intakeRes.data;
    console.log('   Status: ✅ Working');
    console.log(`   Department: ${data.department}`);
    console.log(`   Matter Type: ${data.matterType}`);
    console.log(`   Urgency: ${data.urgency}`);
    console.log(`   Confidence: ${Math.round(data.confidence * 100)}%`);
    if (data.estimatedValue) {
      console.log(`   Estimated Value: R ${data.estimatedValue.toLocaleString()}`);
    }
    console.log(`   Reasoning: ${data.reasoning?.substring(0, 80)}...\n`);
  } catch (err) {
    console.log(`   Status: ❌ Failed`);
    console.log(`   Error: ${err.response?.status} - ${err.response?.data?.message || err.message}\n`);
  }

  // Test 2: FICA Compliance (NEW INTEGRATION)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('2️⃣  FICA COMPLIANCE CHECKER (Companies Page)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    // Get a company first
    const companiesRes = await axios.get(`${baseURL}/crm/companies?limit=1`, { headers });
    const companies = companiesRes.data.data || companiesRes.data;

    if (companies.length > 0) {
      const clientId = companies[0].id;
      const ficaRes = await axios.get(`${baseURL}/ai/fica/gaps/${clientId}`, {
        headers,
        timeout: 30000
      });

      const data = ficaRes.data.data || ficaRes.data;
      console.log('   Status: ✅ Working');
      console.log(`   Compliance Status: ${data.complianceStatus}`);
      console.log(`   Completion: ${data.completionPercentage}%`);
      console.log(`   Missing Documents: ${data.missingDocuments?.length || 0}`);
      console.log(`   Expiring Soon: ${data.expiringSoon?.length || 0}`);
      console.log(`   AI Recommendations: ${data.recommendations?.length || 0}\n`);
    } else {
      console.log('   Status: ⚠️  No companies found to test\n');
    }
  } catch (err) {
    console.log(`   Status: ❌ Failed`);
    console.log(`   Error: ${err.response?.status} - ${err.response?.data?.message || err.message}\n`);
  }

  // Test 3: Document Summarization (NEW INTEGRATION)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('3️⃣  DOCUMENT SUMMARY (Legal Documents Page)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    // Get a document first
    const docsRes = await axios.get(`${baseURL}/legal/documents?limit=1`, { headers });
    const docs = docsRes.data.data || docsRes.data;

    if (docs.length > 0) {
      const documentId = docs[0].id;
      const summaryRes = await axios.get(`${baseURL}/ai/documents/summarize/${documentId}`, {
        headers,
        timeout: 30000
      });

      const data = summaryRes.data.data || summaryRes.data;
      console.log('   Status: ✅ Working');
      console.log(`   Document: ${docs[0].title}`);
      console.log(`   Summary: ${data.summary?.substring(0, 100)}...`);
      console.log(`   Key Points: ${data.keyPoints?.length || 0}`);
      console.log(`   Confidence: ${Math.round(data.confidence * 100)}%`);
      console.log(`   Word Count: ${data.wordCount}`);
      console.log(`   Processing Time: ${(data.processingTime / 1000).toFixed(2)}s\n`);
    } else {
      console.log('   Status: ⚠️  No documents found to test\n');
    }
  } catch (err) {
    console.log(`   Status: ❌ Failed`);
    console.log(`   Error: ${err.response?.status} - ${err.response?.data?.message || err.message}\n`);
  }

  // Test 4: Contract Analysis (NEW INTEGRATION)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('4️⃣  CONTRACT ANALYSIS (Legal Documents Page)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    // Get a document first
    const docsRes = await axios.get(`${baseURL}/legal/documents?limit=1`, { headers });
    const docs = docsRes.data.data || docsRes.data;

    if (docs.length > 0) {
      const documentId = docs[0].id;
      const analysisRes = await axios.get(`${baseURL}/ai/contracts/analyze/${documentId}`, {
        headers,
        timeout: 30000
      });

      const data = analysisRes.data.data || analysisRes.data;
      console.log('   Status: ✅ Working');
      console.log(`   Document: ${docs[0].title}`);
      console.log(`   Overall Risk Score: ${data.overallRiskScore}/100`);
      console.log(`   Confidence: ${Math.round(data.confidence * 100)}%`);
      console.log(`   Parties Identified: ${data.parties?.length || 0}`);
      console.log(`   Obligations: ${data.obligations?.length || 0}`);
      console.log(`   Risks: ${data.risks?.length || 0}`);
      console.log(`   Recommendations: ${data.recommendations?.length || 0}\n`);
    } else {
      console.log('   Status: ⚠️  No documents found to test\n');
    }
  } catch (err) {
    console.log(`   Status: ❌ Failed`);
    console.log(`   Error: ${err.response?.status} - ${err.response?.data?.message || err.message}\n`);
  }

  // Test 5: Existing AI Features (Sanity Check)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('5️⃣  EXISTING AI FEATURES (Sanity Check)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // AI Assistant
  try {
    const chatRes = await axios.post(`${baseURL}/ai-assistant/chat`, {
      message: 'What AI features are available?',
      conversation_history: []
    }, { headers, timeout: 30000 });
    console.log('   AI Assistant: ✅ Working');
  } catch (err) {
    console.log(`   AI Assistant: ❌ Failed`);
  }

  // Sales Insights
  try {
    const salesRes = await axios.get(`${baseURL}/sales/ai-insights/pipeline`, {
      headers,
      timeout: 30000
    });
    console.log('   Sales AI Insights: ✅ Working');
  } catch (err) {
    console.log(`   Sales AI Insights: ❌ Failed`);
  }

  // Financial Projections
  try {
    const projRes = await axios.get(`${baseURL}/financial/projections`, { headers });
    console.log('   Financial Projections: ✅ Working');
  } catch (err) {
    console.log(`   Financial Projections: ❌ Failed`);
  }

  // Seasonal Patterns
  try {
    const seasonalRes = await axios.get(`${baseURL}/financial/projections/seasonal-patterns`, {
      headers,
      timeout: 30000
    });
    console.log('   Seasonal Patterns: ✅ Working');
  } catch (err) {
    console.log(`   Seasonal Patterns: ❌ Failed`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n✅ AI Integration Test Complete!\n');
}

testNewAIIntegrations().catch(console.error);
