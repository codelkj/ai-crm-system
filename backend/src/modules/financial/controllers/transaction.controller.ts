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
   * @swagger
   * /financial/transactions/upload:
   *   post:
   *     summary: Upload CSV file and categorize transactions with AI
   *     description: Upload a CSV file containing bank transactions. The system will parse the file, detect duplicates, and use AI to categorize each transaction automatically.
   *     tags: [Financial]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - file
   *               - account_id
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *                 description: CSV file containing transactions (max 10MB)
   *               account_id:
   *                 type: string
   *                 format: uuid
   *                 description: ID of the bank account these transactions belong to
   *               csv_format:
   *                 type: string
   *                 enum: [standard, chase, bofa]
   *                 description: CSV format type (optional - will auto-detect if not specified)
   *     responses:
   *       200:
   *         description: Transactions processed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Transactions processed successfully
   *                 data:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                       example: 50
   *                     successful:
   *                       type: integer
   *                       example: 48
   *                     failed:
   *                       type: integer
   *                       example: 2
   *                     duplicates:
   *                       type: integer
   *                       example: 5
   *       400:
   *         description: Validation error or no file uploaded
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized
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
   * @swagger
   * /financial/transactions:
   *   get:
   *     summary: Get all transactions with filtering and pagination
   *     tags: [Financial]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: account_id
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [debit, credit]
   *       - in: query
   *         name: category_id
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: date_from
   *         schema:
   *           type: string
   *           format: date
   *       - in: query
   *         name: date_to
   *         schema:
   *           type: string
   *           format: date
   *       - in: query
   *         name: min_amount
   *         schema:
   *           type: number
   *       - in: query
   *         name: max_amount
   *         schema:
   *           type: number
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *     responses:
   *       200:
   *         description: List of transactions
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Transaction'
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                     page:
   *                       type: integer
   *                     limit:
   *                       type: integer
   *                     pages:
   *                       type: integer
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
   * @swagger
   * /financial/transactions/{id}:
   *   get:
   *     summary: Get transaction by ID
   *     tags: [Financial]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Transaction details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/Transaction'
   *       404:
   *         description: Transaction not found
   */
  static getById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const transaction = await TransactionService.getById(id);

    res.status(200).json({
      data: transaction
    });
  });

  /**
   * @swagger
   * /financial/transactions/{id}/category:
   *   patch:
   *     summary: Update transaction category (manual override)
   *     description: Override the AI-assigned category with a manual selection
   *     tags: [Financial]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - category_id
   *             properties:
   *               category_id:
   *                 type: string
   *                 format: uuid
   *                 description: New category ID
   *               notes:
   *                 type: string
   *                 description: Optional notes about the override
   *     responses:
   *       200:
   *         description: Category updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 data:
   *                   $ref: '#/components/schemas/Transaction'
   *       404:
   *         description: Transaction not found
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
   * @swagger
   * /financial/categories:
   *   get:
   *     summary: Get all available transaction categories
   *     tags: [Financial]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: List of all categories
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Category'
   */
  static getCategories = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const categories = await CategorizationService.getAllCategories();

    res.status(200).json({
      data: categories
    });
  });
}
