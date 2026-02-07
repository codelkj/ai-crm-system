/**
 * Legal Routes
 */

import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { TermsController } from '../controllers/terms.controller';
import {
  uploadDocument,
  uploadDocumentValidator,
  createDocumentValidator,
} from '../validators/legal.validators';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();

// Apply authentication middleware to all legal routes
router.use(authenticate);

// Document Routes
router.get('/documents', DocumentController.getAll);
router.get('/documents/stats', DocumentController.getStats);
router.get('/documents/:id', DocumentController.getById);
router.post(
  '/documents',
  uploadDocument.single('file'),
  uploadDocumentValidator,
  DocumentController.upload
);
router.post('/documents/create', createDocumentValidator, DocumentController.create);
router.delete('/documents/:id', DocumentController.delete);
router.post('/documents/:id/reprocess', DocumentController.reprocess);

// Terms Routes
router.get('/documents/:documentId/terms', TermsController.getByDocumentId);
router.get('/documents/:documentId/terms/grouped', TermsController.getGroupedByType);
router.get('/terms/search', TermsController.search);
router.get('/terms/statistics', TermsController.getStatistics);
router.get('/terms/low-confidence', TermsController.getLowConfidence);

export default router;
