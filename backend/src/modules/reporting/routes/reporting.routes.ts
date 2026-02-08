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

export default router;
