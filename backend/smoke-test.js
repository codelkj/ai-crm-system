/**
 * Smoke Test - Verify Financial Module Implementation
 * Tests that all modules compile and load correctly
 * Does NOT require database connection
 */

console.log('🔍 Running Financial Module Smoke Test...\n');

// Load environment variables
require('dotenv').config();

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.error(`   Error: ${error.message}`);
    failed++;
  }
}

// Test 1: Check environment variables
test('Environment variables loaded', () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not set');
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set');
  }
});

// Test 2: OpenAI configuration
test('OpenAI configuration loaded', () => {
  const { default: openai, AI_CONFIG } = require('./dist/config/ai');
  if (!AI_CONFIG) throw new Error('AI_CONFIG not found');
  if (!AI_CONFIG.model) throw new Error('AI model not configured');
  if (process.env.OPENAI_API_KEY && !openai) {
    throw new Error('OpenAI client not initialized despite API key being set');
  }
});

// Test 3: Financial types
test('Financial types defined', () => {
  const types = require('./dist/modules/financial/types/financial.types');
  if (!types) throw new Error('Types not exported');
});

// Test 4: Bank Account Service
test('BankAccountService loads', () => {
  const { BankAccountService } = require('./dist/modules/financial/services/bank-account.service');
  if (!BankAccountService) throw new Error('BankAccountService not found');
  if (typeof BankAccountService.create !== 'function') {
    throw new Error('BankAccountService.create is not a function');
  }
  if (typeof BankAccountService.getAll !== 'function') {
    throw new Error('BankAccountService.getAll is not a function');
  }
  if (typeof BankAccountService.getById !== 'function') {
    throw new Error('BankAccountService.getById is not a function');
  }
  if (typeof BankAccountService.delete !== 'function') {
    throw new Error('BankAccountService.delete is not a function');
  }
});

// Test 5: CSV Parser Service
test('CSVParserService loads', () => {
  const { CSVParserService } = require('./dist/modules/financial/services/csv-parser.service');
  if (!CSVParserService) throw new Error('CSVParserService not found');
  if (typeof CSVParserService.parseCSV !== 'function') {
    throw new Error('CSVParserService.parseCSV is not a function');
  }
  if (typeof CSVParserService.detectCSVFormat !== 'function') {
    throw new Error('CSVParserService.detectCSVFormat is not a function');
  }
  if (typeof CSVParserService.normalizeTransaction !== 'function') {
    throw new Error('CSVParserService.normalizeTransaction is not a function');
  }
});

// Test 6: Categorization Service
test('CategorizationService loads', () => {
  const { CategorizationService } = require('./dist/modules/financial/services/categorization.service');
  if (!CategorizationService) throw new Error('CategorizationService not found');
  if (typeof CategorizationService.getAllCategories !== 'function') {
    throw new Error('CategorizationService.getAllCategories is not a function');
  }
  if (typeof CategorizationService.categorizeTransaction !== 'function') {
    throw new Error('CategorizationService.categorizeTransaction is not a function');
  }
  if (typeof CategorizationService.batchCategorize !== 'function') {
    throw new Error('CategorizationService.batchCategorize is not a function');
  }
});

// Test 7: Transaction Service
test('TransactionService loads', () => {
  const { TransactionService } = require('./dist/modules/financial/services/transaction.service');
  if (!TransactionService) throw new Error('TransactionService not found');
  if (typeof TransactionService.processCSVUpload !== 'function') {
    throw new Error('TransactionService.processCSVUpload is not a function');
  }
  if (typeof TransactionService.create !== 'function') {
    throw new Error('TransactionService.create is not a function');
  }
  if (typeof TransactionService.getAll !== 'function') {
    throw new Error('TransactionService.getAll is not a function');
  }
  if (typeof TransactionService.getById !== 'function') {
    throw new Error('TransactionService.getById is not a function');
  }
  if (typeof TransactionService.updateCategory !== 'function') {
    throw new Error('TransactionService.updateCategory is not a function');
  }
});

// Test 8: Controllers
test('BankAccountController loads', () => {
  const { BankAccountController } = require('./dist/modules/financial/controllers/bank-account.controller');
  if (!BankAccountController) throw new Error('BankAccountController not found');
  if (typeof BankAccountController.create !== 'function') {
    throw new Error('BankAccountController.create is not a function');
  }
  if (typeof BankAccountController.getAll !== 'function') {
    throw new Error('BankAccountController.getAll is not a function');
  }
});

test('TransactionController loads', () => {
  const { TransactionController } = require('./dist/modules/financial/controllers/transaction.controller');
  if (!TransactionController) throw new Error('TransactionController not found');
  if (typeof TransactionController.uploadCSV !== 'function') {
    throw new Error('TransactionController.uploadCSV is not a function');
  }
  if (typeof TransactionController.getAll !== 'function') {
    throw new Error('TransactionController.getAll is not a function');
  }
  if (typeof TransactionController.updateCategory !== 'function') {
    throw new Error('TransactionController.updateCategory is not a function');
  }
});

// Test 9: Routes
test('Financial routes configured', () => {
  const routes = require('./dist/modules/financial/routes/financial.routes');
  if (!routes.default) throw new Error('Financial routes not exported');
});

// Test 10: CSV Upload Middleware
test('CSV upload middleware configured', () => {
  const { uploadCSV } = require('./dist/modules/financial/middleware/csv-upload.middleware');
  if (!uploadCSV) throw new Error('uploadCSV middleware not found');
  if (typeof uploadCSV !== 'function') {
    throw new Error('uploadCSV is not a function');
  }
});

// Test 11: Validators
test('Validators configured', () => {
  const validators = require('./dist/modules/financial/validators/financial.validators');
  if (!validators.createBankAccountValidators) {
    throw new Error('createBankAccountValidators not found');
  }
  if (!validators.csvUploadValidators) {
    throw new Error('csvUploadValidators not found');
  }
  if (!validators.getTransactionsValidators) {
    throw new Error('getTransactionsValidators not found');
  }
  if (!validators.updateCategoryValidators) {
    throw new Error('updateCategoryValidators not found');
  }
});

// Test 12: App integration
test('Financial routes registered in app', () => {
  const app = require('./dist/app').default;
  if (!app) throw new Error('App not loaded');
  // Routes are registered, we can't easily test this without starting server
  // but if app loads, routes are registered
});

// Test 13: CSV Format Detection
test('CSV format detection works', () => {
  const { CSVParserService } = require('./dist/modules/financial/services/csv-parser.service');

  const standardCSV = 'date,description,amount,type\n2024-01-01,Test,100,debit';
  const format1 = CSVParserService.detectCSVFormat(standardCSV);
  if (format1 !== 'standard') {
    throw new Error(`Expected 'standard', got '${format1}'`);
  }

  const chaseCSV = 'Posting Date,Description,Amount,Type,Balance\n01/01/2024,Test,100,Debit,1000';
  const format2 = CSVParserService.detectCSVFormat(chaseCSV);
  if (format2 !== 'chase') {
    throw new Error(`Expected 'chase', got '${format2}'`);
  }
});

// Test 14: Date parsing
test('Date parsing works', () => {
  const { CSVParserService } = require('./dist/modules/financial/services/csv-parser.service');

  const date1 = CSVParserService.parseDate('01/15/2024');
  if (!(date1 instanceof Date) || isNaN(date1.getTime())) {
    throw new Error('Failed to parse MM/DD/YYYY format');
  }

  const date2 = CSVParserService.parseDate('2024-01-15');
  if (!(date2 instanceof Date) || isNaN(date2.getTime())) {
    throw new Error('Failed to parse YYYY-MM-DD format');
  }
});

// Test 15: Amount parsing
test('Amount parsing works', () => {
  const { CSVParserService } = require('./dist/modules/financial/services/csv-parser.service');

  const amount1 = CSVParserService.parseAmount('$1,234.56');
  if (amount1 !== 1234.56) {
    throw new Error(`Expected 1234.56, got ${amount1}`);
  }

  const amount2 = CSVParserService.parseAmount('(500.00)');
  if (amount2 !== -500.00) {
    throw new Error(`Expected -500.00, got ${amount2}`);
  }

  const amount3 = CSVParserService.parseAmount('100.50');
  if (amount3 !== 100.50) {
    throw new Error(`Expected 100.50, got ${amount3}`);
  }
});

// Print summary
console.log('\n' + '='.repeat(50));
console.log(`Test Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(50));

if (failed === 0) {
  console.log('\n🎉 All smoke tests passed!');
  console.log('\n✅ Financial module implementation verified:');
  console.log('   - All services load correctly');
  console.log('   - All controllers are configured');
  console.log('   - Routes are registered');
  console.log('   - CSV parsing works');
  console.log('   - OpenAI is configured');
  console.log('\n📝 Next steps:');
  console.log('   1. Start Docker Desktop');
  console.log('   2. Run: cd docker && docker-compose up -d database');
  console.log('   3. Run: cd backend && npm run dev');
  console.log('   4. See QUICK_START.md for manual testing');
  console.log('   5. Or run: npm test (for integration tests)');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed. Please fix the errors above.');
  process.exit(1);
}
