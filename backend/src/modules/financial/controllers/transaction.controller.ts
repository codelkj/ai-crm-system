/**
 * Transaction Controller
 * Handles HTTP requests for transaction operations
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { TransactionService } from '../services/transaction.service';
import { CategorizationService } from '../services/categorization.service';
import { TransactionFilters, UpdateTransactionCategoryDTO } from '../types/financial.types';
import { AppError, asyncHandler } from '../../../shared/middleware/error-handler';

export class TransactionController {
  /**
   * Upload and process CSV file
   */
  static uploadCSV = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors.array());
    }

    // Check if file was uploaded
    if (!req.file) {
      throw new AppError(400, 'No file uploaded', 'NO_FILE');
    }

    const { account_id, csv_format } = req.body;
    const filePath = req.file.path;

    // Process CSV upload
    const result = await TransactionService.processCSVUpload(filePath, account_id, {
      format: csv_format
    });

    res.status(200).json({
      message: 'Transactions processed successfully',
      data: result
    });
  });

  /**
   * Get all transactions with filtering and pagination
   */
  static getAll = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors.array());
    }

    const filters: TransactionFilters = {
      account_id: req.query.account_id as string,
      type: req.query.type as 'debit' | 'credit',
      category_id: req.query.category_id as string,
      date_from: req.query.date_from as string,
      date_to: req.query.date_to as string,
      min_amount: req.query.min_amount ? parseFloat(req.query.min_amount as string) : undefined,
      max_amount: req.query.max_amount ? parseFloat(req.query.max_amount as string) : undefined,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20
    };

    const result = await TransactionService.getAll(filters);

    res.status(200).json(result);
  });

  /**
   * Get transaction by ID
   */
  static getById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const transaction = await TransactionService.getById(id);

    res.status(200).json({
      data: transaction
    });
  });

  /**
   * Update transaction category (manual override)
   */
  static updateCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors.array());
    }

    const { id } = req.params;
    const data: UpdateTransactionCategoryDTO = req.body;

    const transaction = await TransactionService.updateCategory(id, data);

    res.status(200).json({
      message: 'Transaction category updated successfully',
      data: transaction
    });
  });

  /**
   * Get all available categories
   */
  static getCategories = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const categories = await CategorizationService.getAllCategories();

    res.status(200).json({
      data: categories
    });
  });
}
