/**
 * Company Controller
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { CompanyService } from '../services/company.service';
import { CreateCompanyDTO } from '../types/crm.types';
import { AppError, asyncHandler } from '../../../shared/middleware/error-handler';
import { AuthRequest } from '../../../shared/middleware/authenticate';

export class CompanyController {
  /**
   * @swagger
   * /crm/companies:
   *   get:
   *     summary: Get all companies with pagination and search
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
   *         name: search
   *         schema:
   *           type: string
   *           description: Search by company name
   *     responses:
   *       200:
   *         description: List of companies
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                 pagination:
   *                   type: object
   */
  static getAll = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const firmId = req.user?.firm_id;
    if (!firmId) {
      throw new AppError(400, 'User not associated with any firm', 'NO_FIRM');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;

    let result;
    if (search) {
      result = await CompanyService.search(firmId, search, page, limit);
    } else {
      result = await CompanyService.getAll(firmId, page, limit);
    }

    res.status(200).json(result);
  });

  /**
   * @swagger
   * /crm/companies/{id}:
   *   get:
   *     summary: Get company by ID
   *     tags: [CRM]
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
   *         description: Company details
   *       404:
   *         description: Company not found
   */
  static getById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const company = await CompanyService.getById(id);

    res.status(200).json({
      data: company,
    });
  });

  /**
   * @swagger
   * /crm/companies:
   *   post:
   *     summary: Create a new company
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
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *                 example: Acme Corporation
   *               industry:
   *                 type: string
   *                 example: Technology
   *               website:
   *                 type: string
   *                 example: https://acme.com
   *               phone:
   *                 type: string
   *                 example: "+1234567890"
   *               email:
   *                 type: string
   *                 example: contact@acme.com
   *               address:
   *                 type: string
   *     responses:
   *       201:
   *         description: Company created successfully
   *       400:
   *         description: Validation error
   */
  static create = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors.array());
    }

    const firmId = req.user?.firm_id;
    if (!firmId) {
      throw new AppError(400, 'User not associated with any firm', 'NO_FIRM');
    }

    const data: CreateCompanyDTO = req.body;
    const company = await CompanyService.create({ ...data, firm_id: firmId });

    res.status(201).json({
      data: company,
    });
  });

  /**
   * @swagger
   * /crm/companies/{id}:
   *   put:
   *     summary: Update company information
   *     tags: [CRM]
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
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               industry:
   *                 type: string
   *               website:
   *                 type: string
   *               phone:
   *                 type: string
   *               email:
   *                 type: string
   *               address:
   *                 type: string
   *     responses:
   *       200:
   *         description: Company updated successfully
   *       404:
   *         description: Company not found
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
   * @swagger
   * /crm/companies/{id}:
   *   delete:
   *     summary: Delete a company
   *     tags: [CRM]
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
   *         description: Company deleted successfully
   *       404:
   *         description: Company not found
   */
  static delete = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    await CompanyService.delete(id);

    res.status(200).json({
      message: 'Company deleted successfully',
    });
  });
}
