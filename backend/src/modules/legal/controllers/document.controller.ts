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
   * Get all documents
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
   * Upload and create new document
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
   * Reprocess document (trigger AI extraction again)
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
   * Get processing statistics
   */
  static getStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await DocumentService.getProcessingStats();

    res.status(200).json({
      data: stats,
    });
  });
}
