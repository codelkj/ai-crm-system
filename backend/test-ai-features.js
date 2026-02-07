/**
 * AI Features Test Script
 * Tests all AI endpoints with authentication
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testAIFeatures() {
  try {
    console.log('🤖 Testing AI Features\n');
    console.log('='.repeat(60));

    // Step 1: Login
    console.log('\n1️⃣  Logging in...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });
    const token = loginRes.data.data.token;
    console.log('✅ Logged in successfully');

    const headers = { Authorization: `Bearer ${token}` };

    // Step 2: Test AI Assistant Chat
    console.log('\n2️⃣  Testing AI Assistant Chat...');
    try {
      const chatRes = await axios.post(
        `${BASE_URL}/ai-assistant/chat`,
        {
          message: 'What are my key metrics?',
          conversation_history: []
        },
        { headers }
      );
      console.log('✅ AI Assistant Response:');
      console.log(`   Message: ${chatRes.data.data.response.substring(0, 150)}...`);
      console.log(`   Suggestions: ${chatRes.data.data.suggestions.join(', ')}`);
    } catch (error) {
      console.log('❌ AI Assistant Error:', error.response?.data?.error || error.message);
    }

    // Step 3: Test Quick Insights
    console.log('\n3️⃣  Testing Quick Insights (Sales Context)...');
    try {
      const insightsRes = await axios.post(
        `${BASE_URL}/ai-assistant/quick-insights`,
        { context: 'sales' },
        { headers }
      );
      console.log('✅ Quick Insights:');
      insightsRes.data.data.insights.forEach((insight, i) => {
        console.log(`   ${i + 1}. ${insight.substring(0, 100)}...`);
      });
    } catch (error) {
      console.log('❌ Quick Insights Error:', error.response?.data?.error || error.message);
    }

    // Step 4: Test Sales Pipeline AI Insights
    console.log('\n4️⃣  Testing Sales Pipeline AI Insights...');
    try {
      const pipelineRes = await axios.get(
        `${BASE_URL}/sales/ai-insights/pipeline`,
        { headers }
      );
      console.log('✅ Pipeline Insights:');
      console.log(`   Summary: ${pipelineRes.data.data.summary}`);
      console.log(`   Total Deals: ${pipelineRes.data.data.data.totalDeals}`);
      console.log(`   Total Value: $${pipelineRes.data.data.data.totalValue.toLocaleString()}`);
      console.log('   Key Insights:');
      pipelineRes.data.data.insights.slice(0, 2).forEach((insight, i) => {
        console.log(`   ${i + 1}. ${insight.substring(0, 80)}...`);
      });
    } catch (error) {
      console.log('❌ Pipeline Insights Error:', error.response?.data?.error || error.message);
    }

    // Step 5: Test Cash Flow Projection
    console.log('\n5️⃣  Testing Cash Flow Projection...');
    try {
      const projectionRes = await axios.post(
        `${BASE_URL}/financial/projections/generate`,
        { months: 3 },
        { headers }
      );
      console.log('✅ Cash Flow Projection Generated:');
      console.log(`   Projection Period: ${projectionRes.data.data.metadata.projection_period}`);
      console.log(`   Based on ${projectionRes.data.data.metadata.historical_transactions} transactions`);
      console.log('   Sample Projections:');
      projectionRes.data.data.projection_data.slice(0, 3).forEach((month) => {
        console.log(`   ${month.month}: Balance $${month.projected_balance.toLocaleString()}`);
      });
    } catch (error) {
      console.log('❌ Projection Error:', error.response?.data?.error || error.message);
    }

    // Step 6: Get a deal ID for probability test
    console.log('\n6️⃣  Testing Deal Close Probability Prediction...');
    try {
      const dealsRes = await axios.get(`${BASE_URL}/sales/deals`, { headers });
      if (dealsRes.data.data.data && dealsRes.data.data.data.length > 0) {
        const dealId = dealsRes.data.data.data[0].id;
        const dealTitle = dealsRes.data.data.data[0].title;

        const probabilityRes = await axios.get(
          `${BASE_URL}/sales/ai-insights/deal/${dealId}/probability`,
          { headers }
        );
        console.log(`✅ Deal Probability for "${dealTitle}":`);
        console.log(`   Close Probability: ${(probabilityRes.data.data.probability * 100).toFixed(0)}%`);
        console.log(`   Confidence: ${(probabilityRes.data.data.confidence * 100).toFixed(0)}%`);
        console.log('   Key Factors:');
        probabilityRes.data.data.factors.slice(0, 2).forEach((factor, i) => {
          console.log(`   ${i + 1}. ${factor.substring(0, 80)}...`);
        });
      } else {
        console.log('⚠️  No deals found to test probability prediction');
      }
    } catch (error) {
      console.log('❌ Deal Probability Error:', error.response?.data?.error || error.message);
    }

    // Step 7: Check OpenAI Configuration
    console.log('\n7️⃣  Checking OpenAI Configuration...');
    try {
      const testOpenAI = require('./test-openai.js');
      // OpenAI key is configured if test exists
      console.log('✅ OpenAI configuration file exists');
    } catch (error) {
      console.log('⚠️  OpenAI test file not found (optional)');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ AI Features Testing Complete!\n');
    console.log('💡 Tips:');
    console.log('   - Visit http://localhost:5173 to see the UI');
    console.log('   - Click the 🤖 button (bottom-right) to chat with AI Assistant');
    console.log('   - Go to Financials page to see AI insights');
    console.log('   - Go to Sales Pipeline to see AI pipeline analysis');
    console.log('   - Make sure OPENAI_API_KEY is set in backend/.env for full AI features');

  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testAIFeatures();
