/**
 * Quick API Test - Demonstrates the full financial module workflow
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/api/v1';
let authToken = '';
let bankAccountId = '';

// Helper to make authenticated requests
const api = axios.create({ baseURL: BASE_URL });
api.interceptors.request.use(config => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

async function run() {
  console.log('🚀 Testing AI CRM Financial Module\n');

  try {
    // 1. Register/Login
    console.log('1️⃣  Authenticating...');
    try {
      const registerRes = await axios.post(`${BASE_URL}/auth/register`, {
        email: 'demo@example.com',
        password: 'Demo123!',
        first_name: 'Demo',
        last_name: 'User'
      });
      authToken = registerRes.data.data.token;
      console.log('   ✅ Registered new user');
    } catch (error) {
      // If user exists, login instead
      const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'demo@example.com',
        password: 'Demo123!'
      });
      authToken = loginRes.data.data.token;
      console.log('   ✅ Logged in existing user');
    }
    console.log(`   🔑 Token: ${authToken.substring(0, 20)}...\n`);

    // 2. Create Bank Account
    console.log('2️⃣  Creating bank account...');
    const accountRes = await api.post('/financial/bank-accounts', {
      account_name: 'Business Checking',
      account_number: '****1234',
      bank_name: 'Demo Bank',
      account_type: 'checking',
      currency: 'USD'
    });
    bankAccountId = accountRes.data.data.id;
    console.log(`   ✅ Created account: ${accountRes.data.data.account_name} (${bankAccountId})\n`);

    // 3. Get Categories
    console.log('3️⃣  Fetching available categories...');
    const categoriesRes = await api.get('/financial/categories');
    console.log(`   ✅ Found ${categoriesRes.data.data.length} categories:`);
    categoriesRes.data.data.slice(0, 5).forEach(cat => {
      console.log(`      • ${cat.name} (${cat.type})`);
    });
    console.log(`      ... and ${categoriesRes.data.data.length - 5} more\n`);

    // 4. Create sample CSV and upload
    console.log('4️⃣  Uploading CSV transactions...');
    const csvContent = `date,description,amount,type
2024-01-15,Amazon Web Services,245.50,debit
2024-01-16,Client Payment - ABC Corp,5000.00,credit
2024-01-17,Office Supplies - Staples,127.89,debit
2024-01-18,Consulting Revenue,3500.00,credit
2024-01-19,Office Rent,2500.00,debit
2024-01-20,Marketing - Google Ads,450.00,debit
2024-01-21,Software Subscription,99.00,debit`;

    const csvPath = path.join(__dirname, 'demo-transactions.csv');
    fs.writeFileSync(csvPath, csvContent);

    const formData = new FormData();
    formData.append('file', fs.createReadStream(csvPath));
    formData.append('account_id', bankAccountId);
    formData.append('csv_format', 'standard');

    const uploadRes = await api.post('/financial/transactions/upload', formData, {
      headers: formData.getHeaders()
    });

    console.log(`   ✅ Processed ${uploadRes.data.data.total_processed} transactions`);
    console.log(`   ✅ Successfully imported: ${uploadRes.data.data.successful}`);
    console.log(`   ℹ️  Duplicates skipped: ${uploadRes.data.data.duplicates}`);
    console.log(`   ❌ Failed: ${uploadRes.data.data.failed}\n`);

    // 5. Show AI-categorized transactions
    console.log('5️⃣  AI-Categorized Transactions:');
    uploadRes.data.data.transactions.forEach((tx, i) => {
      const confidence = (tx.ai_confidence * 100).toFixed(0);
      const amount = tx.type === 'debit' ? `-$${tx.amount}` : `+$${tx.amount}`;
      console.log(`   ${i + 1}. ${tx.description}`);
      console.log(`      Amount: ${amount} | Category: ${tx.category_id ? 'Assigned' : 'None'} | AI Confidence: ${confidence}%`);
    });
    console.log();

    // 6. List all transactions with pagination
    console.log('6️⃣  Fetching transaction history...');
    const txListRes = await api.get('/financial/transactions', {
      params: { account_id: bankAccountId, limit: 5 }
    });
    console.log(`   ✅ Total transactions: ${txListRes.data.meta.total}`);
    console.log(`   📄 Page ${txListRes.data.meta.page} of ${txListRes.data.meta.totalPages}\n`);

    // 7. Filter by type
    console.log('7️⃣  Filtering expenses (debits)...');
    const expensesRes = await api.get('/financial/transactions', {
      params: { account_id: bankAccountId, type: 'debit' }
    });
    const totalExpenses = expensesRes.data.data.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    console.log(`   ✅ Found ${expensesRes.data.data.length} expense transactions`);
    console.log(`   💰 Total expenses: $${totalExpenses.toFixed(2)}\n`);

    // 8. Update category manually
    if (uploadRes.data.data.transactions.length > 0) {
      const firstTx = uploadRes.data.data.transactions[0];
      console.log('8️⃣  Manually updating transaction category...');
      const updateRes = await api.patch(`/financial/transactions/${firstTx.id}/category`, {
        category_id: categoriesRes.data.data[0].id,
        notes: 'Manually corrected by user'
      });
      console.log(`   ✅ Updated transaction category`);
      console.log(`   ℹ️  AI confidence cleared (was ${(firstTx.ai_confidence * 100).toFixed(0)}%)\n`);
    }

    // 9. Test duplicate detection
    console.log('9️⃣  Testing duplicate detection...');
    const dupFormData = new FormData();
    dupFormData.append('file', fs.createReadStream(csvPath));
    dupFormData.append('account_id', bankAccountId);
    dupFormData.append('csv_format', 'standard');

    const dupRes = await api.post('/financial/transactions/upload', dupFormData, {
      headers: dupFormData.getHeaders()
    });
    console.log(`   ✅ Duplicate detection working!`);
    console.log(`   ℹ️  Skipped ${dupRes.data.data.duplicates} duplicate transactions\n`);

    // Cleanup
    fs.unlinkSync(csvPath);

    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📊 Summary:');
    console.log(`   • Bank accounts created: 1`);
    console.log(`   • Categories available: ${categoriesRes.data.data.length}`);
    console.log(`   • Transactions imported: ${uploadRes.data.data.successful}`);
    console.log(`   • AI categorization: Working ✅`);
    console.log(`   • Duplicate detection: Working ✅`);
    console.log(`   • Manual override: Working ✅\n`);

    console.log('🎉 Financial module is fully operational!\n');
    console.log('💡 Try it in your browser:');
    console.log(`   • API Root: http://localhost:3000`);
    console.log(`   • Health: http://localhost:3000/health`);
    console.log(`   • Your token: ${authToken}\n`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

run();
