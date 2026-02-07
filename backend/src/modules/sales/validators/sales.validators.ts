/**
 * Sales Validators
 */

import { body } from 'express-validator';

// Deal Validators
export const createDealValidator = [
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Deal title is required')
    .isLength({ max: 255 })
    .withMessage('Deal title must not exceed 255 characters'),
  body('company_id')
    .trim()
    .notEmpty()
    .withMessage('Company ID is required')
    .isUUID()
    .withMessage('Invalid company ID format'),
  body('contact_id')
    .trim()
    .notEmpty()
    .withMessage('Contact ID is required')
    .isUUID()
    .withMessage('Invalid contact ID format'),
  body('stage_id')
    .trim()
    .notEmpty()
    .withMessage('Stage ID is required')
    .isUUID()
    .withMessage('Invalid stage ID format'),
  body('value')
    .isNumeric()
    .withMessage('Deal value must be a number')
    .isFloat({ min: 0 })
    .withMessage('Deal value must be positive'),
  body('currency')
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code (e.g., USD)')
    .isUppercase()
    .withMessage('Currency code must be uppercase'),
  body('probability')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Probability must be between 0 and 100'),
  body('expected_close_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid expected close date format (must be ISO 8601)'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
];

export const updateDealValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Deal title must not be empty')
    .isLength({ max: 255 })
    .withMessage('Deal title must not exceed 255 characters'),
  body('company_id')
    .optional()
    .trim()
    .isUUID()
    .withMessage('Invalid company ID format'),
  body('contact_id')
    .optional()
    .trim()
    .isUUID()
    .withMessage('Invalid contact ID format'),
  body('stage_id')
    .optional()
    .trim()
    .isUUID()
    .withMessage('Invalid stage ID format'),
  body('value')
    .optional()
    .isNumeric()
    .withMessage('Deal value must be a number')
    .isFloat({ min: 0 })
    .withMessage('Deal value must be positive'),
  body('currency')
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code (e.g., USD)')
    .isUppercase()
    .withMessage('Currency code must be uppercase'),
  body('probability')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Probability must be between 0 and 100'),
  body('expected_close_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid expected close date format (must be ISO 8601)'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
];

export const moveToStageValidator = [
  body('stage_id')
    .trim()
    .notEmpty()
    .withMessage('Stage ID is required')
    .isUUID()
    .withMessage('Invalid stage ID format'),
];

// Pipeline Stage Validators
export const createStageValidator = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Stage name is required')
    .isLength({ max: 100 })
    .withMessage('Stage name must not exceed 100 characters'),
  body('color')
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color must be a valid hex color code (e.g., #FF5733)'),
  body('order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),
];

export const updateStageValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Stage name must not be empty')
    .isLength({ max: 100 })
    .withMessage('Stage name must not exceed 100 characters'),
  body('color')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color must be a valid hex color code (e.g., #FF5733)'),
  body('order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),
];

export const reorderStagesValidator = [
  body('stages')
    .isArray({ min: 1 })
    .withMessage('Stages array is required and must contain at least one stage'),
  body('stages.*.id')
    .trim()
    .notEmpty()
    .withMessage('Stage ID is required')
    .isUUID()
    .withMessage('Invalid stage ID format'),
  body('stages.*.order')
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),
];
