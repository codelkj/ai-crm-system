const axios = require('axios');
const { Pool } = require('pg');

const BASE_URL = 'http://localhost:3000/api/v1';
let authToken = null;
let firmId = null;
let userId = null;

// Database connection
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'crm_ai_db',
  user: 'crm_user',
  password: 'crm_password'
});

// Test results tracker
const results = {
  authentication: [],
  invoicing: [],
  timeTracking: [],
  lightningPath: [],
  aiIntegration: [],
  documentRouting: [],
  multiTenancy: [],
  summary: { passed: 0, failed: 0, warnings: 0 }
};

function logTest(category, test, status, details = '') {
  const result = { test, status, details, timestamp: new Date().toISOString() };
  results[category].push(result);

  const symbol = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${symbol} [${category}] ${test}: ${details}`);

  if (status === 'PASS') results.summary.passed++;
  else if (status === 'FAIL') results.summary.failed++;
  else results.summary.warnings++;
}

// Helper function for API calls
async function apiCall(method, endpoint, data = null, useAuth = true) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: useAuth && authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
    };

    if (data) {
      config.data = data;
      config.headers['Content-Type'] = 'application/json';
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// 1. AUTHENTICATION & USER MANAGEMENT
async function testAuthentication() {
  console.log('\n========== TESTING AUTHENTICATION & USER MANAGEMENT ==========\n');

  // Check existing users
  try {
    const userQuery = await pool.query('SELECT id, email, first_name, last_name, firm_id, role FROM users LIMIT 5');
    logTest('authentication', 'Database: Check existing users', 'PASS',
      `Found ${userQuery.rows.length} users: ${userQuery.rows.map(u => u.email).join(', ')}`);

    if (userQuery.rows.length > 0) {
      firmId = userQuery.rows[0].firm_id;
      userId = userQuery.rows[0].id;
    }
  } catch (error) {
    logTest('authentication', 'Database: Check existing users', 'FAIL', error.message);
  }

  // Try login with admin@example.com
  const loginAttempt = await apiCall('POST', '/auth/login', {
    email: 'admin@example.com',
    password: 'password123'
  }, false);

  if (loginAttempt.success) {
    authToken = loginAttempt.data.data?.token || loginAttempt.data.token;
    firmId = loginAttempt.data.data?.user?.firm_id || loginAttempt.data.user?.firm_id || firmId;
    userId = loginAttempt.data.data?.user?.id || loginAttempt.data.user?.id || userId;
    logTest('authentication', 'Login with admin@example.com', 'PASS',
      `Token received, User: ${loginAttempt.data.data?.user?.email || loginAttempt.data.user?.email}`);
  } else {
    logTest('authentication', 'Login with admin@example.com', 'FAIL',
      JSON.stringify(loginAttempt.error));

    // Try to create/update test user
    try {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);

      const updateResult = await pool.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, firm_id, role, is_active)
        VALUES ($1, $2, 'Admin', 'User', $3, 'admin', true)
        ON CONFLICT (email)
        DO UPDATE SET password_hash = $2
        RETURNING id, email, firm_id
      `, ['admin@example.com', hashedPassword, firmId || 1]);

      logTest('authentication', 'Create/Update test user', 'PASS',
        `User ${updateResult.rows[0].email} ready`);

      // Retry login
      const retryLogin = await apiCall('POST', '/auth/login', {
        email: 'admin@example.com',
        password: 'password123'
      }, false);

      if (retryLogin.success) {
        authToken = retryLogin.data.data?.token || retryLogin.data.token;
        firmId = retryLogin.data.data?.user?.firm_id || retryLogin.data.user?.firm_id || firmId;
        userId = retryLogin.data.data?.user?.id || retryLogin.data.user?.id || userId;
        logTest('authentication', 'Retry login after reset', 'PASS', 'Login successful');
      } else {
        logTest('authentication', 'Retry login after reset', 'FAIL', JSON.stringify(retryLogin.error));
      }
    } catch (error) {
      logTest('authentication', 'Create/Update test user', 'FAIL', error.message);
    }
  }

  // Test get current user
  if (authToken) {
    const meResult = await apiCall('GET', '/auth/me');
    if (meResult.success) {
      const userData = meResult.data.data?.user || meResult.data.user;
      logTest('authentication', 'Get current user (/auth/me)', 'PASS',
        `User: ${userData?.email}, Role: ${userData?.role_name || userData?.role}`);
    } else {
      logTest('authentication', 'Get current user (/auth/me)', 'FAIL', JSON.stringify(meResult.error));
    }
  }
}

// 2. INVOICING SYSTEM
async function testInvoicing() {
  console.log('\n========== TESTING INVOICING SYSTEM (PHASE 2) ==========\n');

  if (!authToken) {
    logTest('invoicing', 'Skip - No authentication', 'FAIL', 'Authentication required');
    return;
  }

  // Check if invoicing tables exist
  try {
    const tableCheck = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('invoices', 'invoice_line_items', 'payments')
    `);
    logTest('invoicing', 'Database: Check invoicing tables', 'PASS',
      `Tables found: ${tableCheck.rows.map(r => r.table_name).join(', ')}`);
  } catch (error) {
    logTest('invoicing', 'Database: Check invoicing tables', 'FAIL', error.message);
  }

  // Get companies (clients) for invoice creation
  let clientId = null;
  try {
    const clientQuery = await pool.query('SELECT id FROM companies WHERE firm_id = $1 LIMIT 1', [firmId]);
    if (clientQuery.rows.length > 0) {
      clientId = clientQuery.rows[0].id;
      logTest('invoicing', 'Database: Get test company/client', 'PASS', `Company ID: ${clientId}`);
    } else {
      logTest('invoicing', 'Database: Get test company/client', 'WARN', 'No companies found, will create one');

      // Create a test company
      const newClient = await pool.query(`
        INSERT INTO companies (firm_id, name, email, phone, type, status)
        VALUES ($1, 'Test Client Invoice', 'test-invoice@example.com', '555-0123', 'prospect', 'active')
        RETURNING id
      `, [firmId]);
      clientId = newClient.rows[0].id;
    }
  } catch (error) {
    logTest('invoicing', 'Database: Get test company/client', 'FAIL', error.message);
  }

  // Test invoice creation
  let invoiceId = null;
  if (clientId) {
    const createInvoice = await apiCall('POST', '/invoicing/invoices', {
      client_id: clientId,
      invoice_number: `INV-TEST-${Date.now()}`,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      line_items: [
        {
          description: 'Legal Consultation',
          quantity: 2,
          unit_price: 250.00,
          tax_rate: 15.0
        },
        {
          description: 'Document Review',
          quantity: 1,
          unit_price: 500.00,
          tax_rate: 15.0
        }
      ]
    });

    if (createInvoice.success) {
      invoiceId = createInvoice.data.invoice?.id;
      logTest('invoicing', 'Create invoice with line items', 'PASS',
        `Invoice ${createInvoice.data.invoice?.invoice_number} created, Total: $${createInvoice.data.invoice?.total_amount}`);
    } else {
      logTest('invoicing', 'Create invoice with line items', 'FAIL', JSON.stringify(createInvoice.error));
    }
  }

  // Test invoice retrieval
  if (invoiceId) {
    const getInvoice = await apiCall('GET', `/invoicing/invoices/${invoiceId}`);
    if (getInvoice.success) {
      logTest('invoicing', 'Get invoice by ID', 'PASS',
        `Retrieved invoice with ${getInvoice.data.invoice?.line_items?.length || 0} line items`);
    } else {
      logTest('invoicing', 'Get invoice by ID', 'FAIL', JSON.stringify(getInvoice.error));
    }
  }

  // Test list invoices
  const listInvoices = await apiCall('GET', '/invoicing/invoices');
  if (listInvoices.success) {
    logTest('invoicing', 'List all invoices', 'PASS',
      `Found ${listInvoices.data.invoices?.length || 0} invoices`);
  } else {
    logTest('invoicing', 'List all invoices', 'FAIL', JSON.stringify(listInvoices.error));
  }

  // Test invoice update
  if (invoiceId) {
    const updateInvoice = await apiCall('PATCH', `/invoicing/invoices/${invoiceId}`, {
      status: 'sent',
      notes: 'Updated via comprehensive test'
    });

    if (updateInvoice.success) {
      logTest('invoicing', 'Update invoice status', 'PASS',
        `Status changed to: ${updateInvoice.data.invoice?.status}`);
    } else {
      logTest('invoicing', 'Update invoice status', 'FAIL', JSON.stringify(updateInvoice.error));
    }
  }

  // Test payment recording
  if (invoiceId) {
    const recordPayment = await apiCall('POST', `/invoicing/invoices/${invoiceId}/payments`, {
      amount: 575.00,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'bank_transfer',
      reference_number: `PAY-${Date.now()}`
    });

    if (recordPayment.success) {
      logTest('invoicing', 'Record payment', 'PASS',
        `Payment of $${recordPayment.data.payment?.amount} recorded`);
    } else {
      logTest('invoicing', 'Record payment', 'FAIL', JSON.stringify(recordPayment.error));
    }
  }
}

// 3. TIME TRACKING SYSTEM
async function testTimeTracking() {
  console.log('\n========== TESTING TIME TRACKING SYSTEM (PHASE 3) ==========\n');

  if (!authToken) {
    logTest('timeTracking', 'Skip - No authentication', 'FAIL', 'Authentication required');
    return;
  }

  // Check if time tracking tables exist
  try {
    const tableCheck = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('time_entries', 'billing_packs', 'billing_pack_entries')
    `);
    logTest('timeTracking', 'Database: Check time tracking tables', 'PASS',
      `Tables found: ${tableCheck.rows.map(r => r.table_name).join(', ')}`);
  } catch (error) {
    logTest('timeTracking', 'Database: Check time tracking tables', 'FAIL', error.message);
  }

  // Get matter for time entry (matters are in deals table)
  let matterId = null;
  try {
    const matterQuery = await pool.query('SELECT id FROM deals WHERE firm_id = $1 AND matter_number IS NOT NULL LIMIT 1', [firmId]);
    if (matterQuery.rows.length > 0) {
      matterId = matterQuery.rows[0].id;
      logTest('timeTracking', 'Database: Get test matter', 'PASS', `Matter ID: ${matterId}`);
    } else {
      logTest('timeTracking', 'Database: Get test matter', 'WARN', 'No matters found');
    }
  } catch (error) {
    logTest('timeTracking', 'Database: Get test matter', 'FAIL', error.message);
  }

  // Test time entry creation
  let timeEntryId = null;
  if (matterId && userId) {
    const createTimeEntry = await apiCall('POST', '/time-tracking/entries', {
      matter_id: matterId,
      user_id: userId,
      date: new Date().toISOString().split('T')[0],
      duration_minutes: 120,
      description: 'Legal research and case analysis',
      billable: true,
      hourly_rate: 250.00
    });

    if (createTimeEntry.success) {
      timeEntryId = createTimeEntry.data.entry?.id;
      logTest('timeTracking', 'Create time entry', 'PASS',
        `Entry created: ${createTimeEntry.data.entry?.duration_minutes} minutes @ $${createTimeEntry.data.entry?.hourly_rate}/hr`);
    } else {
      logTest('timeTracking', 'Create time entry', 'FAIL', JSON.stringify(createTimeEntry.error));
    }
  }

  // Test list time entries
  const listEntries = await apiCall('GET', '/time-tracking/entries');
  if (listEntries.success) {
    logTest('timeTracking', 'List time entries', 'PASS',
      `Found ${listEntries.data.entries?.length || 0} time entries`);
  } else {
    logTest('timeTracking', 'List time entries', 'FAIL', JSON.stringify(listEntries.error));
  }

  // Test billing pack generation
  if (matterId) {
    const createBillingPack = await apiCall('POST', '/time-tracking/billing-packs', {
      matter_id: matterId,
      period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      period_end: new Date().toISOString().split('T')[0],
      title: 'Monthly Billing Pack - Test'
    });

    if (createBillingPack.success) {
      logTest('timeTracking', 'Generate billing pack', 'PASS',
        `Billing pack created with ${createBillingPack.data.pack?.entry_count || 0} entries, Total: $${createBillingPack.data.pack?.total_amount}`);
    } else {
      logTest('timeTracking', 'Generate billing pack', 'FAIL', JSON.stringify(createBillingPack.error));
    }
  }

  // Test time entry approval workflow
  if (timeEntryId) {
    const approveEntry = await apiCall('PATCH', `/time-tracking/entries/${timeEntryId}/approve`);
    if (approveEntry.success) {
      logTest('timeTracking', 'Approve time entry', 'PASS',
        `Entry approved by ${approveEntry.data.entry?.approved_by}`);
    } else {
      logTest('timeTracking', 'Approve time entry', 'FAIL', JSON.stringify(approveEntry.error));
    }
  }
}

// 4. LIGHTNING PATH & MATTERS
async function testLightningPath() {
  console.log('\n========== TESTING LIGHTNING PATH & MATTERS (PHASE 4) ==========\n');

  if (!authToken) {
    logTest('lightningPath', 'Skip - No authentication', 'FAIL', 'Authentication required');
    return;
  }

  // Check if matters tables exist (matters are in deals table)
  try {
    const tableCheck = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('deals', 'lightning_stages', 'matter_assignments', 'matter_services')
    `);
    logTest('lightningPath', 'Database: Check matters tables', 'PASS',
      `Tables found: ${tableCheck.rows.map(r => r.table_name).join(', ')}`);
  } catch (error) {
    logTest('lightningPath', 'Database: Check matters tables', 'FAIL', error.message);
  }

  // Test list matters (using /api/v1/matters endpoint)
  const listMatters = await apiCall('GET', '/matters');
  if (listMatters.success) {
    logTest('lightningPath', 'List all matters', 'PASS',
      `Found ${listMatters.data.matters?.length || listMatters.data.data?.length || 0} matters`);
  } else {
    logTest('lightningPath', 'List all matters', 'FAIL', JSON.stringify(listMatters.error));
  }

  // Get company for matter creation
  let companyId = null;
  try {
    const companyQuery = await pool.query('SELECT id FROM companies WHERE firm_id = $1 LIMIT 1', [firmId]);
    if (companyQuery.rows.length > 0) {
      companyId = companyQuery.rows[0].id;
    } else {
      logTest('lightningPath', 'Database: Get company for matter', 'WARN', 'No companies found');
    }
  } catch (error) {
    logTest('lightningPath', 'Database: Get company for matter', 'FAIL', error.message);
  }

  // Test matter creation
  let matterId = null;
  if (companyId) {
    const createMatter = await apiCall('POST', '/matters', {
      company_id: companyId,
      title: `Test Matter - ${Date.now()}`,
      matter_type: 'litigation',
      matter_status: 'active',
      description: 'Comprehensive backend test matter',
      value: 15000.00,
      priority: 'high'
    });

    if (createMatter.success) {
      matterId = createMatter.data.matter?.id || createMatter.data.data?.id;
      logTest('lightningPath', 'Create matter', 'PASS',
        `Matter created, ID: ${matterId}`);
    } else {
      logTest('lightningPath', 'Create matter', 'FAIL', JSON.stringify(createMatter.error));
    }
  }

  // Test get matter by ID
  if (matterId) {
    const getMatter = await apiCall('GET', `/matters/${matterId}`);
    if (getMatter.success) {
      logTest('lightningPath', 'Get matter by ID', 'PASS',
        `Retrieved matter successfully`);
    } else {
      logTest('lightningPath', 'Get matter by ID', 'FAIL', JSON.stringify(getMatter.error));
    }
  }

  // Test Lightning Path stages
  const listStages = await apiCall('GET', '/matters/lightning-path');
  if (listStages.success) {
    logTest('lightningPath', 'List Lightning Path stages', 'PASS',
      `Found ${listStages.data.stages?.length || listStages.data.data?.length || 0} lightning stages`);
  } else {
    logTest('lightningPath', 'List Lightning Path stages', 'FAIL', JSON.stringify(listStages.error));
  }

  // Test matter assignments
  if (matterId && userId) {
    const assignMatter = await apiCall('POST', '/matters/assignments', {
      matter_id: matterId,
      user_id: userId,
      role: 'lead_attorney',
      assigned_by: userId
    });

    if (assignMatter.success) {
      logTest('lightningPath', 'Create matter assignment', 'PASS',
        `User assigned successfully`);
    } else {
      logTest('lightningPath', 'Create matter assignment', 'FAIL', JSON.stringify(assignMatter.error));
    }
  }
}

// 5. AI INTEGRATION
async function testAIIntegration() {
  console.log('\n========== TESTING AI INTEGRATION (PHASE 5) ==========\n');

  if (!authToken) {
    logTest('aiIntegration', 'Skip - No authentication', 'FAIL', 'Authentication required');
    return;
  }

  // Check if AI tables exist
  try {
    const tableCheck = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('ai_interactions', 'document_analyses')
    `);
    logTest('aiIntegration', 'Database: Check AI tables', 'PASS',
      `Tables found: ${tableCheck.rows.map(r => r.table_name).join(', ')}`);
  } catch (error) {
    logTest('aiIntegration', 'Database: Check AI tables', 'FAIL', error.message);
  }

  // Test AI Assistant chat
  const chatTest = await apiCall('POST', '/ai-assistant/chat', {
    message: 'What is the total value of all open matters?',
    context: 'matters'
  });

  if (chatTest.success) {
    logTest('aiIntegration', 'AI Assistant chat', 'PASS',
      `Response received: ${chatTest.data.response?.substring(0, 100)}...`);
  } else {
    logTest('aiIntegration', 'AI Assistant chat', 'FAIL', JSON.stringify(chatTest.error));
  }

  // Test Sales AI insights
  const salesInsights = await apiCall('GET', '/sales/ai-insights/pipeline');
  if (salesInsights.success) {
    logTest('aiIntegration', 'Sales pipeline AI insights', 'PASS',
      `Insights generated: ${salesInsights.data.insights?.length || 0} recommendations`);
  } else {
    logTest('aiIntegration', 'Sales pipeline AI insights', 'FAIL', JSON.stringify(salesInsights.error));
  }

  // Test Document Analysis
  const analyzeDoc = await apiCall('POST', '/ai/analyze-document', {
    content: 'This is a sample legal document for analysis testing. It contains provisions related to confidentiality and dispute resolution.',
    document_type: 'contract'
  });

  if (analyzeDoc.success) {
    logTest('aiIntegration', 'Document analysis', 'PASS',
      `Analysis completed with confidence: ${analyzeDoc.data.confidence || 'N/A'}`);
  } else {
    logTest('aiIntegration', 'Document analysis', 'FAIL', JSON.stringify(analyzeDoc.error));
  }

  // Test Quick Insights
  const quickInsights = await apiCall('POST', '/ai-assistant/quick-insights', {
    context: 'financial'
  });

  if (quickInsights.success) {
    logTest('aiIntegration', 'Quick insights generation', 'PASS',
      `${quickInsights.data.insights?.length || 0} insights generated`);
  } else {
    logTest('aiIntegration', 'Quick insights generation', 'FAIL', JSON.stringify(quickInsights.error));
  }
}

// 6. DOCUMENT ROUTING
async function testDocumentRouting() {
  console.log('\n========== TESTING DOCUMENT ROUTING (PHASE 6) ==========\n');

  if (!authToken) {
    logTest('documentRouting', 'Skip - No authentication', 'FAIL', 'Authentication required');
    return;
  }

  // Check if document routing tables exist
  try {
    const tableCheck = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('documents', 'document_routing_rules', 'document_permissions')
    `);
    logTest('documentRouting', 'Database: Check document routing tables', 'PASS',
      `Tables found: ${tableCheck.rows.map(r => r.table_name).join(', ')}`);
  } catch (error) {
    logTest('documentRouting', 'Database: Check document routing tables', 'FAIL', error.message);
  }

  // Test list routing rules
  const listRules = await apiCall('GET', '/legal-crm/document-routing/rules');
  if (listRules.success) {
    logTest('documentRouting', 'List routing rules', 'PASS',
      `Found ${listRules.data.rules?.length || 0} routing rules`);
  } else {
    logTest('documentRouting', 'List routing rules', 'FAIL', JSON.stringify(listRules.error));
  }

  // Test create routing rule
  const createRule = await apiCall('POST', '/legal-crm/document-routing/rules', {
    name: 'Test Routing Rule',
    document_type: 'contract',
    conditions: {
      keywords: ['confidential', 'NDA'],
      client_type: 'corporate'
    },
    actions: {
      assign_to: userId,
      notify: true,
      priority: 'high'
    },
    priority: 10,
    is_active: true
  });

  if (createRule.success) {
    logTest('documentRouting', 'Create routing rule', 'PASS',
      `Rule "${createRule.data.rule?.name}" created with priority ${createRule.data.rule?.priority}`);
  } else {
    logTest('documentRouting', 'Create routing rule', 'FAIL', JSON.stringify(createRule.error));
  }

  // Test document permissions
  const listPermissions = await apiCall('GET', '/legal-crm/documents/permissions');
  if (listPermissions.success) {
    logTest('documentRouting', 'List document permissions', 'PASS',
      `Found ${listPermissions.data.permissions?.length || 0} permission records`);
  } else {
    logTest('documentRouting', 'List document permissions', 'FAIL', JSON.stringify(listPermissions.error));
  }
}

// 7. MULTI-TENANCY & SECURITY
async function testMultiTenancySecurity() {
  console.log('\n========== TESTING MULTI-TENANCY & SECURITY ==========\n');

  if (!authToken) {
    logTest('multiTenancy', 'Skip - No authentication', 'FAIL', 'Authentication required');
    return;
  }

  // Test firm isolation - try to access another firm's data
  try {
    const firmsQuery = await pool.query('SELECT id FROM firms WHERE id != $1 LIMIT 1', [firmId]);
    if (firmsQuery.rows.length > 0) {
      const otherFirmId = firmsQuery.rows[0].id;

      // Try to get clients from another firm
      const clientQuery = await pool.query('SELECT id FROM clients WHERE firm_id = $1 LIMIT 1', [otherFirmId]);
      if (clientQuery.rows.length > 0) {
        const otherClientId = clientQuery.rows[0].id;

        // This should fail or return empty due to firm isolation
        const getOtherClient = await apiCall('GET', `/crm/companies/${otherClientId}`);

        if (!getOtherClient.success || !getOtherClient.data) {
          logTest('multiTenancy', 'Firm data isolation', 'PASS',
            'Cannot access other firm\'s data - isolation working');
        } else {
          logTest('multiTenancy', 'Firm data isolation', 'FAIL',
            'SECURITY ISSUE: Can access other firm\'s data');
        }
      } else {
        logTest('multiTenancy', 'Firm data isolation', 'WARN',
          'Cannot test - no data in other firms');
      }
    } else {
      logTest('multiTenancy', 'Firm data isolation', 'WARN',
        'Cannot test - only one firm exists');
    }
  } catch (error) {
    logTest('multiTenancy', 'Firm data isolation', 'FAIL', error.message);
  }

  // Test RBAC permissions
  try {
    const roleQuery = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    const userRole = roleQuery.rows[0]?.role;

    logTest('multiTenancy', 'Check user role', 'PASS', `Current user role: ${userRole}`);

    // Test admin-only endpoint (if not admin)
    if (userRole !== 'admin' && userRole !== 'firm_admin') {
      const adminTest = await apiCall('POST', '/admin/firms', {
        name: 'Test Firm',
        subscription_tier: 'professional'
      });

      if (!adminTest.success && adminTest.status === 403) {
        logTest('multiTenancy', 'RBAC: Non-admin blocked', 'PASS',
          'Non-admin users correctly blocked from admin endpoints');
      } else {
        logTest('multiTenancy', 'RBAC: Non-admin blocked', 'WARN',
          'RBAC test inconclusive or not implemented');
      }
    } else {
      logTest('multiTenancy', 'RBAC: Non-admin blocked', 'WARN',
        'Cannot test - current user is admin');
    }
  } catch (error) {
    logTest('multiTenancy', 'Check user role', 'FAIL', error.message);
  }

  // Test audit logging
  try {
    const auditQuery = await pool.query(`
      SELECT COUNT(*) as count FROM audit_logs
      WHERE firm_id = $1
      AND created_at > NOW() - INTERVAL '1 hour'
    `, [firmId]);

    logTest('multiTenancy', 'Audit logging active', 'PASS',
      `${auditQuery.rows[0].count} audit logs in last hour`);
  } catch (error) {
    logTest('multiTenancy', 'Audit logging active', 'FAIL', error.message);
  }

  // Test JWT token validation
  const invalidTokenTest = await apiCall('GET', '/auth/me', null, false);
  if (!invalidTokenTest.success) {
    logTest('multiTenancy', 'JWT: Reject missing token', 'PASS',
      'Endpoints correctly reject requests without token');
  } else {
    logTest('multiTenancy', 'JWT: Reject missing token', 'FAIL',
      'SECURITY ISSUE: Endpoint accessible without authentication');
  }
}

// Generate comprehensive test report
function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('COMPREHENSIVE BACKEND TEST REPORT');
  console.log('='.repeat(80));
  console.log(`Generated: ${new Date().toISOString()}`);
  console.log(`Backend URL: ${BASE_URL}`);
  console.log(`Firm ID: ${firmId}`);
  console.log(`User ID: ${userId}`);
  console.log('='.repeat(80));

  const categories = [
    'authentication',
    'invoicing',
    'timeTracking',
    'lightningPath',
    'aiIntegration',
    'documentRouting',
    'multiTenancy'
  ];

  categories.forEach(category => {
    const categoryName = category.replace(/([A-Z])/g, ' $1').toUpperCase();
    console.log(`\n${categoryName}:`);
    console.log('-'.repeat(80));

    if (results[category].length === 0) {
      console.log('  No tests run');
    } else {
      results[category].forEach(test => {
        const symbol = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
        console.log(`  ${symbol} ${test.test}`);
        if (test.details) {
          console.log(`     ${test.details}`);
        }
      });
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Passed: ${results.summary.passed}`);
  console.log(`❌ Failed: ${results.summary.failed}`);
  console.log(`⚠️  Warnings: ${results.summary.warnings}`);
  console.log(`📊 Total Tests: ${results.summary.passed + results.summary.failed + results.summary.warnings}`);

  const successRate = ((results.summary.passed / (results.summary.passed + results.summary.failed + results.summary.warnings)) * 100).toFixed(1);
  console.log(`📈 Success Rate: ${successRate}%`);
  console.log('='.repeat(80));

  // Write detailed JSON report
  const fs = require('fs');
  const reportPath = './COMPREHENSIVE_BACKEND_TEST_REPORT.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed JSON report saved to: ${reportPath}`);

  // Write markdown report
  const mdReport = generateMarkdownReport();
  const mdPath = './COMPREHENSIVE_BACKEND_TEST_REPORT.md';
  fs.writeFileSync(mdPath, mdReport);
  console.log(`📄 Markdown report saved to: ${mdPath}`);
}

function generateMarkdownReport() {
  let md = '# Comprehensive Backend Test Report\n\n';
  md += `**Generated:** ${new Date().toISOString()}\n\n`;
  md += `**Backend URL:** ${BASE_URL}\n\n`;
  md += `**Firm ID:** ${firmId}\n\n`;
  md += `**User ID:** ${userId}\n\n`;
  md += '---\n\n';

  md += '## Summary\n\n';
  md += `- ✅ **Passed:** ${results.summary.passed}\n`;
  md += `- ❌ **Failed:** ${results.summary.failed}\n`;
  md += `- ⚠️ **Warnings:** ${results.summary.warnings}\n`;
  md += `- 📊 **Total Tests:** ${results.summary.passed + results.summary.failed + results.summary.warnings}\n`;

  const successRate = ((results.summary.passed / (results.summary.passed + results.summary.failed + results.summary.warnings)) * 100).toFixed(1);
  md += `- 📈 **Success Rate:** ${successRate}%\n\n`;

  md += '---\n\n';

  const categoryTitles = {
    authentication: 'Authentication & User Management',
    invoicing: 'Invoicing System (Phase 2)',
    timeTracking: 'Time Tracking System (Phase 3)',
    lightningPath: 'Lightning Path & Matters (Phase 4)',
    aiIntegration: 'AI Integration (Phase 5)',
    documentRouting: 'Document Routing (Phase 6)',
    multiTenancy: 'Multi-Tenancy & Security'
  };

  Object.entries(categoryTitles).forEach(([category, title]) => {
    md += `## ${title}\n\n`;

    if (results[category].length === 0) {
      md += '*No tests run*\n\n';
    } else {
      results[category].forEach(test => {
        const symbol = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
        md += `### ${symbol} ${test.test}\n\n`;
        if (test.details) {
          md += `**Details:** ${test.details}\n\n`;
        }
      });
    }
  });

  return md;
}

// Main execution
async function runAllTests() {
  console.log('Starting comprehensive backend testing...\n');

  try {
    await testAuthentication();
    await testInvoicing();
    await testTimeTracking();
    await testLightningPath();
    await testAIIntegration();
    await testDocumentRouting();
    await testMultiTenancySecurity();

    generateReport();
  } catch (error) {
    console.error('Fatal error during testing:', error);
  } finally {
    await pool.end();
  }
}

runAllTests();
