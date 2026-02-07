/**
 * Financial Module Validators
 */

import { body, query, ValidationChain } from 'express-validator';

// Bank Account Validators
export const createBankAccountValidators: ValidationChain[] = [
  body('account_name')
    .trim()
    .notEmpty()
    .withMessage('Account name is required')
    .isLength({ max: 100 })
    .withMessage('Account name must not exceed 100 characters'),

  body('account_number')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Account number must not exceed 50 characters'),

  body('bank_name')
    .trim()
    .notEmpty()
    .withMessage('Bank name is required')
    .isLength({ max: 100 })
    .withMessage('Bank name must not exceed 100 characters'),

  body('account_type')
    .notEmpty()
    .withMessage('Account type is required')
    .isIn(['checking', 'savings', 'credit_card', 'investment', 'other'])
    .withMessage('Invalid account type'),

  body('currency')
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code (e.g., USD)')
];

// CSV Upload Validators
export const csvUploadValidators: ValidationChain[] = [
  body('account_id')
    .trim()
    .notEmpty()
    .withMessage('Account ID is required')
    .isUUID()
    .withMessage('Account ID must be a valid UUID'),

  body('csv_format')
    .optional()
    .isIn(['standard', 'chase', 'bank_of_america', 'custom'])
    .withMessage('Invalid CSV format')
];

// Transaction Query Validators
export const getTransactionsValidators: ValidationChain[] = [
  query('account_id')
    .optional()
    .trim()
    .isUUID()
    .withMessage('Account ID must be a valid UUID'),

  query('type')
    .optional()
    .isIn(['debit', 'credit'])
    .withMessage('Type must be either debit or credit'),

  query('category_id')
    .optional()
    .trim()
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),

  query('date_from')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid ISO 8601 date'),

  query('date_to')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid ISO 8601 date'),

  query('min_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min amount must be a positive number'),

  query('max_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max amount must be a positive number'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Search term must not exceed 200 characters'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Update Transaction Category Validators
export const updateCategoryValidators: ValidationChain[] = [
  body('category_id')
    .trim()
    .notEmpty()
    .withMessage('Category ID is required')
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
];

// UUID Parameter Validators
export const uuidParamValidator: ValidationChain[] = [
  query('id')
    .optional()
    .trim()
    .isUUID()
    .withMessage('ID must be a valid UUID')
];
