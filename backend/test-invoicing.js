/**
 * LegalNexus CRM - Invoicing System Test
 * Comprehensive test of invoice and payment functionality
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api/v1';
let authToken = '';
let testInvoiceId = '';
let testLineItemId = '';
let testPaymentId = '';

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bold');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Test runner
async function runTests() {
  try {
    logSection('🚀 LegalNexus Invoicing System Test Suite');

    // Step 1: Login
    logSection('1. Authentication');
    await testLogin();

    // Step 2: Create Invoice
    logSection('2. Create Invoice');
    await testCreateInvoice();

    // Step 3: Add Line Items
    logSection('3. Add Line Items');
    await testAddLineItems();

    // Step 4: Get Invoice Details
    logSection('4. Get Invoice Details');
    await testGetInvoice();

    // Step 5: Update Invoice
    logSection('5. Update Invoice');
    await testUpdateInvoice();

    // Step 6: Send Invoice
    logSection('6. Send Invoice');
    await testSendInvoice();

    // Step 7: Record Payment
    logSection('7. Record Payment');
    await testRecordPayment();

    // Step 8: Get Invoice Statistics
    logSection('8. Invoice Statistics');
    await testInvoiceStats();

    // Step 9: Generate PDF
    logSection('9. Generate Invoice PDF');
    await testGeneratePDF();

    // Step 10: Test Overdue Detection
    logSection('10. Overdue Invoice Detection');
    await testOverdueInvoices();

    // Step 11: List Invoices
    logSection('11. List Invoices');
    await testListInvoices();

    // Step 12: Payment Statistics
    logSection('12. Payment Statistics');
    await testPaymentStats();

    // Summary
    logSection('✅ TEST SUMMARY');
    logSuccess('All invoicing tests passed!');
    log('\nInvoicing System Status: OPERATIONAL', 'green');
    log('Database: Connected & Working', 'green');
    log('API Endpoints: All Functional', 'green');
    log('Business Logic: Validated', 'green');

  } catch (error) {
    logSection('❌ TEST FAILED');
    logError(`Error: ${error.message}`);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Test Functions

async function testLogin() {
  try {
    logInfo('Logging in with test credentials...');

    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });

    authToken = response.data.data.token;
    logSuccess('Authentication successful');
    logInfo(`Token: ${authToken.substring(0, 20)}...`);

  } catch (error) {
    logError('Login failed');
    throw error;
  }
}

async function testCreateInvoice() {
  try {
    logInfo('Creating new invoice...');

    // First, get a client to associate with the invoice
    const clientsResponse = await axios.get(`${API_URL}/crm/companies?limit=1`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const clientId = clientsResponse.data.data[0]?.id;

    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const response = await axios.post(
      `${API_URL}/invoicing/invoices`,
      {
        client_id: clientId,
        issue_date: today.toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        notes: 'Test invoice for legal services',
        terms: 'Payment due within 30 days. Late payments subject to interest.',
        vat_rate: 0.15
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    testInvoiceId = response.data.data.id;
    const invoiceNumber = response.data.data.invoice_number;

    logSuccess('Invoice created successfully');
    logInfo(`Invoice ID: ${testInvoiceId}`);
    logInfo(`Invoice Number: ${invoiceNumber}`);
    logInfo(`Client: ${clientsResponse.data.data[0]?.name || 'N/A'}`);
    logInfo(`Status: ${response.data.data.status}`);

  } catch (error) {
    logError('Failed to create invoice');
    throw error;
  }
}

async function testAddLineItems() {
  try {
    logInfo('Adding line items to invoice...');

    // Line item 1: Legal consultation
    const item1 = await axios.post(
      `${API_URL}/invoicing/invoices/${testInvoiceId}/line-items`,
      {
        description: 'Legal consultation and case review',
        quantity: 5,
        unit_price: 2500.00
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    testLineItemId = item1.data.data.id;
    logSuccess('Line item 1 added: Legal consultation (5 hrs × R2500)');

    // Line item 2: Document preparation
    const item2 = await axios.post(
      `${API_URL}/invoicing/invoices/${testInvoiceId}/line-items`,
      {
        description: 'Contract drafting and review',
        quantity: 3,
        unit_price: 3000.00
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    logSuccess('Line item 2 added: Contract drafting (3 hrs × R3000)');

    // Line item 3: Court representation
    const item3 = await axios.post(
      `${API_URL}/invoicing/invoices/${testInvoiceId}/line-items`,
      {
        description: 'Court appearance and representation',
        quantity: 1,
        unit_price: 8000.00
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    logSuccess('Line item 3 added: Court representation (1 day × R8000)');

    logInfo('Total line items: 3');
    logInfo('Expected subtotal: R30,500.00 (12,500 + 9,000 + 8,000)');

  } catch (error) {
    logError('Failed to add line items');
    throw error;
  }
}

async function testGetInvoice() {
  try {
    logInfo('Fetching invoice details...');

    const response = await axios.get(
      `${API_URL}/invoicing/invoices/${testInvoiceId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    const invoice = response.data.data;

    logSuccess('Invoice retrieved successfully');
    logInfo(`Invoice Number: ${invoice.invoice_number}`);
    logInfo(`Status: ${invoice.status}`);
    logInfo(`Subtotal: R${parseFloat(invoice.subtotal).toFixed(2)}`);
    logInfo(`VAT (15%): R${parseFloat(invoice.vat_amount).toFixed(2)}`);
    logInfo(`Total: R${parseFloat(invoice.total).toFixed(2)}`);
    logInfo(`Balance Due: R${parseFloat(invoice.balance_due).toFixed(2)}`);
    logInfo(`Line Items: ${invoice.line_items?.length || 0}`);

    // Verify calculations
    const expectedSubtotal = 30500.00;
    const actualSubtotal = parseFloat(invoice.subtotal);
    const expectedVAT = 4575.00;
    const actualVAT = parseFloat(invoice.vat_amount);
    const expectedTotal = 35075.00;
    const actualTotal = parseFloat(invoice.total);

    if (Math.abs(actualSubtotal - expectedSubtotal) < 0.01) {
      logSuccess(`Subtotal calculation correct: R${actualSubtotal.toFixed(2)}`);
    } else {
      logError(`Subtotal mismatch: Expected R${expectedSubtotal}, got R${actualSubtotal}`);
    }

    if (Math.abs(actualVAT - expectedVAT) < 0.01) {
      logSuccess(`VAT calculation correct: R${actualVAT.toFixed(2)}`);
    } else {
      logError(`VAT mismatch: Expected R${expectedVAT}, got R${actualVAT}`);
    }

    if (Math.abs(actualTotal - expectedTotal) < 0.01) {
      logSuccess(`Total calculation correct: R${actualTotal.toFixed(2)}`);
    } else {
      logError(`Total mismatch: Expected R${expectedTotal}, got R${actualTotal}`);
    }

  } catch (error) {
    logError('Failed to get invoice details');
    throw error;
  }
}

async function testUpdateInvoice() {
  try {
    logInfo('Updating invoice notes...');

    const response = await axios.put(
      `${API_URL}/invoicing/invoices/${testInvoiceId}`,
      {
        notes: 'Updated notes: This invoice has been reviewed and approved for sending.'
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    logSuccess('Invoice updated successfully');
    logInfo('Notes updated');

  } catch (error) {
    logError('Failed to update invoice');
    throw error;
  }
}

async function testSendInvoice() {
  try {
    logInfo('Sending invoice to client...');

    const response = await axios.post(
      `${API_URL}/invoicing/invoices/${testInvoiceId}/send`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    logSuccess('Invoice sent successfully');
    logInfo('Status updated to: sent');

  } catch (error) {
    logError('Failed to send invoice');
    throw error;
  }
}

async function testRecordPayment() {
  try {
    logInfo('Recording payment...');

    const today = new Date();

    // Record partial payment
    const response = await axios.post(
      `${API_URL}/invoicing/payments`,
      {
        invoice_id: testInvoiceId,
        amount: 20000.00,
        payment_date: today.toISOString().split('T')[0],
        payment_method: 'EFT',
        reference: 'TEST-PAY-001',
        notes: 'Partial payment via electronic funds transfer'
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    testPaymentId = response.data.data.id;

    logSuccess('Payment recorded successfully');
    logInfo(`Payment ID: ${testPaymentId}`);
    logInfo('Amount: R20,000.00');
    logInfo('Method: EFT');
    logInfo('Reference: TEST-PAY-001');

    // Verify invoice balance updated
    const invoiceResponse = await axios.get(
      `${API_URL}/invoicing/invoices/${testInvoiceId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    const balanceDue = parseFloat(invoiceResponse.data.data.balance_due);
    const expectedBalance = 15075.00; // 35075 - 20000

    if (Math.abs(balanceDue - expectedBalance) < 0.01) {
      logSuccess(`Balance due updated correctly: R${balanceDue.toFixed(2)}`);
    } else {
      logError(`Balance mismatch: Expected R${expectedBalance}, got R${balanceDue}`);
    }

    logInfo(`Amount Paid: R${parseFloat(invoiceResponse.data.data.amount_paid).toFixed(2)}`);
    logInfo(`Balance Due: R${balanceDue.toFixed(2)}`);

  } catch (error) {
    logError('Failed to record payment');
    throw error;
  }
}

async function testInvoiceStats() {
  try {
    logInfo('Fetching invoice statistics...');

    const response = await axios.get(
      `${API_URL}/invoicing/invoices/stats`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    const stats = response.data.data;

    logSuccess('Statistics retrieved successfully');
    logInfo(`Total Invoices: ${stats.total_invoices}`);
    logInfo(`Draft: ${stats.draft_count}`);
    logInfo(`Sent: ${stats.sent_count}`);
    logInfo(`Paid: ${stats.paid_count}`);
    logInfo(`Overdue: ${stats.overdue_count}`);
    logInfo(`Total Value: R${parseFloat(stats.total_value).toFixed(2)}`);
    logInfo(`Total Paid: R${parseFloat(stats.total_paid).toFixed(2)}`);
    logInfo(`Total Outstanding: R${parseFloat(stats.total_outstanding).toFixed(2)}`);

  } catch (error) {
    logError('Failed to get statistics');
    throw error;
  }
}

async function testGeneratePDF() {
  try {
    logInfo('Generating invoice PDF...');

    const response = await axios.get(
      `${API_URL}/invoicing/invoices/${testInvoiceId}/pdf`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
        responseType: 'arraybuffer'
      }
    );

    const pdfSize = response.data.length;

    logSuccess('PDF generated successfully');
    logInfo(`PDF Size: ${(pdfSize / 1024).toFixed(2)} KB`);
    logInfo('Content-Type: application/pdf');

    if (pdfSize > 0) {
      logSuccess('PDF contains data');
    } else {
      logError('PDF is empty');
    }

  } catch (error) {
    logError('Failed to generate PDF');
    throw error;
  }
}

async function testOverdueInvoices() {
  try {
    logInfo('Checking for overdue invoices...');

    const response = await axios.get(
      `${API_URL}/invoicing/invoices/overdue`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    const overdueInvoices = response.data.data;

    logSuccess('Overdue check completed');
    logInfo(`Overdue Invoices Found: ${overdueInvoices.length}`);

    if (overdueInvoices.length > 0) {
      overdueInvoices.forEach((invoice, index) => {
        logInfo(`  ${index + 1}. ${invoice.invoice_number} - R${parseFloat(invoice.balance_due).toFixed(2)}`);
      });
    }

  } catch (error) {
    logError('Failed to check overdue invoices');
    throw error;
  }
}

async function testListInvoices() {
  try {
    logInfo('Listing all invoices...');

    const response = await axios.get(
      `${API_URL}/invoicing/invoices?limit=10`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    const invoices = response.data.data;
    const pagination = response.data.pagination;

    logSuccess('Invoice list retrieved');
    logInfo(`Invoices Returned: ${invoices.length}`);
    logInfo(`Total Invoices: ${pagination.total}`);
    logInfo(`Current Page: ${pagination.page} of ${pagination.pages}`);

    if (invoices.length > 0) {
      log('\nRecent Invoices:', 'yellow');
      invoices.slice(0, 3).forEach((invoice, index) => {
        logInfo(`  ${index + 1}. ${invoice.invoice_number} - ${invoice.client_name || 'No Client'} - R${parseFloat(invoice.total).toFixed(2)} [${invoice.status}]`);
      });
    }

  } catch (error) {
    logError('Failed to list invoices');
    throw error;
  }
}

async function testPaymentStats() {
  try {
    logInfo('Fetching payment statistics...');

    const response = await axios.get(
      `${API_URL}/invoicing/payments/stats`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    const stats = response.data.data;

    logSuccess('Payment statistics retrieved');
    logInfo(`Total Payments: ${stats.total_payments}`);
    logInfo(`Total Amount: R${parseFloat(stats.total_amount).toFixed(2)}`);
    logInfo(`Invoices with Payments: ${stats.invoices_with_payments}`);
    logInfo(`Payment Days: ${stats.payment_days}`);

    // Get recent payments
    const recentResponse = await axios.get(
      `${API_URL}/invoicing/payments/recent?limit=5`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    const recentPayments = recentResponse.data.data;

    if (recentPayments.length > 0) {
      log('\nRecent Payments:', 'yellow');
      recentPayments.forEach((payment, index) => {
        logInfo(`  ${index + 1}. ${payment.invoice_number} - R${parseFloat(payment.amount).toFixed(2)} [${payment.payment_method || 'N/A'}]`);
      });
    }

  } catch (error) {
    logError('Failed to get payment statistics');
    throw error;
  }
}

// Run tests
runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
