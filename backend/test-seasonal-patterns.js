/**
 * Test Seasonal Pattern Detection
 * Run this script to test the seasonal pattern detection API
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api/v1';

// You'll need to replace this with a valid JWT token
// Login first and copy the token from the response
const AUTH_TOKEN = 'your-jwt-token-here';

async function testSeasonalPatterns() {
  try {
    console.log('\n🔮 Testing Seasonal Pattern Detection...\n');

    // Test seasonal pattern detection
    const response = await axios.get(
      `${API_BASE_URL}/financial/projections/seasonal-patterns`,
      {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
      }
    );

    console.log('✅ Seasonal Patterns Response:');
    console.log('=====================================');
    console.log(`Has Patterns: ${response.data.data.has_patterns}`);
    console.log(`Patterns Found: ${response.data.data.patterns?.length || 0}`);
    console.log('');

    if (response.data.data.has_patterns) {
      console.log('📊 Monthly Patterns:');
      response.data.data.patterns.forEach((pattern) => {
        console.log(
          `  ${pattern.month}: Income $${pattern.avg_income.toLocaleString()}, ` +
          `Expenses $${pattern.avg_expenses.toLocaleString()}, ` +
          `Balance $${pattern.avg_balance.toLocaleString()}, ` +
          `Strength: ${pattern.pattern_strength}%` +
          (pattern.year_over_year_growth
            ? `, YoY: ${pattern.year_over_year_growth > 0 ? '+' : ''}${pattern.year_over_year_growth}%`
            : '')
        );
      });
      console.log('');

      console.log('💡 AI Insights:');
      response.data.data.insights.forEach((insight, idx) => {
        console.log(`  ${idx + 1}. ${insight}`);
      });
      console.log('');

      console.log('📈 Metadata:');
      console.log(`  Data Points: ${response.data.data.metadata.data_points}`);
      console.log(`  Months Analyzed: ${response.data.data.metadata.months_analyzed}`);
      console.log(`  Historical Period: ${response.data.data.metadata.historical_period_months} months`);
    } else {
      console.log('⚠️  Not enough historical data to detect patterns');
      console.log('Insights:', response.data.data.insights);
    }

    console.log('\n✅ Test completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Error testing seasonal patterns:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data?.error?.message || error.message);
    } else {
      console.error(error.message);
    }
    console.log('');
  }
}

async function testProjectionWithSeasonal() {
  try {
    console.log('\n📈 Testing Cash Flow Projection with Seasonal Adjustments...\n');

    const response = await axios.post(
      `${API_BASE_URL}/financial/projections/generate`,
      { months: 6 },
      {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
      }
    );

    console.log('✅ Projection Response:');
    console.log('=====================================');
    console.log(`Uses Seasonal Adjustment: ${response.data.data.metadata?.uses_seasonal_adjustment}`);
    console.log(`Historical Period: ${response.data.data.metadata?.historical_period_days} days`);
    console.log(`Avg Monthly Income: $${response.data.data.metadata?.avg_monthly_income?.toLocaleString()}`);
    console.log(`Avg Monthly Expenses: $${response.data.data.metadata?.avg_monthly_expenses?.toLocaleString()}`);
    console.log('');

    console.log('📊 Projected Cash Flow:');
    response.data.data.projection_data.forEach((item) => {
      const adjSymbol = item.seasonal_adjustment > 0 ? '↑' : item.seasonal_adjustment < 0 ? '↓' : '→';
      console.log(
        `  ${item.month}: Balance $${item.projected_balance.toLocaleString()}, ` +
        `Income $${item.projected_income.toLocaleString()}, ` +
        `Expenses $${item.projected_expenses.toLocaleString()} ` +
        `${adjSymbol} ${Math.abs(item.seasonal_adjustment)}% seasonal adj`
      );
    });

    console.log('\n✅ Test completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Error testing projection:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data?.error?.message || error.message);
    } else {
      console.error(error.message);
    }
    console.log('');
  }
}

// Instructions
console.log(`
╔═══════════════════════════════════════════════════════════════╗
║         Seasonal Pattern Detection Test Script               ║
╚═══════════════════════════════════════════════════════════════╝

Instructions:
1. Make sure the backend server is running on port 3001
2. Login to get a JWT token:
   POST http://localhost:3001/api/v1/auth/login
   { "email": "your-email", "password": "your-password" }
3. Copy the token from the response
4. Replace AUTH_TOKEN in this file with your token
5. Run: node test-seasonal-patterns.js

Note: You need at least some transaction data to see meaningful results.
For best results, upload CSV files with 12-24 months of data.
`);

// Check if token is set
if (AUTH_TOKEN === 'your-jwt-token-here') {
  console.log('⚠️  Please set your AUTH_TOKEN first!\n');
} else {
  // Run tests
  (async () => {
    await testSeasonalPatterns();
    await testProjectionWithSeasonal();
  })();
}
