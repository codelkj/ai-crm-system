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
   * @swagger
   * /crm/contacts:
   *   get:
   *     summary: Get all contacts with filtering and pagination
   *     tags: [CRM]
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
   *         name: company_id
   *         schema:
   *           type: string
   *           format: uuid
   *           description: Filter by company
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *           description: Search by name or email
   *     responses:
   *       200:
   *         description: List of contacts
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
   * @swagger
   * /crm/contacts:
   *   post:
   *     summary: Create a new contact
   *     tags: [CRM]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - first_name
   *               - last_name
   *               - email
   *             properties:
   *               first_name:
   *                 type: string
   *                 example: John
   *               last_name:
   *                 type: string
   *                 example: Doe
   *               email:
   *                 type: string
   *                 example: john.doe@example.com
   *               phone:
   *                 type: string
   *                 example: "+1234567890"
   *               company_id:
   *                 type: string
   *                 format: uuid
   *               position:
   *                 type: string
   *                 example: Sales Manager
   *     responses:
   *       201:
   *         description: Contact created successfully
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
