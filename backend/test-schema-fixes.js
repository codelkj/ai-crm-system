/**
 * Test Schema Fixes
 * Tests all 4 critical backend schema mismatch fixes
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/v1';
let authToken = '';
let firmId = '';
let testMatterId = '';
let testClientId = '';

// Test credentials
const testUser = {
  email: 'admin@example.com',
  password: 'password123'
};

/**
 * Helper: Login and get auth token
 */
async function login() {
  console.log('\n🔐 Logging in...');
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, testUser);
    authToken = response.data.data.token;
    firmId = response.data.data.user.firm_id;
    console.log('✅ Login successful');
    console.log(`   Firm ID: ${firmId}`);
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Helper: Get auth headers
 */
function getAuthHeaders() {
  return {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  };
}

/**
 * Test 1: Time Entry with 'date' field (should map to 'entry_date')
 */
async function testTimeEntryDateMapping() {
  console.log('\n📝 TEST 1: Time Entry Date Field Mapping');
  console.log('=' .repeat(60));

  try {
    // Get a matter to use
    const mattersResponse = await axios.get(
      `${API_BASE}/matters?limit=1`,
      getAuthHeaders()
    );

    if (!mattersResponse.data.data || mattersResponse.data.data.length === 0) {
      console.log('⚠️  No matters found. Creating test matter first...');

      // Get a client
      const companiesResponse = await axios.get(
        `${API_BASE}/crm/companies?limit=1`,
        getAuthHeaders()
      );

      if (!companiesResponse.data.data || companiesResponse.data.data.length === 0) {
        console.log('❌ No clients found. Cannot create matter.');
        return false;
      }

      const clientId = companiesResponse.data.data[0].id;

      const matterData = {
        company_id: clientId,
        title: 'Test Matter for Time Entry',
        matter_type: 'Litigation',
        budget_hours: 40,
        budget_amount: 8000,
        description: 'Test matter for schema fixes'
      };

      const matterResponse = await axios.post(
        `${API_BASE}/matters`,
        matterData,
        getAuthHeaders()
      );

      testMatterId = matterResponse.data.data.id;
      console.log(`✅ Created test matter: ${testMatterId}`);
    } else {
      testMatterId = mattersResponse.data.data[0].id;
      console.log(`✅ Using existing matter: ${testMatterId}`);
    }

    // Create time entry using 'date' field instead of 'entry_date'
    const timeEntryData = {
      matter_id: testMatterId,
      date: '2026-02-08', // Using 'date' instead of 'entry_date'
      duration_minutes: 120,
      hourly_rate: 200,
      description: 'Test time entry with date field mapping',
      billable: true
    };

    console.log('\n📤 Creating time entry with "date" field...');
    const response = await axios.post(
      `${API_BASE}/time-tracking/entries`,
      timeEntryData,
      getAuthHeaders()
    );

    console.log('✅ Time entry created successfully!');
    console.log(`   Entry ID: ${response.data.data.id}`);
    console.log(`   Entry Date: ${response.data.data.entry_date}`);
    console.log(`   Duration: ${response.data.data.duration_minutes} minutes`);
    console.log(`   Amount: $${response.data.data.amount}`);

    return true;

  } catch (error) {
    console.error('❌ Time entry creation failed:');
    console.error(`   Status: ${error.response?.status}`);
    console.error(`   Error: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

/**
 * Test 2: Matter Creation with 'description' field (should map to 'notes')
 */
async function testMatterDescriptionMapping() {
  console.log('\n📝 TEST 2: Matter Description Field Mapping');
  console.log('=' .repeat(60));

  try {
    // Get a client
    const companiesResponse = await axios.get(
      `${API_BASE}/crm/companies?limit=1`,
      getAuthHeaders()
    );

    if (!companiesResponse.data.data || companiesResponse.data.data.length === 0) {
      console.log('❌ No clients found. Cannot create matter.');
      return false;
    }

    const clientId = companiesResponse.data.data[0].id;
    testClientId = clientId;
    console.log(`✅ Using client: ${clientId}`);

    const matterData = {
      company_id: clientId,
      title: 'Schema Fix Test Matter',
      matter_type: 'Corporate',
      budget_hours: 50,
      budget_amount: 10000,
      description: 'This description should map to notes column in database'
    };

    console.log('\n📤 Creating matter with "description" field...');
    const response = await axios.post(
      `${API_BASE}/matters`,
      matterData,
      getAuthHeaders()
    );

    console.log('✅ Matter created successfully!');
    console.log(`   Matter ID: ${response.data.data.id}`);
    console.log(`   Title: ${response.data.data.title}`);
    console.log(`   Matter Number: ${response.data.data.matter_number}`);
    console.log(`   Description mapped: ${response.data.data.description ? 'Yes' : 'No'}`);

    return true;

  } catch (error) {
    console.error('❌ Matter creation failed:');
    console.error(`   Status: ${error.response?.status}`);
    console.error(`   Error: ${JSON.stringify(error.response?.data, null, 2) || error.message}`);
    return false;
  }
}

/**
 * Test 3: Invoice List Query
 */
async function testInvoiceListQuery() {
  console.log('\n📝 TEST 3: Invoice List Query');
  console.log('=' .repeat(60));

  try {
    console.log('\n📤 Fetching invoices list...');
    const response = await axios.get(
      `${API_BASE}/invoicing/invoices`,
      getAuthHeaders()
    );

    console.log('✅ Invoice list fetched successfully!');
    console.log(`   Total invoices: ${response.data.total || 0}`);
    console.log(`   Invoices returned: ${response.data.invoices?.length || 0}`);

    if (response.data.invoices && response.data.invoices.length > 0) {
      const invoice = response.data.invoices[0];
      console.log(`\n   Sample Invoice:`);
      console.log(`   - ID: ${invoice.id}`);
      console.log(`   - Number: ${invoice.invoice_number}`);
      console.log(`   - Client: ${invoice.client_name || 'N/A'}`);
      console.log(`   - Created By: ${invoice.created_by_name || 'N/A'}`);
      console.log(`   - Status: ${invoice.status}`);
      console.log(`   - Total: $${invoice.total || 0}`);
    }

    return true;

  } catch (error) {
    console.error('❌ Invoice list query failed:');
    console.error(`   Status: ${error.response?.status}`);
    console.error(`   Error: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

/**
 * Test 4: Billing Pack Generation with client_id validation
 */
async function testBillingPackClientId() {
  console.log('\n📝 TEST 4: Billing Pack Client ID Validation');
  console.log('=' .repeat(60));

  try {
    // Ensure we have a client ID
    if (!testClientId) {
      const companiesResponse = await axios.get(
        `${API_BASE}/crm/companies?limit=1`,
        getAuthHeaders()
      );

      if (!companiesResponse.data.data || companiesResponse.data.data.length === 0) {
        console.log('❌ No clients found. Cannot test billing pack.');
        return false;
      }

      testClientId = companiesResponse.data.data[0].id;
    }

    console.log(`✅ Using client: ${testClientId}`);

    const billingPackData = {
      client_id: testClientId,
      period_start: '2026-01-01',
      period_end: '2026-01-31',
      notes: 'Test billing pack for schema fix validation'
    };

    console.log('\n📤 Creating billing pack with client_id...');
    const response = await axios.post(
      `${API_BASE}/time-tracking/billing-packs`,
      billingPackData,
      getAuthHeaders()
    );

    console.log('✅ Billing pack created successfully!');
    console.log(`   Pack ID: ${response.data.data.id}`);
    console.log(`   Client ID: ${response.data.data.client_id}`);
    console.log(`   Period: ${response.data.data.period_start} to ${response.data.data.period_end}`);
    console.log(`   Status: ${response.data.data.status}`);

    return true;

  } catch (error) {
    console.error('❌ Billing pack creation failed:');
    console.error(`   Status: ${error.response?.status}`);
    console.error(`   Error: ${JSON.stringify(error.response?.data, null, 2) || error.message}`);
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     SCHEMA FIXES VALIDATION TEST SUITE                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // Login first
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without authentication');
    process.exit(1);
  }

  // Run all tests
  const results = {
    test1: await testTimeEntryDateMapping(),
    test2: await testMatterDescriptionMapping(),
    test3: await testInvoiceListQuery(),
    test4: await testBillingPackClientId()
  };

  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     TEST RESULTS SUMMARY                                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const tests = [
    { name: 'Time Entry Date Mapping', result: results.test1 },
    { name: 'Matter Description Mapping', result: results.test2 },
    { name: 'Invoice List Query', result: results.test3 },
    { name: 'Billing Pack Client ID', result: results.test4 }
  ];

  tests.forEach((test, index) => {
    const status = test.result ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${test.name}: ${status}`);
  });

  const passCount = tests.filter(t => t.result).length;
  const totalCount = tests.length;

  console.log('\n' + '='.repeat(60));
  console.log(`TOTAL: ${passCount}/${totalCount} tests passed`);
  console.log('='.repeat(60) + '\n');

  if (passCount === totalCount) {
    console.log('🎉 All schema fixes validated successfully!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n💥 Test suite crashed:', error);
  process.exit(1);
});
