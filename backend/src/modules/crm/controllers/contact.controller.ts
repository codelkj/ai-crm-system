/**
 * Contact Controller
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ContactService } from '../services/contact.service';
import { CreateContactDTO } from '../types/crm.types';
import { AppError, asyncHandler } from '../../../shared/middleware/error-handler';

export class ContactController {
  /**
   * Get all contacts
   */
  static getAll = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const company_id = req.query.company_id as string;
    const search = req.query.search as string;

    const result = await ContactService.getAll(page, limit, company_id, search);

    res.status(200).json(result);
  });

  /**
   * Get contact by ID
   */
  static getById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const contact = await ContactService.getById(id);

    res.status(200).json({
      data: contact,
    });
  });

  /**
   * Create new contact
   */
  static create = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors.array());
    }

    const data: CreateContactDTO = req.body;
    const contact = await ContactService.create(data);

    res.status(201).json({
      data: contact,
    });
  });

  /**
   * Update contact
   */
  static update = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors.array());
    }

    const { id } = req.params;
    const data: Partial<CreateContactDTO> = req.body;
    const contact = await ContactService.update(id, data);

    res.status(200).json({
      data: contact,
    });
  });

  /**
   * Delete contact
   */
  static delete = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    await ContactService.delete(id);

    res.status(200).json({
      message: 'Contact deleted successfully',
    });
  });
}
