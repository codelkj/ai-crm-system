/**
 * Integration Tests for Financial Module
 * Tests the complete CSV upload and categorization flow
 */

import request from 'supertest';
import fs from 'fs';
import path from 'path';
import app from '../../../src/app';
import pool from '../../../src/config/database';

describe('Financial Module Integration Tests', () => {
  let authToken: string;
  let bankAccountId: string;
  let transactionId: string;

  // Setup: Create test user and get auth token
  beforeAll(async () => {
    // Create test user
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'Test123!',
      first_name: 'Test',
      last_name: 'User'
    };

    const signupRes = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    if (signupRes.status === 201 && signupRes.body.data) {
      authToken = signupRes.body.data.token;
    } else {
      // Try to login if user exists
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      if (loginRes.status === 200 && loginRes.body.data) {
        authToken = loginRes.body.data.token;
      } else {
        throw new Error(`Failed to authenticate: Register status ${signupRes.status}, Login status ${loginRes.status}`);
      }
    }
  });

  // Cleanup: Close database connection
  afterAll(async () => {
    // Clean up test data
    if (bankAccountId) {
      await pool.query('DELETE FROM transactions WHERE account_id = $1', [bankAccountId]);
      await pool.query('DELETE FROM bank_accounts WHERE id = $1', [bankAccountId]);
    }
    await pool.end();
  });

  describe('Bank Account Management', () => {
    test('POST /api/v1/financial/bank-accounts - Create bank account', async () => {
      const accountData = {
        account_name: 'Test Checking Account',
        account_number: '1234567890',
        bank_name: 'Test Bank',
        account_type: 'checking',
        currency: 'USD'
      };

      const res = await request(app)
        .post('/api/v1/financial/bank-accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(accountData)
        .expect(201);

      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.account_name).toBe(accountData.account_name);
      expect(res.body.data.bank_name).toBe(accountData.bank_name);

      bankAccountId = res.body.data.id;
    });

    test('GET /api/v1/financial/bank-accounts - List bank accounts', async () => {
      const res = await request(app)
        .get('/api/v1/financial/bank-accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test('GET /api/v1/financial/bank-accounts/:id - Get bank account by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/financial/bank-accounts/${bankAccountId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.data.id).toBe(bankAccountId);
      expect(res.body.data.account_name).toBe('Test Checking Account');
    });
  });

  describe('CSV Upload and Processing', () => {
    let csvFilePath: string;

    beforeAll(() => {
      // Create test CSV file
      const csvContent = `date,description,amount,type
2024-01-15,Amazon AWS,125.50,debit
2024-01-16,Client Payment,5000.00,credit
2024-01-17,Office Depot,89.99,debit
2024-01-18,Salary,3500.00,credit
2024-01-19,Rent Payment,1500.00,debit`;

      csvFilePath = path.join(__dirname, 'test-transactions.csv');
      fs.writeFileSync(csvFilePath, csvContent);
    });

    afterAll(() => {
      // Clean up test CSV file
      if (fs.existsSync(csvFilePath)) {
        fs.unlinkSync(csvFilePath);
      }
    });

    test('POST /api/v1/financial/transactions/upload - Upload CSV file', async () => {
      const res = await request(app)
        .post('/api/v1/financial/transactions/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('account_id', bankAccountId)
        .field('csv_format', 'standard')
        .attach('file', csvFilePath)
        .expect(200);

      expect(res.body.data).toHaveProperty('total_processed');
      expect(res.body.data).toHaveProperty('successful');
      expect(res.body.data).toHaveProperty('failed');
      expect(res.body.data).toHaveProperty('duplicates');
      expect(res.body.data).toHaveProperty('transactions');

      expect(res.body.data.total_processed).toBe(5);
      expect(res.body.data.successful).toBeGreaterThan(0);
      expect(Array.isArray(res.body.data.transactions)).toBe(true);

      // Save first transaction ID for later tests
      if (res.body.data.transactions.length > 0) {
        transactionId = res.body.data.transactions[0].id;
      }

      // Verify AI categorization
      const transactions = res.body.data.transactions;
      transactions.forEach((tx: any) => {
        expect(tx).toHaveProperty('category_id');
        expect(tx).toHaveProperty('ai_confidence');
        expect(tx.ai_confidence).toBeGreaterThan(0);
        expect(tx.ai_confidence).toBeLessThanOrEqual(1);
      });
    });

    test('POST /api/v1/financial/transactions/upload - Duplicate detection', async () => {
      // Upload the same file again
      const res = await request(app)
        .post('/api/v1/financial/transactions/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('account_id', bankAccountId)
        .field('csv_format', 'standard')
        .attach('file', csvFilePath)
        .expect(200);

      // Should detect duplicates
      expect(res.body.data.duplicates).toBeGreaterThan(0);
      expect(res.body.data.successful).toBe(0);
    });
  });

  describe('Transaction Management', () => {
    test('GET /api/v1/financial/transactions - List transactions', async () => {
      const res = await request(app)
        .get('/api/v1/financial/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ account_id: bankAccountId, limit: 10 })
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toHaveProperty('page');
      expect(res.body.meta).toHaveProperty('total');
    });

    test('GET /api/v1/financial/transactions - Filter by type', async () => {
      const res = await request(app)
        .get('/api/v1/financial/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ account_id: bankAccountId, type: 'debit' })
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      res.body.data.forEach((tx: any) => {
        expect(tx.type).toBe('debit');
      });
    });

    test('GET /api/v1/financial/transactions/:id - Get transaction by ID', async () => {
      if (!transactionId) {
        return; // Skip if no transaction created
      }

      const res = await request(app)
        .get(`/api/v1/financial/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.data.id).toBe(transactionId);
      expect(res.body.data).toHaveProperty('description');
      expect(res.body.data).toHaveProperty('amount');
      expect(res.body.data).toHaveProperty('category_name');
    });

    test('PATCH /api/v1/financial/transactions/:id/category - Update category', async () => {
      if (!transactionId) {
        return; // Skip if no transaction created
      }

      // First get available categories
      const categoriesRes = await request(app)
        .get('/api/v1/financial/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const categories = categoriesRes.body.data;
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);

      // Update transaction category
      const newCategoryId = categories[0].id;
      const res = await request(app)
        .patch(`/api/v1/financial/transactions/${transactionId}/category`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          category_id: newCategoryId,
          notes: 'Manually corrected category'
        })
        .expect(200);

      expect(res.body.data.category_id).toBe(newCategoryId);
      expect(res.body.data.notes).toBe('Manually corrected category');
      expect(res.body.data.ai_confidence).toBeNull(); // Should be null after manual override
    });
  });

  describe('Category Management', () => {
    test('GET /api/v1/financial/categories - List all categories', async () => {
      const res = await request(app)
        .get('/api/v1/financial/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      // Verify category structure
      res.body.data.forEach((category: any) => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('type');
        expect(['income', 'expense']).toContain(category.type);
      });
    });
  });

  describe('Error Handling', () => {
    test('POST /api/v1/financial/transactions/upload - No file uploaded', async () => {
      const res = await request(app)
        .post('/api/v1/financial/transactions/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('account_id', bankAccountId)
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });

    test('POST /api/v1/financial/transactions/upload - Invalid account ID', async () => {
      const csvContent = `date,description,amount,type
2024-01-15,Test,100.00,debit`;

      const tempCsvPath = path.join(__dirname, 'temp-invalid.csv');
      fs.writeFileSync(tempCsvPath, csvContent);

      const res = await request(app)
        .post('/api/v1/financial/transactions/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('account_id', '00000000-0000-0000-0000-000000000000')
        .attach('file', tempCsvPath)
        .expect(404);

      expect(res.body).toHaveProperty('error');

      // Cleanup
      fs.unlinkSync(tempCsvPath);
    });

    test('GET /api/v1/financial/transactions/:id - Transaction not found', async () => {
      const res = await request(app)
        .get('/api/v1/financial/transactions/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(res.body).toHaveProperty('error');
    });

    test('DELETE /api/v1/financial/bank-accounts/:id - Cannot delete account with transactions', async () => {
      const res = await request(app)
        .delete(`/api/v1/financial/bank-accounts/${bankAccountId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(res.body).toHaveProperty('error');
      expect(res.body.error.message || res.body.error).toContain('transactions');
    });
  });
});
