/**
 * Financial Module Routes
 * Defines all API endpoints for bank accounts, transactions, and categories
 */

import { Router } from 'express';
import { BankAccountController } from '../controllers/bank-account.controller';
import { TransactionController } from '../controllers/transaction.controller';
import { ProjectionController } from '../controllers/projection.controller';
import {
  createBankAccountValidators,
  csvUploadValidators,
  getTransactionsValidators,
  updateCategoryValidators
} from '../validators/financial.validators';
import { uploadCSV } from '../middleware/csv-upload.middleware';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// ============= Bank Account Routes =============
/**
 * POST /api/v1/financial/bank-accounts
 * Create new bank account
 */
router.post(
  '/bank-accounts',
  createBankAccountValidators,
  BankAccountController.create
);

/**
 * GET /api/v1/financial/bank-accounts
 * Get all bank accounts
 */
router.get(
  '/bank-accounts',
  BankAccountController.getAll
);

/**
 * GET /api/v1/financial/bank-accounts/:id
 * Get bank account by ID
 */
router.get(
  '/bank-accounts/:id',
  BankAccountController.getById
);

/**
 * DELETE /api/v1/financial/bank-accounts/:id
 * Delete bank account
 */
router.delete(
  '/bank-accounts/:id',
  BankAccountController.delete
);

// ============= Transaction Routes =============
/**
 * POST /api/v1/financial/transactions/upload
 * Upload and process CSV file
 */
router.post(
  '/transactions/upload',
  uploadCSV,
  csvUploadValidators,
  TransactionController.uploadCSV
);

/**
 * GET /api/v1/financial/transactions
 * Get all transactions with filtering and pagination
 */
router.get(
  '/transactions',
  getTransactionsValidators,
  TransactionController.getAll
);

/**
 * GET /api/v1/financial/transactions/:id
 * Get transaction by ID
 */
router.get(
  '/transactions/:id',
  TransactionController.getById
);

/**
 * PATCH /api/v1/financial/transactions/:id/category
 * Update transaction category (manual override)
 */
router.patch(
  '/transactions/:id/category',
  updateCategoryValidators,
  TransactionController.updateCategory
);

// ============= Category Routes =============
/**
 * GET /api/v1/financial/categories
 * Get all available categories
 */
router.get(
  '/categories',
  TransactionController.getCategories
);

// ============= Projection Routes =============
/**
 * POST /api/v1/financial/projections/generate
 * Generate cash flow projection with seasonal adjustments
 */
router.post(
  '/projections/generate',
  ProjectionController.generateProjection
);

/**
 * GET /api/v1/financial/projections/seasonal-patterns
 * Detect seasonal patterns in transaction data
 */
router.get(
  '/projections/seasonal-patterns',
  ProjectionController.detectSeasonalPatterns
);

/**
 * GET /api/v1/financial/projections
 * Get all saved projections
 */
router.get(
  '/projections',
  ProjectionController.getAll
);

export default router;
