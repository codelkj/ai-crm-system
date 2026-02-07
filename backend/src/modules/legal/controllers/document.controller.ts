/**
 * Document Controller
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { DocumentService } from '../services/document.service';
import { CreateDocumentDTO, DocumentProcessingStatus } from '../types/legal.types';
import { AppError, asyncHandler } from '../../../shared/middleware/error-handler';

export class DocumentController {
  /**
   * @swagger
   * /legal/documents:
   *   get:
   *     summary: Get all legal documents with filtering
   *     tags: [Legal]
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
   *       - in: query
   *         name: deal_id
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [pending, processing, completed, failed]
   *     responses:
   *       200:
   *         description: List of documents
   */
  static getAll = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const company_id = req.query.company_id as string;
    const deal_id = req.query.deal_id as string;
    const status = req.query.status as DocumentProcessingStatus;

    const result = await DocumentService.getAll(page, limit, company_id, deal_id, status);

    res.status(200).json(result);
  });

  /**
   * Get document by ID
   */
  static getById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const includeTerms = req.query.includeTerms === 'true';

    const document = includeTerms
      ? await DocumentService.getByIdWithTerms(id)
      : await DocumentService.getById(id);

    res.status(200).json({
      data: document,
    });
  });

  /**
   * @swagger
   * /legal/documents/upload:
   *   post:
   *     summary: Upload legal document and extract terms with AI
   *     description: Upload a PDF/DOC legal document. The system will automatically extract key terms, dates, and obligations using AI.
   *     tags: [Legal]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - file
   *               - title
   *               - document_type
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *                 description: Legal document file (PDF, DOC, DOCX)
   *               title:
   *                 type: string
   *                 example: Master Services Agreement
   *               document_type:
   *                 type: string
   *                 enum: [contract, nda, proposal, invoice, other]
   *                 example: contract
   *               company_id:
   *                 type: string
   *                 format: uuid
   *               deal_id:
   *                 type: string
   *                 format: uuid
   *     responses:
   *       201:
   *         description: Document uploaded and processed successfully
   *       400:
   *         description: Validation error or no file uploaded
   */
  static upload = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors.array());
    }

    // Check if file was uploaded
    if (!req.file) {
      throw new AppError(400, 'No file uploaded', 'NO_FILE');
    }

    const data: CreateDocumentDTO = {
      title: req.body.title,
      document_type: req.body.document_type,
      company_id: req.body.company_id,
      deal_id: req.body.deal_id,
    };

    // Get uploaded user from JWT token
    const uploadedBy = (req as any).user?.email || 'unknown@example.com';

    const document = await DocumentService.create(
      data,
      req.file.path,
      req.file.size,
      req.file.mimetype,
      uploadedBy
    );

    // Automatically trigger processing
    const processedDocument = await DocumentService.processDocument(document.id);

    res.status(201).json({
      data: processedDocument,
      message: 'Document uploaded and processed successfully',
    });
  });

  /**
   * Create document (without file upload - for testing)
   */
  static create = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors.array());
    }

    const data: CreateDocumentDTO = {
      title: req.body.title,
      document_type: req.body.document_type,
      company_id: req.body.company_id,
      deal_id: req.body.deal_id,
    };

    const uploadedBy = (req as any).user?.email || 'unknown@example.com';

    const document = await DocumentService.create(
      data,
      req.body.file_path,
      req.body.file_size,
      req.body.mime_type,
      uploadedBy
    );

    res.status(201).json({
      data: document,
    });
  });

  /**
   * Delete document
   */
  static delete = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    await DocumentService.delete(id);

    res.status(200).json({
      message: 'Document deleted successfully',
    });
  });

  /**
   * @swagger
   * /legal/documents/{id}/reprocess:
   *   post:
   *     summary: Reprocess document with AI term extraction
   *     description: Trigger AI to re-extract terms from an existing document
   *     tags: [Legal]
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
   *         description: Document reprocessed successfully
   *       404:
   *         description: Document not found
   */
  static reprocess = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const document = await DocumentService.processDocument(id);

    res.status(200).json({
      data: document,
      message: 'Document reprocessed successfully',
    });
  });

  /**
   * @swagger
   * /legal/stats:
   *   get:
   *     summary: Get document processing statistics
   *     description: Get stats on document processing status, types, and counts
   *     tags: [Legal]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Processing statistics
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     total_documents:
   *                       type: integer
   *                     by_status:
   *                       type: object
   *                     by_type:
   *                       type: object
   */
  static getStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await DocumentService.getProcessingStats();

    res.status(200).json({
      data: stats,
    });
  });
}
