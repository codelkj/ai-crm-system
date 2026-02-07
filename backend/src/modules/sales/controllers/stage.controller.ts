/**
 * Pipeline Stage Controller
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { PipelineStageService } from '../services/stage.service';
import { CreatePipelineStageDTO, UpdatePipelineStageDTO } from '../types/sales.types';
import { AppError, asyncHandler } from '../../../shared/middleware/error-handler';

export class PipelineStageController {
  /**
   * Get all pipeline stages
   */
  static getAll = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const stages = await PipelineStageService.getAll();

    res.status(200).json({
      data: stages,
    });
  });

  /**
   * Get pipeline stage by ID
   */
  static getById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const stage = await PipelineStageService.getById(id);

    res.status(200).json({
      data: stage,
    });
  });

  /**
   * Create new pipeline stage
   */
  static create = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors.array());
    }

    const data: CreatePipelineStageDTO = req.body;
    const stage = await PipelineStageService.create(data);

    res.status(201).json({
      data: stage,
    });
  });

  /**
   * Update pipeline stage
   */
  static update = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors.array());
    }

    const { id } = req.params;
    const data: UpdatePipelineStageDTO = req.body;
    const stage = await PipelineStageService.update(id, data);

    res.status(200).json({
      data: stage,
    });
  });

  /**
   * Delete pipeline stage
   */
  static delete = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    await PipelineStageService.delete(id);

    res.status(200).json({
      message: 'Pipeline stage deleted successfully',
    });
  });

  /**
   * Reorder pipeline stages
   */
  static reorder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors.array());
    }

    const { stages } = req.body;
    const reorderedStages = await PipelineStageService.reorder(stages);

    res.status(200).json({
      data: reorderedStages,
      message: 'Pipeline stages reordered successfully',
    });
  });
}
