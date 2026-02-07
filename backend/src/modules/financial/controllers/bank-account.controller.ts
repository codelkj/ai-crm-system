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
   * Create new bank account
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
   * Get all bank accounts
   */
  static getAll = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const accounts = await BankAccountService.getAll();

    res.status(200).json({
      data: accounts,
    });
  });

  /**
   * Get bank account by ID
   */
  static getById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const account = await BankAccountService.getById(id);

    res.status(200).json({
      data: account,
    });
  });

  /**
   * Delete bank account
   */
  static delete = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    await BankAccountService.delete(id);

    res.status(200).json({
      message: 'Bank account deleted successfully',
    });
  });
}
