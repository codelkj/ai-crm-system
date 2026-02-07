/**
 * CRM Validators
 */

import { body } from 'express-validator';

// Company Validators
export const createCompanyValidator = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Company name is required')
    .isLength({ max: 255 })
    .withMessage('Company name must not exceed 255 characters'),
  body('industry')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Industry must not exceed 100 characters'),
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid website URL'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Invalid phone number format'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Address must not exceed 255 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must not exceed 100 characters'),
  body('state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State must not exceed 100 characters'),
  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country must not exceed 100 characters'),
];

export const updateCompanyValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Company name must not be empty')
    .isLength({ max: 255 })
    .withMessage('Company name must not exceed 255 characters'),
  body('industry')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Industry must not exceed 100 characters'),
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid website URL'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Invalid phone number format'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Address must not exceed 255 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must not exceed 100 characters'),
  body('state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State must not exceed 100 characters'),
  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country must not exceed 100 characters'),
];

// Contact Validators
export const createContactValidator = [
  body('company_id')
    .trim()
    .notEmpty()
    .withMessage('Company ID is required')
    .isUUID()
    .withMessage('Invalid company ID format'),
  body('first_name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name is required')
    .isLength({ max: 100 })
    .withMessage('First name must not exceed 100 characters'),
  body('last_name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name is required')
    .isLength({ max: 100 })
    .withMessage('Last name must not exceed 100 characters'),
  body('email')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Invalid phone number format'),
  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Position must not exceed 100 characters'),
  body('is_primary')
    .optional()
    .isBoolean()
    .withMessage('is_primary must be a boolean value'),
];

export const updateContactValidator = [
  body('company_id')
    .optional()
    .trim()
    .isUUID()
    .withMessage('Invalid company ID format'),
  body('first_name')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name must not be empty')
    .isLength({ max: 100 })
    .withMessage('First name must not exceed 100 characters'),
  body('last_name')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name must not be empty')
    .isLength({ max: 100 })
    .withMessage('Last name must not exceed 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Invalid phone number format'),
  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Position must not exceed 100 characters'),
  body('is_primary')
    .optional()
    .isBoolean()
    .withMessage('is_primary must be a boolean value'),
];

// Activity Validators
export const createActivityValidator = [
  body('company_id')
    .trim()
    .notEmpty()
    .withMessage('Company ID is required')
    .isUUID()
    .withMessage('Invalid company ID format'),
  body('contact_id')
    .optional()
    .trim()
    .isUUID()
    .withMessage('Invalid contact ID format'),
  body('deal_id')
    .optional()
    .trim()
    .isUUID()
    .withMessage('Invalid deal ID format'),
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Activity type is required')
    .isIn(['call', 'email', 'meeting', 'note'])
    .withMessage('Activity type must be one of: call, email, meeting, note'),
  body('subject')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Subject is required')
    .isLength({ max: 255 })
    .withMessage('Subject must not exceed 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid due date format (must be ISO 8601)'),
];

export const updateActivityValidator = [
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
  body('deal_id')
    .optional()
    .trim()
    .isUUID()
    .withMessage('Invalid deal ID format'),
  body('type')
    .optional()
    .trim()
    .isIn(['call', 'email', 'meeting', 'note'])
    .withMessage('Activity type must be one of: call, email, meeting, note'),
  body('subject')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Subject must not be empty')
    .isLength({ max: 255 })
    .withMessage('Subject must not exceed 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid due date format (must be ISO 8601)'),
];
