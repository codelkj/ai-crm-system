/**
 * Terms Controller
 */

import { Request, Response, NextFunction } from 'express';
import { TermsService } from '../services/terms.service';
import { SearchTermsQuery } from '../types/legal.types';
import { asyncHandler } from '../../../shared/middleware/error-handler';

export class TermsController {
  /**
   * Get all terms for a specific document
   */
  static getByDocumentId = asyncHandler(async (req: Request, res: Response) => {
    const { documentId } = req.params;
    const terms = await TermsService.getByDocumentId(documentId);

    res.status(200).json({
      data: terms,
      meta: {
        total: terms.length,
      },
    });
  });

  /**
   * Get terms grouped by type for a document
   */
  static getGroupedByType = asyncHandler(
    async (req: Request, res: Response) => {
      const { documentId } = req.params;
      const grouped = await TermsService.getGroupedByType(documentId);

      res.status(200).json({
        data: grouped,
      });
    }
  );

  /**
   * Search terms
   */
  static search = asyncHandler(async (req: Request, res: Response) => {
    const query: SearchTermsQuery = {
      document_id: req.query.document_id as string,
      term_type: req.query.term_type as string,
      search: req.query.search as string,
    };

    const terms = await TermsService.search(query);

    res.status(200).json({
      data: terms,
      meta: {
        total: terms.length,
      },
    });
  });

  /**
   * Get terms statistics
   */
  static getStatistics = asyncHandler(async (req: Request, res: Response) => {
    const documentId = req.query.document_id as string;
    const stats = await TermsService.getStatistics(documentId);

    res.status(200).json({
      data: stats,
    });
  });

  /**
   * Get low confidence terms (for review)
   */
  static getLowConfidence = asyncHandler(
    async (req: Request, res: Response) => {
      const documentId = req.query.document_id as string;
      const threshold = parseFloat(req.query.threshold as string) || 0.9;

      const terms = await TermsService.getLowConfidenceTerms(documentId, threshold);

      res.status(200).json({
        data: terms,
        meta: {
          total: terms.length,
          threshold,
        },
      });
    }
  );
}
