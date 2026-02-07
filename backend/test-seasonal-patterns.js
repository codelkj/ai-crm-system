const axios = require('axios');

(async () => {
  try {
    console.log('🔮 Testing Seasonal Pattern Detection\n');

    const loginRes = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'admin@example.com',
      password: 'password123'
    });
    const token = loginRes.data.data.token;
    console.log('✓ Logged in\n');

    const patternsRes = await axios.get(
      'http://localhost:3000/api/v1/financial/projections/seasonal-patterns',
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = patternsRes.data.data;
    console.log('✓ Seasonal Patterns Detected:\n');
    console.log(`Pattern Strength: ${data.pattern_strength}%`);
    console.log(`Analysis Period: ${data.months_analyzed} months`);
    console.log(`\nHighest Expense Month: ${data.highest_expense_month} ($${data.highest_expense_amount.toLocaleString()})`);
    console.log(`Lowest Expense Month: ${data.lowest_expense_month} ($${data.lowest_expense_amount.toLocaleString()})`);
    
    console.log('\n📊 Monthly Patterns (first 6 months):');
    data.monthly_patterns.slice(0, 6).forEach(month => {
      console.log(`  ${month.month}: Avg Income $${month.avg_income.toLocaleString()}, Avg Expenses $${month.avg_expenses.toLocaleString()} (YoY: ${month.yoy_growth >= 0 ? '+' : ''}${month.yoy_growth}%)`);
    });

    console.log('\n💡 AI Insights:');
    data.ai_insights.forEach((insight, i) => {
      console.log(`  ${i + 1}. ${insight}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
})();
