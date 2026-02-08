/**
 * Time Tracking Routes
 * API routes for time entries and billing packs
 */

import { Router } from 'express';
import { authenticate, authorizePermission } from '../../../shared/middleware/authenticate';
import { timeEntryController } from '../controllers/time-entry.controller';
import { billingPackController } from '../controllers/billing-pack.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// =====================================================
// TIME ENTRY ROUTES
// =====================================================

/**
 * GET /api/v1/time-tracking/entries
 * Get all time entries with filters
 */
router.get(
  '/entries',
  authorizePermission('time_entries', 'read'),
  (req, res) => timeEntryController.getAll(req, res)
);

/**
 * GET /api/v1/time-tracking/entries/stats
 * Get time entry statistics
 */
router.get(
  '/entries/stats',
  authorizePermission('time_entries', 'read'),
  (req, res) => timeEntryController.getStats(req, res)
);

/**
 * GET /api/v1/time-tracking/entries/pending-approval
 * Get time entries pending approval
 */
router.get(
  '/entries/pending-approval',
  authorizePermission('time_entries', 'approve'),
  (req, res) => timeEntryController.getPendingApproval(req, res)
);

/**
 * GET /api/v1/time-tracking/entries/unbilled/by-matter
 * Get unbilled hours summary by matter
 */
router.get(
  '/entries/unbilled/by-matter',
  authorizePermission('time_entries', 'read'),
  (req, res) => timeEntryController.getUnbilledByMatter(req, res)
);

/**
 * GET /api/v1/time-tracking/entries/unbilled/by-user
 * Get unbilled hours summary by user
 */
router.get(
  '/entries/unbilled/by-user',
  authorizePermission('time_entries', 'read'),
  (req, res) => timeEntryController.getUnbilledByUser(req, res)
);

/**
 * POST /api/v1/time-tracking/entries/bulk-approve
 * Bulk approve time entries
 */
router.post(
  '/entries/bulk-approve',
  authorizePermission('time_entries', 'approve'),
  (req, res) => timeEntryController.bulkApprove(req, res)
);

/**
 * GET /api/v1/time-tracking/entries/:id
 * Get time entry by ID
 */
router.get(
  '/entries/:id',
  authorizePermission('time_entries', 'read'),
  (req, res) => timeEntryController.getById(req, res)
);

/**
 * POST /api/v1/time-tracking/entries
 * Create time entry
 */
router.post(
  '/entries',
  authorizePermission('time_entries', 'create'),
  (req, res) => timeEntryController.create(req, res)
);

/**
 * PUT /api/v1/time-tracking/entries/:id
 * Update time entry
 */
router.put(
  '/entries/:id',
  authorizePermission('time_entries', 'update'),
  (req, res) => timeEntryController.update(req, res)
);

/**
 * DELETE /api/v1/time-tracking/entries/:id
 * Delete time entry
 */
router.delete(
  '/entries/:id',
  authorizePermission('time_entries', 'delete'),
  (req, res) => timeEntryController.delete(req, res)
);

/**
 * POST /api/v1/time-tracking/entries/:id/approve
 * Approve time entry
 */
router.post(
  '/entries/:id/approve',
  authorizePermission('time_entries', 'approve'),
  (req, res) => timeEntryController.approve(req, res)
);

/**
 * POST /api/v1/time-tracking/entries/:id/unapprove
 * Unapprove time entry
 */
router.post(
  '/entries/:id/unapprove',
  authorizePermission('time_entries', 'approve'),
  (req, res) => timeEntryController.unapprove(req, res)
);

// =====================================================
// BILLING PACK ROUTES
// =====================================================

/**
 * GET /api/v1/time-tracking/billing-packs
 * Get all billing packs with filters
 */
router.get(
  '/billing-packs',
  authorizePermission('billing_packs', 'read'),
  (req, res) => billingPackController.getAll(req, res)
);

/**
 * GET /api/v1/time-tracking/billing-packs/stats
 * Get billing pack statistics
 */
router.get(
  '/billing-packs/stats',
  authorizePermission('billing_packs', 'read'),
  (req, res) => billingPackController.getStats(req, res)
);

/**
 * POST /api/v1/time-tracking/billing-packs/generate
 * Generate billing pack from approved unbilled time entries
 */
router.post(
  '/billing-packs/generate',
  authorizePermission('billing_packs', 'create'),
  (req, res) => billingPackController.generate(req, res)
);

/**
 * GET /api/v1/time-tracking/billing-packs/:id
 * Get billing pack by ID
 */
router.get(
  '/billing-packs/:id',
  authorizePermission('billing_packs', 'read'),
  (req, res) => billingPackController.getById(req, res)
);

/**
 * GET /api/v1/time-tracking/billing-packs/:id/entries
 * Get time entries for a billing pack
 */
router.get(
  '/billing-packs/:id/entries',
  authorizePermission('billing_packs', 'read'),
  (req, res) => billingPackController.getTimeEntries(req, res)
);

/**
 * POST /api/v1/time-tracking/billing-packs
 * Create billing pack
 */
router.post(
  '/billing-packs',
  authorizePermission('billing_packs', 'create'),
  (req, res) => billingPackController.create(req, res)
);

/**
 * PUT /api/v1/time-tracking/billing-packs/:id
 * Update billing pack
 */
router.put(
  '/billing-packs/:id',
  authorizePermission('billing_packs', 'update'),
  (req, res) => billingPackController.update(req, res)
);

/**
 * DELETE /api/v1/time-tracking/billing-packs/:id
 * Delete billing pack
 */
router.delete(
  '/billing-packs/:id',
  authorizePermission('billing_packs', 'delete'),
  (req, res) => billingPackController.delete(req, res)
);

/**
 * POST /api/v1/time-tracking/billing-packs/:id/send
 * Send billing pack to client
 */
router.post(
  '/billing-packs/:id/send',
  authorizePermission('billing_packs', 'send'),
  (req, res) => billingPackController.send(req, res)
);

/**
 * POST /api/v1/time-tracking/billing-packs/:id/approve
 * Approve billing pack and optionally create invoice
 */
router.post(
  '/billing-packs/:id/approve',
  authorizePermission('billing_packs', 'approve'),
  (req, res) => billingPackController.approve(req, res)
);

export default router;
