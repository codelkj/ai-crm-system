/**
 * LegalNexus Reporting Routes
 */

import express from 'express';
import { authenticate } from '../../../shared/middleware/authenticate';
import reportingController from '../controllers/reporting.controller';

const router = express.Router();

// All reporting routes require authentication
router.use(authenticate);

/**
 * Fee Earner Rankings
 * GET /api/v1/reporting/fee-earners?period=month|quarter|year
 */
router.get('/fee-earners', reportingController.getFeeEarnerRankings);

/**
 * Practice Area Analytics
 * GET /api/v1/reporting/practice-areas?period=month|quarter|year
 */
router.get('/practice-areas', reportingController.getPracticeAreaAnalytics);

/**
 * 50-Seat Load Index (Workload Metrics)
 * GET /api/v1/reporting/workload
 */
router.get('/workload', reportingController.getWorkloadMetrics);

/**
 * Billing Inertia Detection
 * GET /api/v1/reporting/billing-inertia
 */
router.get('/billing-inertia', reportingController.getBillingInertia);

/**
 * Practice Velocity (Burn Rate)
 * GET /api/v1/reporting/practice-velocity?matter_id=xxx
 */
router.get('/practice-velocity', reportingController.getPracticeVelocity);

/**
 * Executive Summary (Soul Logic)
 * GET /api/v1/reporting/executive-summary
 */
router.get('/executive-summary', reportingController.getExecutiveSummary);

// ==================== PDF EXPORT ROUTES ====================

/**
 * Export Fee Earner Rankings as PDF
 * GET /api/v1/reporting/fee-earners/export-pdf?period=month|quarter|year
 */
router.get('/fee-earners/export-pdf', reportingController.exportFeeEarnersPDF);

/**
 * Export Practice Area Analytics as PDF
 * GET /api/v1/reporting/practice-areas/export-pdf?period=month|quarter|year
 */
router.get('/practice-areas/export-pdf', reportingController.exportPracticeAreasPDF);

/**
 * Export Billing Inertia as PDF
 * GET /api/v1/reporting/billing-inertia/export-pdf
 */
router.get('/billing-inertia/export-pdf', reportingController.exportBillingInertiaPDF);

/**
 * Export Executive Summary as PDF
 * GET /api/v1/reporting/executive-summary/export-pdf?period=month|quarter|year
 */
router.get('/executive-summary/export-pdf', reportingController.exportExecutiveSummaryPDF);

export default router;
