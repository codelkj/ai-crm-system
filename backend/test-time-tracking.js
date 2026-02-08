/**
 * Phase 3: Time Tracking & Billing Packs - Comprehensive Test Suite
 * Tests all time entry and billing pack functionality
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let authToken = '';
let testData = {
  userId: '',
  firmId: '',
  timeEntryId: '',
  timeEntryId2: '',
  timeEntryId3: '',
  billingPackId: '',
  clientId: ''
};

// Helper functions
function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function success(message) {
  log(`✅ ${message}`, COLORS.green);
}

function error(message) {
  log(`❌ ${message}`, COLORS.red);
}

function info(message) {
  log(`ℹ️  ${message}`, COLORS.cyan);
}

function section(title) {
  log(`\n${'='.repeat(60)}`, COLORS.bright);
  log(`  ${title}`, COLORS.bright);
  log(`${'='.repeat(60)}`, COLORS.bright);
}

function formatCurrency(amount) {
  return `R ${parseFloat(amount).toFixed(2)}`;
}

// Test functions
async function testAuthentication() {
  section('TEST 1: AUTHENTICATION');

  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });

    authToken = response.data.data.token;
    testData.userId = response.data.data.user.id;
    testData.firmId = response.data.data.user.firm_id;

    success('Authentication successful');
    info(`User: ${response.data.data.user.first_name} ${response.data.data.user.last_name}`);
    info(`Firm ID: ${testData.firmId}`);
    info(`Role: ${response.data.data.user.role_name} (Level ${response.data.data.user.role_level})`);

    return true;
  } catch (err) {
    error('Authentication failed');
    console.error(err.response?.data || err.message);
    return false;
  }
}

async function testCreateTimeEntry() {
  section('TEST 2: CREATE TIME ENTRY');

  try {
    const response = await axios.post(
      `${BASE_URL}/time-tracking/entries`,
      {
        entry_date: new Date().toISOString().split('T')[0],
        duration_minutes: 90, // 1.5 hours
        hourly_rate: 1500.00,
        description: 'Legal research and case preparation',
        billable: true
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    testData.timeEntryId = response.data.data.id;

    success('Time entry created successfully');
    info(`Entry ID: ${response.data.data.id}`);
    info(`Date: ${response.data.data.entry_date}`);
    info(`Duration: ${response.data.data.duration_minutes} minutes (${response.data.data.duration_minutes / 60} hours)`);
    info(`Rate: ${formatCurrency(response.data.data.hourly_rate)}/hour`);
    info(`Amount: ${formatCurrency(response.data.data.amount)}`);
    info(`Billable: ${response.data.data.billable}`);
    info(`Approved: ${response.data.data.approved_by ? 'Yes' : 'No'}`);

    // Verify amount calculation
    const expectedAmount = (90 / 60) * 1500;
    if (Math.abs(response.data.data.amount - expectedAmount) < 0.01) {
      success(`Amount calculation correct: ${formatCurrency(expectedAmount)}`);
    } else {
      error(`Amount calculation mismatch. Expected: ${expectedAmount}, Got: ${response.data.data.amount}`);
    }

    return true;
  } catch (err) {
    error('Failed to create time entry');
    console.error(err.response?.data || err.message);
    return false;
  }
}

async function testCreateMultipleTimeEntries() {
  section('TEST 3: CREATE MULTIPLE TIME ENTRIES');

  try {
    // Entry 2: 2 hours
    const response2 = await axios.post(
      `${BASE_URL}/time-tracking/entries`,
      {
        entry_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        duration_minutes: 120,
        hourly_rate: 1500.00,
        description: 'Client consultation and contract review',
        billable: true
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    testData.timeEntryId2 = response2.data.data.id;
    success(`Entry 2 created: ${response2.data.data.duration_minutes / 60}h @ ${formatCurrency(response2.data.data.hourly_rate)}/h = ${formatCurrency(response2.data.data.amount)}`);

    // Entry 3: 3.5 hours
    const response3 = await axios.post(
      `${BASE_URL}/time-tracking/entries`,
      {
        entry_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        duration_minutes: 210,
        hourly_rate: 1500.00,
        description: 'Court preparation and documentation',
        billable: true
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    testData.timeEntryId3 = response3.data.data.id;
    success(`Entry 3 created: ${response3.data.data.duration_minutes / 60}h @ ${formatCurrency(response3.data.data.hourly_rate)}/h = ${formatCurrency(response3.data.data.amount)}`);

    info(`Total time entries created: 3`);
    return true;
  } catch (err) {
    error('Failed to create multiple time entries');
    console.error(err.response?.data || err.message);
    return false;
  }
}

async function testGetTimeEntries() {
  section('TEST 4: GET TIME ENTRIES');

  try {
    const response = await axios.get(
      `${BASE_URL}/time-tracking/entries`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
        params: {
          start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0]
        }
      }
    );

    success(`Retrieved ${response.data.data.length} time entries`);

    response.data.data.forEach((entry, index) => {
      info(`  ${index + 1}. ${entry.entry_date} - ${entry.duration_minutes / 60}h - ${formatCurrency(entry.amount)} - ${entry.approved_by ? '✓ Approved' : '○ Pending'}`);
    });

    info(`Pagination: Page ${response.data.pagination.page} of ${response.data.pagination.pages} (${response.data.pagination.total} total)`);

    return true;
  } catch (err) {
    error('Failed to get time entries');
    console.error(err.response?.data || err.message);
    return false;
  }
}

async function testUpdateTimeEntry() {
  section('TEST 5: UPDATE TIME ENTRY');

  try {
    const response = await axios.put(
      `${BASE_URL}/time-tracking/entries/${testData.timeEntryId}`,
      {
        duration_minutes: 120, // Change from 90 to 120
        description: 'Legal research and case preparation (UPDATED)'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    success('Time entry updated successfully');
    info(`New Duration: ${response.data.data.duration_minutes} minutes`);
    info(`New Amount: ${formatCurrency(response.data.data.amount)}`);
    info(`Updated Description: ${response.data.data.description}`);

    return true;
  } catch (err) {
    error('Failed to update time entry');
    console.error(err.response?.data || err.message);
    return false;
  }
}

async function testApproveTimeEntry() {
  section('TEST 6: APPROVE TIME ENTRIES');

  try {
    // Approve entry 1
    const response1 = await axios.post(
      `${BASE_URL}/time-tracking/entries/${testData.timeEntryId}/approve`,
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    success(`Entry 1 approved`);
    info(`Approved by: ${response1.data.data.approved_by}`);
    info(`Approved at: ${new Date(response1.data.data.approved_at).toLocaleString()}`);

    // Approve entry 2
    await axios.post(
      `${BASE_URL}/time-tracking/entries/${testData.timeEntryId2}/approve`,
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    success(`Entry 2 approved`);

    // Approve entry 3
    await axios.post(
      `${BASE_URL}/time-tracking/entries/${testData.timeEntryId3}/approve`,
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    success(`Entry 3 approved`);

    info(`Total approved entries: 3`);

    return true;
  } catch (err) {
    error('Failed to approve time entry');
    console.error(err.response?.data || err.message);
    return false;
  }
}

async function testUnbilledHours() {
  section('TEST 7: UNBILLED HOURS SUMMARY');

  try {
    // By user
    const responseUser = await axios.get(
      `${BASE_URL}/time-tracking/entries/unbilled/by-user`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    success('Unbilled hours by user retrieved');
    responseUser.data.data.forEach(summary => {
      info(`  User: ${summary.user_name || 'Unknown'}`);
      info(`  Entries: ${summary.entry_count}`);
      info(`  Hours: ${parseFloat(summary.total_hours).toFixed(2)}h`);
      info(`  Amount: ${formatCurrency(summary.total_amount)}`);
    });

    // By matter
    const responseMatter = await axios.get(
      `${BASE_URL}/time-tracking/entries/unbilled/by-matter`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    success('Unbilled hours by matter retrieved');
    if (responseMatter.data.data.length === 0) {
      info('  No unbilled hours linked to matters (entries not linked to matters)');
    }

    return true;
  } catch (err) {
    error('Failed to get unbilled hours');
    console.error(err.response?.data || err.message);
    return false;
  }
}

async function testTimeEntryStats() {
  section('TEST 8: TIME ENTRY STATISTICS');

  try {
    const response = await axios.get(
      `${BASE_URL}/time-tracking/entries/stats`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    success('Time entry statistics retrieved');
    const stats = response.data.data;

    info(`Total Entries: ${stats.total_entries}`);
    info(`Approved Entries: ${stats.approved_entries}`);
    info(`Billed Entries: ${stats.billed_entries}`);
    info(`Unbilled Entries: ${stats.unbilled_entries}`);
    info(`Total Hours: ${parseFloat(stats.total_hours || 0).toFixed(2)}h`);
    info(`Approved Hours: ${parseFloat(stats.approved_hours || 0).toFixed(2)}h`);
    info(`Unbilled Hours: ${parseFloat(stats.unbilled_hours || 0).toFixed(2)}h`);
    info(`Total Amount: ${formatCurrency(stats.total_amount || 0)}`);
    info(`Approved Amount: ${formatCurrency(stats.approved_amount || 0)}`);
    info(`Unbilled Amount: ${formatCurrency(stats.unbilled_amount || 0)}`);

    return true;
  } catch (err) {
    error('Failed to get statistics');
    console.error(err.response?.data || err.message);
    return false;
  }
}

async function testCreateClient() {
  section('TEST 9: CREATE TEST CLIENT FOR BILLING PACK');

  try {
    const response = await axios.post(
      `${BASE_URL}/crm/companies`,
      {
        name: 'Test Client for Billing Pack',
        email: 'testclient@example.com',
        phone: '+27 21 555 0001',
        preferred_billing_date: 1
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    testData.clientId = response.data.data.id;

    success('Test client created');
    info(`Client ID: ${testData.clientId}`);
    info(`Client Name: ${response.data.data.name}`);

    return true;
  } catch (err) {
    error('Failed to create test client');
    console.error(err.response?.data || err.message);
    return false;
  }
}

async function testGenerateBillingPack() {
  section('TEST 10: GENERATE BILLING PACK');

  if (!testData.clientId) {
    error('No client ID available - skipping billing pack generation');
    return false;
  }

  try {
    const today = new Date();
    const periodStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const periodEnd = today.toISOString().split('T')[0];

    const response = await axios.post(
      `${BASE_URL}/time-tracking/billing-packs/generate`,
      {
        client_id: testData.clientId,
        period_start: periodStart,
        period_end: periodEnd,
        notes: 'Test billing pack generated by automated test suite'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    testData.billingPackId = response.data.data.id;

    success('Billing pack generated successfully');
    info(`Pack ID: ${response.data.data.id}`);
    info(`Client: ${response.data.data.client_name || testData.clientId}`);
    info(`Period: ${response.data.data.period_start} to ${response.data.data.period_end}`);
    info(`Status: ${response.data.data.status}`);
    info(`Total Entries: ${response.data.data.total_time_entries}`);
    info(`Total Hours: ${parseFloat(response.data.data.total_hours).toFixed(2)}h`);
    info(`Total Amount: ${formatCurrency(response.data.data.total_amount)}`);

    return true;
  } catch (err) {
    error('Failed to generate billing pack');
    console.error(err.response?.data || err.message);
    return false;
  }
}

async function testGetBillingPacks() {
  section('TEST 11: GET BILLING PACKS');

  try {
    const response = await axios.get(
      `${BASE_URL}/time-tracking/billing-packs`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    success(`Retrieved ${response.data.data.length} billing packs`);

    response.data.data.forEach((pack, index) => {
      info(`  ${index + 1}. ${pack.client_name || 'No Client'} - ${pack.period_start} to ${pack.period_end}`);
      info(`     Status: ${pack.status} | Entries: ${pack.total_time_entries} | Hours: ${parseFloat(pack.total_hours).toFixed(2)}h | Amount: ${formatCurrency(pack.total_amount)}`);
    });

    return true;
  } catch (err) {
    error('Failed to get billing packs');
    console.error(err.response?.data || err.message);
    return false;
  }
}

async function testBillingPackTimeEntries() {
  section('TEST 12: GET BILLING PACK TIME ENTRIES');

  if (!testData.billingPackId) {
    error('No billing pack ID available - skipping');
    return false;
  }

  try {
    const response = await axios.get(
      `${BASE_URL}/time-tracking/billing-packs/${testData.billingPackId}/entries`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    success(`Retrieved ${response.data.data.length} time entries for billing pack`);

    response.data.data.forEach((entry, index) => {
      info(`  ${index + 1}. ${entry.entry_date} - ${entry.description}`);
      info(`     Duration: ${entry.duration_minutes / 60}h | Rate: ${formatCurrency(entry.hourly_rate)} | Amount: ${formatCurrency(entry.amount)}`);
    });

    return true;
  } catch (err) {
    error('Failed to get billing pack entries');
    console.error(err.response?.data || err.message);
    return false;
  }
}

async function testBillingPackWorkflow() {
  section('TEST 13: BILLING PACK WORKFLOW');

  if (!testData.billingPackId) {
    error('No billing pack ID available - skipping');
    return false;
  }

  try {
    // Send billing pack
    const sendResponse = await axios.post(
      `${BASE_URL}/time-tracking/billing-packs/${testData.billingPackId}/send`,
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    success('Billing pack sent to client');
    info(`Status: ${sendResponse.data.data.status}`);
    info(`Sent at: ${sendResponse.data.data.sent_at ? new Date(sendResponse.data.data.sent_at).toLocaleString() : 'N/A'}`);

    // Approve billing pack
    const approveResponse = await axios.post(
      `${BASE_URL}/time-tracking/billing-packs/${testData.billingPackId}/approve`,
      { create_invoice: false },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    success('Billing pack approved');
    info(`Status: ${approveResponse.data.data.status}`);

    // Verify time entries are marked as billed
    const entriesResponse = await axios.get(
      `${BASE_URL}/time-tracking/billing-packs/${testData.billingPackId}/entries`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    const billedCount = entriesResponse.data.data.filter(e => e.billed).length;
    success(`${billedCount} time entries marked as billed`);

    return true;
  } catch (err) {
    error('Failed billing pack workflow');
    console.error(err.response?.data || err.message);
    return false;
  }
}

async function testBillingPackStats() {
  section('TEST 14: BILLING PACK STATISTICS');

  try {
    const response = await axios.get(
      `${BASE_URL}/time-tracking/billing-packs/stats`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    success('Billing pack statistics retrieved');
    const stats = response.data.data;

    info(`Total Packs: ${stats.total_packs}`);
    info(`Draft Packs: ${stats.draft_packs}`);
    info(`Generated Packs: ${stats.generated_packs}`);
    info(`Sent Packs: ${stats.sent_packs}`);
    info(`Approved Packs: ${stats.approved_packs}`);
    info(`Total Amount: ${formatCurrency(stats.total_amount || 0)}`);
    info(`Approved Amount: ${formatCurrency(stats.approved_amount || 0)}`);
    info(`Total Hours: ${parseFloat(stats.total_hours || 0).toFixed(2)}h`);
    info(`Approved Hours: ${parseFloat(stats.approved_hours || 0).toFixed(2)}h`);

    return true;
  } catch (err) {
    error('Failed to get billing pack statistics');
    console.error(err.response?.data || err.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log('\n╔════════════════════════════════════════════════════════════╗', COLORS.bright);
  log('║  PHASE 3: TIME TRACKING & BILLING PACKS - TEST SUITE      ║', COLORS.bright);
  log('╚════════════════════════════════════════════════════════════╝\n', COLORS.bright);

  const tests = [
    testAuthentication,
    testCreateTimeEntry,
    testCreateMultipleTimeEntries,
    testGetTimeEntries,
    testUpdateTimeEntry,
    testApproveTimeEntry,
    testUnbilledHours,
    testTimeEntryStats,
    testCreateClient,
    testGenerateBillingPack,
    testGetBillingPacks,
    testBillingPackTimeEntries,
    testBillingPackWorkflow,
    testBillingPackStats
  ];

  let passedTests = 0;
  let failedTests = 0;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passedTests++;
      } else {
        failedTests++;
      }
    } catch (err) {
      failedTests++;
      error(`Test threw unexpected error: ${err.message}`);
    }
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }

  // Summary
  section('TEST SUMMARY');
  log(`Total Tests: ${tests.length}`, COLORS.bright);
  success(`Passed: ${passedTests}`);
  if (failedTests > 0) {
    error(`Failed: ${failedTests}`);
  }

  const successRate = ((passedTests / tests.length) * 100).toFixed(1);
  log(`\nSuccess Rate: ${successRate}%`, successRate === '100.0' ? COLORS.green : COLORS.yellow);

  if (successRate === '100.0') {
    log('\n✨ ALL TESTS PASSED! Phase 3 is fully operational! ✨\n', COLORS.green);
  } else {
    log('\n⚠️  Some tests failed. Please review the errors above.\n', COLORS.yellow);
  }
}

// Run tests
runAllTests().catch(err => {
  error('Test suite failed');
  console.error(err);
  process.exit(1);
});
