/**
 * Legal CRM Routes
 * Multi-tenancy, departments, roles, and audit logs
 */

import { Router } from 'express';
import { authenticate, authorizeLevel, authorizePermission } from '../../../shared/middleware/authenticate';
import { FirmController } from '../controllers/firm.controller';
import { DepartmentController } from '../controllers/department.controller';
import { RoleController } from '../controllers/role.controller';
import { AuditLogController } from '../controllers/audit-log.controller';

const router = Router();

// =====================================================
// FIRM ROUTES
// =====================================================

// Get current user's firm
router.get('/firms/current', authenticate, FirmController.getCurrent);

// Get firm statistics
router.get('/firms/stats', authenticate, FirmController.getStats);

// Get all firms (admin only)
router.get('/firms', authenticate, authorizeLevel(1), FirmController.getAll);

// Get firm by ID
router.get('/firms/:id', authenticate, FirmController.getById);

// Create firm (admin only)
router.post('/firms', authenticate, authorizeLevel(1), FirmController.create);

// Update firm (partner/admin only)
router.put('/firms/:id', authenticate, authorizeLevel(1), FirmController.update);

// Delete firm (admin only)
router.delete('/firms/:id', authenticate, authorizeLevel(1), FirmController.delete);

// =====================================================
// DEPARTMENT ROUTES
// =====================================================

// Get active departments only
router.get('/departments/active', authenticate, DepartmentController.getActive);

// Get all departments
router.get('/departments', authenticate, DepartmentController.getAll);

// Get department by ID
router.get('/departments/:id', authenticate, DepartmentController.getById);

// Get department statistics
router.get('/departments/:id/stats', authenticate, DepartmentController.getStats);

// Get department directors
router.get('/departments/:id/directors', authenticate, DepartmentController.getDirectors);

// Create department (partner/admin only)
router.post(
  '/departments',
  authenticate,
  authorizeLevel(1),
  DepartmentController.create
);

// Update department (partner/admin only)
router.put(
  '/departments/:id',
  authenticate,
  authorizeLevel(1),
  DepartmentController.update
);

// Delete department (partner/admin only)
router.delete(
  '/departments/:id',
  authenticate,
  authorizeLevel(1),
  DepartmentController.delete
);

// Assign user to department
router.post(
  '/departments/:id/users',
  authenticate,
  authorizeLevel(1),
  DepartmentController.assignUser
);

// Remove user from department
router.delete(
  '/departments/:id/users/:userId',
  authenticate,
  authorizeLevel(1),
  DepartmentController.removeUser
);

// =====================================================
// ROLE ROUTES
// =====================================================

// Get permission matrix
router.get('/roles/permissions/matrix', authenticate, RoleController.getPermissionMatrix);

// Check current user permission
router.get('/roles/permissions/check', authenticate, RoleController.checkPermission);

// Get all roles
router.get('/roles', authenticate, RoleController.getAll);

// Get role by ID
router.get('/roles/:id', authenticate, RoleController.getById);

// Get users with role
router.get('/roles/:id/users', authenticate, RoleController.getUsersWithRole);

// Create role (partner/admin only)
router.post(
  '/roles',
  authenticate,
  authorizeLevel(1),
  RoleController.create
);

// Update role (partner/admin only)
router.put(
  '/roles/:id',
  authenticate,
  authorizeLevel(1),
  RoleController.update
);

// Delete role (partner/admin only)
router.delete(
  '/roles/:id',
  authenticate,
  authorizeLevel(1),
  RoleController.delete
);

// =====================================================
// AUDIT LOG ROUTES (Admin/Partner Only)
// =====================================================

// Get recent activity
router.get(
  '/audit-logs/recent',
  authenticate,
  authorizeLevel(1),
  AuditLogController.getRecentActivity
);

// Get user activity summary
router.get(
  '/audit-logs/users/:userId/activity',
  authenticate,
  authorizeLevel(1),
  AuditLogController.getUserActivity
);

// Get entity access statistics
router.get(
  '/audit-logs/entities/:entityType/stats',
  authenticate,
  authorizeLevel(1),
  AuditLogController.getEntityAccessStats
);

// Get entity history
router.get(
  '/audit-logs/entities/:entityType/:entityId',
  authenticate,
  authorizeLevel(1),
  AuditLogController.getEntityHistory
);

// Get all audit logs with filters
router.get(
  '/audit-logs',
  authenticate,
  authorizeLevel(1),
  AuditLogController.getAll
);

export default router;
