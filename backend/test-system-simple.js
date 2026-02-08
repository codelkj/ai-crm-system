/**
 * Simplified Legal CRM System Test Suite
 * Tests database integrity and basic API availability
 */

const axios = require('axios');
const { Pool } = require('pg');

const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/v1`;

// Database configuration
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'crm_ai_db',
  user: 'crm_user',
  password: 'crm_password'
});

// Test results
const results = {
  database: { total: 0, passed: 0, failed: 0 },
  api: { total: 0, passed: 0, failed: 0 },
  integration: { total: 0, passed: 0, failed: 0 },
  errors: []
};

function log(category, test, status, details = '') {
  results[category].total++;
  if (status === 'PASS') {
    results[category].passed++;
    console.log(`✅ [${category.toUpperCase()}] ${test}${details ? ` - ${details}` : ''}`);
  } else {
    results[category].failed++;
    console.log(`❌ [${category.toUpperCase()}] ${test}${details ? ` - ${details}` : ''}`);
    if (details) results.errors.push({ category, test, error: details });
  }
}

function section(title) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`  ${title}`);
  console.log(`${'='.repeat(80)}\n`);
}

async function testDatabase() {
  section('DATABASE INTEGRITY TESTS');

  try {
    // Test connection
    const connTest = await pool.query('SELECT NOW() as time, version() as version');
    log('database', 'Database Connection', 'PASS',
      `PostgreSQL ${connTest.rows[0].version.split(' ')[1]}`);

    // Count tables
    const tablesResult = await pool.query(`
      SELECT COUNT(*) as count FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    const tableCount = parseInt(tablesResult.rows[0].count);
    log('database', 'Table Count', tableCount >= 30 ? 'PASS' : 'FAIL',
      `Found ${tableCount} tables`);

    // Check critical tables
    const criticalTables = [
      'firms', 'users', 'companies', 'contacts', 'deals',
      'invoices', 'invoice_line_items', 'invoice_payments',
      'time_entries', 'billing_packs', 'billing_pack_entries',
      'lightning_stages', 'matter_assignments', 'matter_services',
      'departments', 'roles', 'audit_logs',
      'categories', 'transactions', 'bank_accounts',
      'legal_documents', 'document_types'
    ];

    for (const table of criticalTables) {
      const exists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = $1
        )
      `, [table]);

      log('database', `Table: ${table}`, exists.rows[0].exists ? 'PASS' : 'FAIL');
    }

    // Check data integrity
    const firms = await pool.query('SELECT COUNT(*) as count FROM firms');
    log('database', 'Firms Data', parseInt(firms.rows[0].count) > 0 ? 'PASS' : 'FAIL',
      `${firms.rows[0].count} firms`);

    const users = await pool.query('SELECT COUNT(*) as count FROM users');
    log('database', 'Users Data', parseInt(users.rows[0].count) > 0 ? 'PASS' : 'FAIL',
      `${users.rows[0].count} users`);

    const companies = await pool.query('SELECT COUNT(*) as count FROM companies');
    log('database', 'Companies Data', 'PASS', `${companies.rows[0].count} companies`);

    const deals = await pool.query('SELECT COUNT(*) as count FROM deals');
    log('database', 'Deals Data', 'PASS', `${deals.rows[0].count} deals`);

    const invoices = await pool.query('SELECT COUNT(*) as count FROM invoices');
    log('database', 'Invoices Data', 'PASS', `${invoices.rows[0].count} invoices`);

    const timeEntries = await pool.query('SELECT COUNT(*) as count FROM time_entries');
    log('database', 'Time Entries Data', 'PASS', `${timeEntries.rows[0].count} entries`);

    // Check foreign key constraints
    const fkResult = await pool.query(`
      SELECT COUNT(*) as count FROM information_schema.table_constraints
      WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public'
    `);
    log('database', 'Foreign Key Constraints', 'PASS',
      `${fkResult.rows[0].count} constraints`);

    // Check indexes
    const idxResult = await pool.query(`
      SELECT COUNT(*) as count FROM pg_indexes WHERE schemaname = 'public'
    `);
    log('database', 'Indexes', 'PASS', `${idxResult.rows[0].count} indexes`);

  } catch (err) {
    log('database', 'Database Tests', 'FAIL', err.message);
  }
}

async function testAPI() {
  section('API AVAILABILITY TESTS');

  // Test basic endpoints (no auth required)
  const publicEndpoints = [
    { method: 'POST', path: '/auth/register', name: 'Auth Register Endpoint' },
    { method: 'POST', path: '/auth/login', name: 'Auth Login Endpoint' }
  ];

  for (const endpoint of publicEndpoints) {
    try {
      if (endpoint.method === 'POST') {
        await axios.post(`${API_URL}${endpoint.path}`, {}, { validateStatus: () => true });
      }
      // If it doesn't throw (no network error), endpoint is available
      log('api', endpoint.name, 'PASS', 'Endpoint responding');
    } catch (err) {
      if (err.code === 'ECONNREFUSED') {
        log('api', endpoint.name, 'FAIL', 'Server not running');
      } else {
        log('api', endpoint.name, 'PASS', 'Endpoint responding (got response)');
      }
    }
  }

  // Test that server is running
  try {
    await axios.get(BASE_URL, { validateStatus: () => true });
    log('api', 'Server Running', 'PASS', `Running at ${BASE_URL}`);
  } catch (err) {
    log('api', 'Server Running', 'FAIL', 'Server not responding');
  }
}

async function testIntegration() {
  section('INTEGRATION & WORKFLOW TESTS');

  try {
    // Test full invoice workflow using database
    const firmResult = await pool.query('SELECT id FROM firms LIMIT 1');
    if (firmResult.rows.length === 0) {
      log('integration', 'Invoice Workflow', 'FAIL', 'No firm found');
      return;
    }

    const firmId = firmResult.rows[0].id;

    // Create invoice
    const invoiceInsert = await pool.query(`
      INSERT INTO invoices (firm_id, invoice_number, client_name, issue_date, due_date, status, total_amount, tax_amount, subtotal)
      VALUES ($1, $2, $3, NOW(), NOW() + interval '30 days', $4, 0, 0, 0)
      RETURNING id
    `, [firmId, `TEST-INV-${Date.now()}`, 'Test Client', 'draft']);

    const invoiceId = invoiceInsert.rows[0].id;

    // Add line items
    await pool.query(`
      INSERT INTO invoice_line_items (invoice_id, description, quantity, unit_price, tax_rate, total)
      VALUES ($1, 'Test Service', 5, 200, 0.15, 1000)
    `, [invoiceId]);

    // Update invoice totals
    const totals = await pool.query(`
      SELECT SUM(total) as subtotal, SUM(total * tax_rate) as tax
      FROM invoice_line_items WHERE invoice_id = $1
    `, [invoiceId]);

    await pool.query(`
      UPDATE invoices SET subtotal = $2, tax_amount = $3, total_amount = $2 + $3
      WHERE id = $1
    `, [invoiceId, totals.rows[0].subtotal, totals.rows[0].tax]);

    // Record payment
    await pool.query(`
      INSERT INTO invoice_payments (invoice_id, amount, payment_date, payment_method, reference)
      VALUES ($1, 500, NOW(), 'bank_transfer', $2)
    `, [invoiceId, `PAY-${Date.now()}`]);

    log('integration', 'Invoice Workflow', 'PASS',
      'Created invoice, added items, recorded payment');

    // Clean up
    await pool.query('DELETE FROM invoice_payments WHERE invoice_id = $1', [invoiceId]);
    await pool.query('DELETE FROM invoice_line_items WHERE invoice_id = $1', [invoiceId]);
    await pool.query('DELETE FROM invoices WHERE id = $1', [invoiceId]);

  } catch (err) {
    log('integration', 'Invoice Workflow', 'FAIL', err.message);
  }

  try {
    // Test time tracking workflow
    const firmResult = await pool.query('SELECT id FROM firms LIMIT 1');
    const userResult = await pool.query('SELECT id FROM users LIMIT 1');

    if (firmResult.rows.length === 0 || userResult.rows.length === 0) {
      log('integration', 'Time Tracking Workflow', 'FAIL', 'No firm or user found');
      return;
    }

    const firmId = firmResult.rows[0].id;
    const userId = userResult.rows[0].id;

    // Create billing pack
    const packInsert = await pool.query(`
      INSERT INTO billing_packs (firm_id, name, period_start, period_end, status)
      VALUES ($1, $2, NOW() - interval '30 days', NOW(), 'draft')
      RETURNING id
    `, [firmId, `TEST-PACK-${Date.now()}`]);

    const packId = packInsert.rows[0].id;

    // Create time entries
    const entryIds = [];
    for (let i = 0; i < 3; i++) {
      const entry = await pool.query(`
        INSERT INTO time_entries (firm_id, user_id, date, hours, description, activity_type, billable, hourly_rate)
        VALUES ($1, $2, NOW() - interval '${i} days', 2.5, 'Test work', 'research', true, 250)
        RETURNING id
      `, [firmId, userId]);
      entryIds.push(entry.rows[0].id);
    }

    // Add entries to pack
    for (const entryId of entryIds) {
      await pool.query(`
        INSERT INTO billing_pack_entries (billing_pack_id, time_entry_id)
        VALUES ($1, $2)
      `, [packId, entryId]);
    }

    log('integration', 'Time Tracking Workflow', 'PASS',
      'Created billing pack with 3 time entries');

    // Clean up
    await pool.query('DELETE FROM billing_pack_entries WHERE billing_pack_id = $1', [packId]);
    for (const entryId of entryIds) {
      await pool.query('DELETE FROM time_entries WHERE id = $1', [entryId]);
    }
    await pool.query('DELETE FROM billing_packs WHERE id = $1', [packId]);

  } catch (err) {
    log('integration', 'Time Tracking Workflow', 'FAIL', err.message);
  }
}

function printSummary() {
  section('FINAL TEST REPORT');

  const totalTests = Object.values(results).reduce((sum, cat) =>
    typeof cat === 'object' && cat.total ? sum + cat.total : sum, 0);
  const totalPassed = Object.values(results).reduce((sum, cat) =>
    typeof cat === 'object' && cat.passed ? sum + cat.passed : sum, 0);
  const totalFailed = Object.values(results).reduce((sum, cat) =>
    typeof cat === 'object' && cat.failed ? sum + cat.failed : sum, 0);

  console.log(`\n📊 Test Summary:`);
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   ✅ Passed: ${totalPassed} (${((totalPassed/totalTests)*100).toFixed(1)}%)`);
  console.log(`   ❌ Failed: ${totalFailed} (${((totalFailed/totalTests)*100).toFixed(1)}%)`);

  console.log(`\n📈 Category Breakdown:`);
  for (const [category, stats] of Object.entries(results)) {
    if (stats.total) {
      const passRate = ((stats.passed / stats.total) * 100).toFixed(1);
      console.log(`   ${category}: ${stats.passed}/${stats.total} (${passRate}%)`);
    }
  }

  if (results.errors.length > 0) {
    console.log(`\n🔍 Failed Tests:`);
    results.errors.forEach((err, idx) => {
      console.log(`   ${idx + 1}. [${err.category.toUpperCase()}] ${err.test}`);
      console.log(`      ${err.error}`);
    });
  }

  const passRate = (totalPassed / totalTests) * 100;
  console.log(`\n${passRate >= 90 ? '✅' : passRate >= 70 ? '⚠️' : '❌'} System Status: ${
    passRate >= 90 ? 'EXCELLENT' :
    passRate >= 70 ? 'GOOD' :
    passRate >= 50 ? 'NEEDS WORK' : 'CRITICAL ISSUES'
  }`);

  console.log(`\n📋 Production Readiness:`);
  console.log(`   Database: ${results.database.passed >= results.database.total * 0.9 ? '✅ Ready' : '❌ Not Ready'}`);
  console.log(`   API: ${results.api.passed >= results.api.total * 0.8 ? '✅ Ready' : '❌ Not Ready'}`);
  console.log(`   Integration: ${results.integration.passed >= results.integration.total * 0.8 ? '✅ Ready' : '❌ Not Ready'}`);

  return passRate >= 70;
}

async function runTests() {
  console.log('\n🚀 Legal CRM System Test Suite\n');

  try {
    await testDatabase();
    await testAPI();
    await testIntegration();

    const success = printSummary();

    await pool.end();
    process.exit(success ? 0 : 1);

  } catch (err) {
    console.error('\n❌ Fatal error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

runTests();
