const axios = require('axios');

(async () => {
  try {
    const loginRes = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'admin@example.com',
      password: 'password123'
    });
    const token = loginRes.data.data.token;
    console.log('✓ Logged in\n');

    const projectionRes = await axios.post(
      'http://localhost:3000/api/v1/financial/projections/generate',
      { months: 6 },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('✓ Cash Flow Projection Generated:\n');
    console.log('Metadata:', JSON.stringify(projectionRes.data.data.metadata, null, 2));
    console.log('\nProjection Data:');
    projectionRes.data.data.projection_data.forEach((month) => {
      console.log(
        `  ${month.month}: Balance $${month.projected_balance.toLocaleString()}, ` +
        `Income $${month.projected_income.toLocaleString()}, ` +
        `Expenses $${month.projected_expenses.toLocaleString()}`
      );
    });
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
})();
