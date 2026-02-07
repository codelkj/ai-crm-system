/**
 * Legal Validators
 */

import { body } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { STORAGE_CONFIG, getStoragePath } from '../../../config/storage';
import { Request } from 'express';

// Multer storage configuration for legal documents
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    // In production, this would ensure the directory exists
    const uploadPath = path.join(STORAGE_CONFIG.basePath, 'legal-documents');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter for legal documents (PDF only)
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (STORAGE_CONFIG.allowedMimeTypes.legal.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Only ${STORAGE_CONFIG.allowedMimeTypes.legal.join(', ')} are allowed.`
      )
    );
  }
};

// Multer upload configuration
export const uploadDocument = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: STORAGE_CONFIG.maxFileSize, // 10MB default
  },
});

// Document upload validators
export const uploadDocumentValidator = [
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Document title is required')
    .isLength({ max: 255 })
    .withMessage('Document title must not exceed 255 characters'),
  body('document_type')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Document type is required')
    .isLength({ max: 100 })
    .withMessage('Document type must not exceed 100 characters'),
  body('company_id').optional().trim().isUUID().withMessage('Invalid company ID format'),
  body('deal_id').optional().trim().isUUID().withMessage('Invalid deal ID format'),
];

// Document creation validators (without file)
export const createDocumentValidator = [
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Document title is required')
    .isLength({ max: 255 })
    .withMessage('Document title must not exceed 255 characters'),
  body('document_type')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Document type is required')
    .isLength({ max: 100 })
    .withMessage('Document type must not exceed 100 characters'),
  body('company_id').optional().trim().isUUID().withMessage('Invalid company ID format'),
  body('deal_id').optional().trim().isUUID().withMessage('Invalid deal ID format'),
  body('file_path')
    .trim()
    .isLength({ min: 1 })
    .withMessage('File path is required'),
  body('file_size')
    .isInt({ min: 1 })
    .withMessage('File size must be a positive integer'),
  body('mime_type')
    .trim()
    .isIn(STORAGE_CONFIG.allowedMimeTypes.legal)
    .withMessage('Invalid MIME type for legal documents'),
];

// Terms search validators
export const searchTermsValidator = [
  body('document_id').optional().trim().isUUID().withMessage('Invalid document ID format'),
  body('term_type')
    .optional()
    .trim()
    .isIn(['party', 'date', 'obligation', 'amount', 'clause'])
    .withMessage('Invalid term type'),
  body('search')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Search query must not exceed 255 characters'),
];
