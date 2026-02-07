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
   * @swagger
   * /sales/deals:
   *   get:
   *     summary: Get all sales deals with filtering
   *     tags: [Sales]
   *     security:
   *       - BearerAuth: []
   *     parameters:
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
   *       - in: query
   *         name: stage_id
   *         schema:
   *           type: string
   *           format: uuid
   *           description: Filter by pipeline stage
   *       - in: query
   *         name: company_id
   *         schema:
   *           type: string
   *           format: uuid
   *           description: Filter by company
   *     responses:
   *       200:
   *         description: List of deals
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
   * @swagger
   * /sales/deals:
   *   post:
   *     summary: Create a new sales deal
   *     tags: [Sales]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - value
   *               - stage_id
   *             properties:
   *               title:
   *                 type: string
   *                 example: Enterprise Software Deal
   *               value:
   *                 type: number
   *                 example: 50000
   *               stage_id:
   *                 type: string
   *                 format: uuid
   *               company_id:
   *                 type: string
   *                 format: uuid
   *               contact_id:
   *                 type: string
   *                 format: uuid
   *               expected_close_date:
   *                 type: string
   *                 format: date
   *               notes:
   *                 type: string
   *     responses:
   *       201:
   *         description: Deal created successfully
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
   * @swagger
   * /sales/deals/{id}/move:
   *   patch:
   *     summary: Move deal to different pipeline stage (Kanban)
   *     tags: [Sales]
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
   *               - stage_id
   *             properties:
   *               stage_id:
   *                 type: string
   *                 format: uuid
   *                 description: Target pipeline stage
   *     responses:
   *       200:
   *         description: Deal moved successfully
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
   * @swagger
   * /sales/kanban:
   *   get:
   *     summary: Get Kanban board view of all deals by stage
   *     tags: [Sales]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Kanban board with deals grouped by stage
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       stage_id:
   *                         type: string
   *                       stage_name:
   *                         type: string
   *                       deals:
   *                         type: array
   */
  static getKanbanView = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const kanbanData = await DealService.getKanbanView();

    res.status(200).json({
      data: kanbanData,
    });
  });
}
