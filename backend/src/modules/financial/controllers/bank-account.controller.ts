/**
 * Bank Account Controller
 * Handles HTTP requests for bank account operations
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { BankAccountService } from '../services/bank-account.service';
import { CreateBankAccountDTO } from '../types/financial.types';
import { AppError, asyncHandler } from '../../../shared/middleware/error-handler';

export class BankAccountController {
  /**
   * @swagger
   * /financial/bank-accounts:
   *   post:
   *     summary: Create a new bank account
   *     tags: [Financial]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - account_name
   *               - account_number
   *               - bank_name
   *               - account_type
   *             properties:
   *               account_name:
   *                 type: string
   *                 example: Business Checking
   *               account_number:
   *                 type: string
   *                 example: "1234567890"
   *               bank_name:
   *                 type: string
   *                 example: Chase Bank
   *               account_type:
   *                 type: string
   *                 enum: [checking, savings, credit_card, investment, other]
   *               currency:
   *                 type: string
   *                 default: USD
   *     responses:
   *       201:
   *         description: Bank account created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 data:
   *                   $ref: '#/components/schemas/BankAccount'
   *       400:
   *         description: Validation error
   */
  static create = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors.array());
    }

    const data: CreateBankAccountDTO = req.body;
    const account = await BankAccountService.create(data);

    res.status(201).json({
      message: 'Bank account created successfully',
      data: account,
    });
  });

  /**
   * @swagger
   * /financial/bank-accounts:
   *   get:
   *     summary: Get all bank accounts
   *     tags: [Financial]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: List of all bank accounts
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/BankAccount'
   */
  static getAll = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const accounts = await BankAccountService.getAll();

    res.status(200).json({
      data: accounts,
    });
  });

  /**
   * @swagger
   * /financial/bank-accounts/{id}:
   *   get:
   *     summary: Get bank account by ID
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
   *         description: Bank account details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/BankAccount'
   *       404:
   *         description: Bank account not found
   */
  static getById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const account = await BankAccountService.getById(id);

    res.status(200).json({
      data: account,
    });
  });

  /**
   * @swagger
   * /financial/bank-accounts/{id}:
   *   delete:
   *     summary: Delete bank account
   *     description: Delete a bank account. Note - this will fail if the account has associated transactions.
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
   *         description: Bank account deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       400:
   *         description: Cannot delete account with transactions
   *       404:
   *         description: Bank account not found
   */
  static delete = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    await BankAccountService.delete(id);

    res.status(200).json({
      message: 'Bank account deleted successfully',
    });
  });
}
