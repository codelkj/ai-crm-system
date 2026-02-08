/**
 * AI Insights Routes
 * All AI-powered analysis endpoints
 */

import express from 'express';
import { authenticate, authorizePermission } from '../../../shared/middleware/authenticate';
import aiInsightsController from '../controllers/ai-insights.controller';

const router = express.Router();

// =====================================================
// INTAKE CLASSIFICATION
// =====================================================

// Classify legal inquiry
router.post(
  '/intake/classify',
  authenticate,
  authorizePermission('matters', 'create'),
  aiInsightsController.classifyIntake
);

// Apply classification to matter
router.post(
  '/intake/apply/:matterId',
  authenticate,
  authorizePermission('matters', 'update'),
  aiInsightsController.applyClassificationToMatter
);

// Get classification history
router.get(
  '/intake/history',
  authenticate,
  authorizePermission('matters', 'read'),
  aiInsightsController.getClassificationHistory
);

// =====================================================
// FICA COMPLIANCE
// =====================================================

// Detect FICA gaps for a client
router.get(
  '/fica/gaps/:clientId',
  authenticate,
  authorizePermission('companies', 'read'),
  aiInsightsController.detectFICAGaps
);

// Get firm FICA compliance summary
router.get(
  '/fica/compliance-summary',
  authenticate,
  authorizePermission('companies', 'read'),
  aiInsightsController.getFirmFICACompliance
);

// Batch analyze FICA compliance
router.post(
  '/fica/batch-analyze',
  authenticate,
  authorizePermission('companies', 'read'),
  aiInsightsController.batchAnalyzeFICA
);

// =====================================================
// DOCUMENT SUMMARIZATION
// =====================================================

// Summarize a document
router.get(
  '/documents/summarize/:documentId',
  authenticate,
  authorizePermission('legal_documents', 'read'),
  aiInsightsController.summarizeDocument
);

// Batch summarize documents
router.post(
  '/documents/batch-summarize',
  authenticate,
  authorizePermission('legal_documents', 'read'),
  aiInsightsController.batchSummarizeDocuments
);

// Get document processing stats
router.get(
  '/documents/processing-stats',
  authenticate,
  authorizePermission('legal_documents', 'read'),
  aiInsightsController.getDocumentProcessingStats
);

// =====================================================
// CONTRACT ANALYSIS
// =====================================================

// Analyze a contract
router.get(
  '/contracts/analyze/:documentId',
  authenticate,
  authorizePermission('legal_documents', 'read'),
  aiInsightsController.analyzeContract
);

// Batch analyze contracts
router.post(
  '/contracts/batch-analyze',
  authenticate,
  authorizePermission('legal_documents', 'read'),
  aiInsightsController.batchAnalyzeContracts
);

// Get high-risk contracts
router.get(
  '/contracts/high-risk',
  authenticate,
  authorizePermission('legal_documents', 'read'),
  aiInsightsController.getHighRiskContracts
);

// Compare two contracts
router.post(
  '/contracts/compare',
  authenticate,
  authorizePermission('legal_documents', 'read'),
  aiInsightsController.compareContracts
);

// =====================================================
// GENERAL AI INSIGHTS
// =====================================================

// Get all AI insights for an entity
router.get(
  '/insights/:entityType/:entityId',
  authenticate,
  aiInsightsController.getEntityInsights
);

// Get recent AI insights
router.get(
  '/insights/recent',
  authenticate,
  aiInsightsController.getRecentInsights
);

export default router;
