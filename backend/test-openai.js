/**
 * Test OpenAI Integration - Verify AI categorization is working
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testOpenAI() {
  console.log('🤖 Testing OpenAI AI Categorization\n');

  try {
    // 1. Register new user
    console.log('1️⃣  Registering test user...');
    const registerRes = await axios.post(`${BASE_URL}/auth/register`, {
      email: `openai-test-${Date.now()}@example.com`,
      password: 'Test123!',
      first_name: 'OpenAI',
      last_name: 'Test'
    });
    const token = registerRes.data.data.token;
    console.log('   ✅ Registered\n');

    const api = axios.create({
      baseURL: BASE_URL,
      headers: { Authorization: `Bearer ${token}` }
    });

    // 2. Create a NEW bank account for this test
    console.log('2️⃣  Creating new test account...');
    const accountRes = await api.post('/financial/bank-accounts', {
      account_name: 'OpenAI Test Account',
      account_number: '****5678',
      bank_name: 'Test Bank',
      account_type: 'checking',
      currency: 'USD'
    });
    const accountId = accountRes.data.data.id;
    console.log(`   ✅ Created: ${accountRes.data.data.account_name}\n`);

    // 3. Upload CSV with clear categorization candidates
    console.log('3️⃣  Uploading transactions for AI analysis...');
    const csvContent = `date,description,amount,type
2024-02-01,Rent payment to landlord,2500.00,debit
2024-02-02,Salary deposit from employer,6500.00,credit
2024-02-03,Electric bill - Utility company,180.00,debit
2024-02-04,Google Ads marketing campaign,850.00,debit
2024-02-05,Client invoice payment received,3200.00,credit`;

    const csvPath = path.join(__dirname, 'test-openai-transactions.csv');
    fs.writeFileSync(csvPath, csvContent);

    const formData = new FormData();
    formData.append('file', fs.createReadStream(csvPath));
    formData.append('account_id', accountId);
    formData.append('csv_format', 'standard');

    const uploadRes = await api.post('/financial/transactions/upload', formData, {
      headers: formData.getHeaders()
    });

    console.log(`   ✅ Processed ${uploadRes.data.data.total_processed} transactions\n`);

    // 4. Analyze AI confidence scores
    console.log('4️⃣  AI Categorization Results:\n');
    const transactions = uploadRes.data.data.transactions;

    let totalConfidence = 0;
    let highConfidenceCount = 0;

    transactions.forEach((tx, i) => {
      const confidence = parseFloat(tx.ai_confidence);
      totalConfidence += confidence;
      if (confidence >= 0.7) highConfidenceCount++;

      const confidencePercent = (confidence * 100).toFixed(1);
      const emoji = confidence >= 0.8 ? '🟢' : confidence >= 0.5 ? '🟡' : '🔴';

      console.log(`   ${emoji} Transaction ${i + 1}: ${tx.description}`);
      console.log(`      AI Confidence: ${confidencePercent}%`);
      console.log(`      Category ID: ${tx.category_id || 'None'}`);
      console.log();
    });

    const avgConfidence = (totalConfidence / transactions.length * 100).toFixed(1);

    // Cleanup
    fs.unlinkSync(csvPath);

    // 5. Verdict
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 OpenAI Integration Analysis:');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`   • Average Confidence: ${avgConfidence}%`);
    console.log(`   • High Confidence (≥70%): ${highConfidenceCount}/${transactions.length}`);
    console.log();

    if (avgConfidence >= 70) {
      console.log('✅ SUCCESS! OpenAI is working correctly!');
      console.log('   Your API key is valid and categorization is intelligent.\n');
    } else if (avgConfidence > 50 && avgConfidence < 70) {
      console.log('⚠️  OpenAI is responding but with lower confidence.');
      console.log('   This might be normal for ambiguous transactions.\n');
    } else if (avgConfidence === 50) {
      console.log('❌ OpenAI is NOT being called!');
      console.log('   Using fallback categorization (50% default).');
      console.log('   Possible issues:');
      console.log('   • API key might be invalid or expired');
      console.log('   • OpenAI API might be rate-limited');
      console.log('   • Network connectivity issue\n');
    } else {
      console.log('⚠️  Unexpected confidence pattern.');
      console.log('   Please check the logs for errors.\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status === 429) {
      console.error('\n⚠️  Rate limit hit! Your OpenAI API key might be rate-limited.');
    }
  }
}

testOpenAI();
