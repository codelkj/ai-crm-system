/**
 * Company Controller
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { CompanyService } from '../services/company.service';
import { CreateCompanyDTO } from '../types/crm.types';
import { AppError, asyncHandler } from '../../../shared/middleware/error-handler';

export class CompanyController {
  /**
   * Get all companies
   */
  static getAll = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;

    const result = await CompanyService.getAll(page, limit, search);

    res.status(200).json(result);
  });

  /**
   * Get company by ID
   */
  static getById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const company = await CompanyService.getById(id);

    res.status(200).json({
      data: company,
    });
  });

  /**
   * Create new company
   */
  static create = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors.array());
    }

    const data: CreateCompanyDTO = req.body;
    const company = await CompanyService.create(data);

    res.status(201).json({
      data: company,
    });
  });

  /**
   * Update company
   */
  static update = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors.array());
    }

    const { id } = req.params;
    const data: Partial<CreateCompanyDTO> = req.body;
    const company = await CompanyService.update(id, data);

    res.status(200).json({
      data: company,
    });
  });

  /**
   * Delete company
   */
  static delete = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    await CompanyService.delete(id);

    res.status(200).json({
      message: 'Company deleted successfully',
    });
  });
}
