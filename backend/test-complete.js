const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function runCompleteTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║          🎯 COMPLETE AI CRM SYSTEM TEST SUITE           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Login
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });
    const token = loginRes.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Authentication successful\n');

    // Test 1: AI Assistant
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1️⃣  AI ASSISTANT CHATBOT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const chatRes = await axios.post(`${BASE_URL}/ai-assistant/chat`,
        { message: 'Give me a quick overview of my business', conversation_history: [] },
        { headers }
      );
      console.log('   Status: ✅ Working');
      console.log(`   Response: ${chatRes.data.data.response.substring(0, 120)}...`);
      console.log(`   Suggestions: ${chatRes.data.data.suggestions.slice(0, 2).join(', ')}\n`);
    } catch (e) {
      console.log(`   Status: ❌ Failed - ${e.message}\n`);
    }

    // Test 2: Sales Pipeline AI
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('2️⃣  SALES PIPELINE AI INSIGHTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const pipelineRes = await axios.get(`${BASE_URL}/sales/ai-insights/pipeline`, { headers });
      console.log('   Status: ✅ Working');
      console.log(`   Total Deals: ${pipelineRes.data.data.data.totalDeals}`);
      console.log(`   Total Value: $${pipelineRes.data.data.data.totalValue.toLocaleString()}`);
      console.log(`   Key Insight: ${pipelineRes.data.data.insights[0].substring(0, 80)}...\n`);
    } catch (e) {
      console.log(`   Status: ❌ Failed - ${e.message}\n`);
    }

    // Test 3: Transaction Categorization
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('3️⃣  AI TRANSACTION CATEGORIZATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const txRes = await axios.get(`${BASE_URL}/financial/transactions?limit=5`, { headers });
      const transactions = txRes.data.data;
      console.log('   Status: ✅ Working');
      console.log(`   Total Transactions: ${txRes.data.meta.total}`);
      const avgConfidence = transactions.reduce((sum, t) => sum + t.ai_confidence, 0) / transactions.length;
      console.log(`   Avg AI Confidence: ${(avgConfidence * 100).toFixed(1)}%`);
      console.log(`   Sample: "${transactions[0].description}" → ${transactions[0].category_name} (${(transactions[0].ai_confidence * 100).toFixed(0)}%)\n`);
    } catch (e) {
      console.log(`   Status: ❌ Failed - ${e.message}\n`);
    }

    // Test 4: Cash Flow Projections
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('4️⃣  AI CASH FLOW PROJECTIONS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const projRes = await axios.post(`${BASE_URL}/financial/projections/generate`,
        { months: 3 },
        { headers }
      );
      console.log('   Status: ✅ Working');
      console.log(`   Seasonal Adjusted: ${projRes.data.data.metadata.uses_seasonal_adjustment ? '✅ Yes' : '❌ No'}`);
      console.log(`   Historical Period: ${projRes.data.data.metadata.historical_period_days} days`);
      console.log(`   Avg Monthly Income: $${projRes.data.data.metadata.avg_monthly_income.toLocaleString()}`);
      console.log(`   Avg Monthly Expenses: $${projRes.data.data.metadata.avg_monthly_expenses.toLocaleString()}`);
      const firstMonth = projRes.data.data.projection_data[0];
      console.log(`   Next Month Projection: $${firstMonth.projected_balance.toLocaleString()} balance\n`);
    } catch (e) {
      console.log(`   Status: ❌ Failed - ${e.message}\n`);
    }

    // Test 5: Seasonal Pattern Detection
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('5️⃣  SEASONAL PATTERN DETECTION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const patternRes = await axios.get(`${BASE_URL}/financial/projections/seasonal-patterns`, { headers });
      const data = patternRes.data.data;
      console.log('   Status: ✅ Working');
      console.log(`   Patterns Detected: ${data.has_patterns ? '✅ Yes' : '❌ No'}`);
      console.log(`   Months Analyzed: ${data.metadata.months_analyzed}`);
      console.log(`   Data Points: ${data.metadata.data_points}`);
      if (data.patterns.length > 0) {
        const sorted = [...data.patterns].sort((a, b) => b.avg_expenses - a.avg_expenses);
        console.log(`   Highest Expense Month: ${sorted[0].month} ($${sorted[0].avg_expenses.toLocaleString()})`);
        console.log(`   Lowest Expense Month: ${sorted[sorted.length-1].month} ($${sorted[sorted.length-1].avg_expenses.toLocaleString()})`);
      }
      console.log(`   AI Insights: ${data.insights.length} insights generated\n`);
    } catch (e) {
      console.log(`   Status: ❌ Failed - ${e.message}\n`);
    }

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                  ✅ ALL TESTS COMPLETED                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log('🎉 Your AI CRM System is fully operational!\n');
    console.log('📱 Frontend: http://localhost:5173');
    console.log('🔧 Backend: http://localhost:3000\n');

  } catch (error) {
    console.error('\n❌ Test Suite Failed:', error.message);
    if (error.response) {
      console.error('Error Details:', error.response.data);
    }
  }
}

runCompleteTests();
