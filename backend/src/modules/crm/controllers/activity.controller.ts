/**
 * Activity Controller
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ActivityService } from '../services/activity.service';
import { CreateActivityDTO } from '../types/crm.types';
import { AppError, asyncHandler } from '../../../shared/middleware/error-handler';

export class ActivityController {
  /**
   * Get all activities
   */
  static getAll = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const company_id = req.query.company_id as string;
    const contact_id = req.query.contact_id as string;
    const deal_id = req.query.deal_id as string;
    const type = req.query.type as 'call' | 'email' | 'meeting' | 'note' | undefined;

    const result = await ActivityService.getAll(page, limit, company_id, contact_id, deal_id, type);

    res.status(200).json(result);
  });

  /**
   * Get activity by ID
   */
  static getById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const activity = await ActivityService.getById(id);

    res.status(200).json({
      data: activity,
    });
  });

  /**
   * Create new activity
   */
  static create = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors.array());
    }

    const data: CreateActivityDTO = req.body;
    const activity = await ActivityService.create(data);

    res.status(201).json({
      data: activity,
    });
  });

  /**
   * Update activity
   */
  static update = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors.array());
    }

    const { id } = req.params;
    const data: Partial<CreateActivityDTO> = req.body;
    const activity = await ActivityService.update(id, data);

    res.status(200).json({
      data: activity,
    });
  });

  /**
   * Delete activity
   */
  static delete = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    await ActivityService.delete(id);

    res.status(200).json({
      message: 'Activity deleted successfully',
    });
  });

  /**
   * Mark activity as completed
   */
  static markCompleted = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const activity = await ActivityService.markCompleted(id);

    res.status(200).json({
      data: activity,
    });
  });
}
