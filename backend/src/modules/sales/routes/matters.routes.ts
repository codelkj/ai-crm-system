/**
 * Matters & Lightning Path Routes
 * Legal matter management and intake pipeline
 */

import { Router } from 'express';
import { matterController } from '../controllers/matter.controller';
import { lightningPathController } from '../controllers/lightning-path.controller';
import { matterAssignmentController } from '../controllers/matter-assignment.controller';
import { authenticate, authorizePermission } from '../../../shared/middleware/authenticate';

const router = Router();

// =====================================================
// MATTER ROUTES
// =====================================================

/**
 * @route   GET /api/v1/matters
 * @desc    Get all matters with filters
 * @access  Private (matters:read)
 */
router.get(
  '/',
  authenticate,
  authorizePermission('matters', 'read'),
  matterController.getAll
);

/**
 * @route   GET /api/v1/matters/stats
 * @desc    Get matter statistics
 * @access  Private (matters:read)
 */
router.get(
  '/stats',
  authenticate,
  authorizePermission('matters', 'read'),
  matterController.getStats
);

/**
 * @route   GET /api/v1/matters/by-department
 * @desc    Get matters grouped by department
 * @access  Private (matters:read)
 */
router.get(
  '/by-department',
  authenticate,
  authorizePermission('matters', 'read'),
  matterController.getByDepartment
);

/**
 * @route   GET /api/v1/matters/team-workload
 * @desc    Get team workload statistics
 * @access  Private (matters:read)
 */
router.get(
  '/team-workload',
  authenticate,
  authorizePermission('matters', 'read'),
  matterController.getTeamWorkload
);

/**
 * @route   GET /api/v1/matters/:id
 * @desc    Get matter by ID
 * @access  Private (matters:read)
 */
router.get(
  '/:id',
  authenticate,
  authorizePermission('matters', 'read'),
  matterController.getById
);

/**
 * @route   POST /api/v1/matters
 * @desc    Create new matter
 * @access  Private (matters:create)
 */
router.post(
  '/',
  authenticate,
  authorizePermission('matters', 'create'),
  matterController.create
);

/**
 * @route   PUT /api/v1/matters/:id
 * @desc    Update matter
 * @access  Private (matters:update)
 */
router.put(
  '/:id',
  authenticate,
  authorizePermission('matters', 'update'),
  matterController.update
);

/**
 * @route   DELETE /api/v1/matters/:id
 * @desc    Delete matter
 * @access  Private (matters:delete)
 */
router.delete(
  '/:id',
  authenticate,
  authorizePermission('matters', 'delete'),
  matterController.delete
);

/**
 * @route   POST /api/v1/matters/:id/move-stage
 * @desc    Move matter to different stage
 * @access  Private (matters:update)
 */
router.post(
  '/:id/move-stage',
  authenticate,
  authorizePermission('matters', 'update'),
  matterController.moveStage
);

// =====================================================
// LIGHTNING PATH ROUTES
// =====================================================

/**
 * @route   GET /api/v1/lightning-path/stages
 * @desc    Get all Lightning Path stages
 * @access  Private (lightning_path:read)
 */
router.get(
  '/lightning-path/stages',
  authenticate,
  authorizePermission('lightning_path', 'read'),
  lightningPathController.getStages
);

/**
 * @route   GET /api/v1/lightning-path/stats
 * @desc    Get Lightning Path pipeline statistics
 * @access  Private (lightning_path:read)
 */
router.get(
  '/lightning-path/stats',
  authenticate,
  authorizePermission('lightning_path', 'read'),
  lightningPathController.getPipelineStats
);

/**
 * @route   GET /api/v1/lightning-path/kanban
 * @desc    Get matters grouped by stage for Kanban view
 * @access  Private (lightning_path:read)
 */
router.get(
  '/lightning-path/kanban',
  authenticate,
  authorizePermission('lightning_path', 'read'),
  lightningPathController.getMattersForKanban
);

/**
 * @route   POST /api/v1/lightning-path/move
 * @desc    Move matter between stages (Kanban drag-and-drop)
 * @access  Private (lightning_path:move)
 */
router.post(
  '/lightning-path/move',
  authenticate,
  authorizePermission('lightning_path', 'move'),
  lightningPathController.moveMatter
);

/**
 * @route   GET /api/v1/lightning-path/stages/:id
 * @desc    Get stage by ID
 * @access  Private (lightning_path:read)
 */
router.get(
  '/lightning-path/stages/:id',
  authenticate,
  authorizePermission('lightning_path', 'read'),
  lightningPathController.getStageById
);

/**
 * @route   POST /api/v1/lightning-path/stages
 * @desc    Create new stage
 * @access  Private (lightning_path:manage)
 */
router.post(
  '/lightning-path/stages',
  authenticate,
  authorizePermission('lightning_path', 'manage'),
  lightningPathController.createStage
);

/**
 * @route   PUT /api/v1/lightning-path/stages/:id
 * @desc    Update stage
 * @access  Private (lightning_path:manage)
 */
router.put(
  '/lightning-path/stages/:id',
  authenticate,
  authorizePermission('lightning_path', 'manage'),
  lightningPathController.updateStage
);

/**
 * @route   DELETE /api/v1/lightning-path/stages/:id
 * @desc    Delete stage
 * @access  Private (lightning_path:manage)
 */
router.delete(
  '/lightning-path/stages/:id',
  authenticate,
  authorizePermission('lightning_path', 'manage'),
  lightningPathController.deleteStage
);

/**
 * @route   POST /api/v1/lightning-path/stages/reorder
 * @desc    Reorder stages
 * @access  Private (lightning_path:manage)
 */
router.post(
  '/lightning-path/stages/reorder',
  authenticate,
  authorizePermission('lightning_path', 'manage'),
  lightningPathController.reorderStages
);

// =====================================================
// MATTER ASSIGNMENT ROUTES
// =====================================================

/**
 * @route   GET /api/v1/matter-assignments/matter/:matter_id
 * @desc    Get assignments for a matter
 * @access  Private (matters:read)
 */
router.get(
  '/matter-assignments/matter/:matter_id',
  authenticate,
  authorizePermission('matters', 'read'),
  matterAssignmentController.getByMatter
);

/**
 * @route   GET /api/v1/matter-assignments/user/:user_id
 * @desc    Get assignments for a user
 * @access  Private (matters:read)
 */
router.get(
  '/matter-assignments/user/:user_id',
  authenticate,
  authorizePermission('matters', 'read'),
  matterAssignmentController.getByUser
);

/**
 * @route   GET /api/v1/matter-assignments/team-stats
 * @desc    Get team statistics
 * @access  Private (matters:read)
 */
router.get(
  '/matter-assignments/team-stats',
  authenticate,
  authorizePermission('matters', 'read'),
  matterAssignmentController.getTeamStats
);

/**
 * @route   GET /api/v1/matter-assignments/:id
 * @desc    Get assignment by ID
 * @access  Private (matters:read)
 */
router.get(
  '/matter-assignments/:id',
  authenticate,
  authorizePermission('matters', 'read'),
  matterAssignmentController.getById
);

/**
 * @route   POST /api/v1/matter-assignments
 * @desc    Assign user to matter
 * @access  Private (matters:assign)
 */
router.post(
  '/matter-assignments',
  authenticate,
  authorizePermission('matters', 'assign'),
  matterAssignmentController.create
);

/**
 * @route   POST /api/v1/matter-assignments/bulk
 * @desc    Bulk assign team to matter
 * @access  Private (matters:assign)
 */
router.post(
  '/matter-assignments/bulk',
  authenticate,
  authorizePermission('matters', 'assign'),
  matterAssignmentController.bulkAssign
);

/**
 * @route   POST /api/v1/matter-assignments/transfer
 * @desc    Transfer matter from one user to another
 * @access  Private (matters:transfer)
 */
router.post(
  '/matter-assignments/transfer',
  authenticate,
  authorizePermission('matters', 'transfer'),
  matterAssignmentController.transfer
);

/**
 * @route   DELETE /api/v1/matter-assignments/:id
 * @desc    Remove user from matter
 * @access  Private (matters:assign)
 */
router.delete(
  '/matter-assignments/:id',
  authenticate,
  authorizePermission('matters', 'assign'),
  matterAssignmentController.remove
);

export default router;
