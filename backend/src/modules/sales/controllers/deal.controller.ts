/**
 * Deal Controller
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { DealService } from '../services/deal.service';
import { CreateDealDTO, UpdateDealDTO } from '../types/sales.types';
import { AppError, asyncHandler } from '../../../shared/middleware/error-handler';

export class DealController {
  /**
   * Get all deals
   */
  static getAll = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const stage_id = req.query.stage_id as string;
    const company_id = req.query.company_id as string;

    const result = await DealService.getAll(page, limit, stage_id, company_id);

    res.status(200).json(result);
  });

  /**
   * Get deal by ID
   */
  static getById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const deal = await DealService.getById(id);

    res.status(200).json({
      data: deal,
    });
  });

  /**
   * Create new deal
   */
  static create = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors.array());
    }

    const data: CreateDealDTO = req.body;
    const deal = await DealService.create(data);

    res.status(201).json({
      data: deal,
    });
  });

  /**
   * Update deal
   */
  static update = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors.array());
    }

    const { id } = req.params;
    const data: UpdateDealDTO = req.body;
    const deal = await DealService.update(id, data);

    res.status(200).json({
      data: deal,
    });
  });

  /**
   * Delete deal
   */
  static delete = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    await DealService.delete(id);

    res.status(200).json({
      message: 'Deal deleted successfully',
    });
  });

  /**
   * Move deal to stage (for Kanban drag-and-drop)
   */
  static moveToStage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors.array());
    }

    const { id } = req.params;
    const { stage_id } = req.body;
    const deal = await DealService.moveToStage(id, stage_id);

    res.status(200).json({
      data: deal,
      message: 'Deal moved successfully',
    });
  });

  /**
   * Get Kanban board view
   */
  static getKanbanView = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const kanbanData = await DealService.getKanbanView();

    res.status(200).json({
      data: kanbanData,
    });
  });
}
