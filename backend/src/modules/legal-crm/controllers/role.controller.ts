/**
 * Role Controller
 * Manages legal-specific roles and permissions (RBAC)
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../shared/middleware/authenticate';
import { asyncHandler } from '../../../shared/utils/async-handler';
import roleService, { CreateRoleDTO, UpdateRoleDTO } from '../services/role.service';
import { auditLog } from '../../../shared/middleware/audit.middleware';
import { AuditAction } from '../services/audit-log.service';

export class RoleController {
  /**
   * Get all roles for current firm
   */
  static getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const firmId = req.user?.firm_id;
    if (!firmId) {
      return res.status(400).json({
        success: false,
        message: 'User not associated with any firm'
      });
    }

    const roles = await roleService.getAll(firmId);

    res.json({
      success: true,
      data: roles
    });
  });

  /**
   * Get role by ID
   */
  static getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const role = await roleService.getById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Verify role belongs to user's firm
    if (role.firm_id !== req.user?.firm_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: role
    });
  });

  /**
   * Create role (admin/partner only)
   */
  static create = [
    auditLog(AuditAction.CREATE, 'roles'),
    asyncHandler(async (req: AuthRequest, res: Response) => {
      const firmId = req.user?.firm_id;
      if (!firmId) {
        return res.status(400).json({
          success: false,
          message: 'User not associated with any firm'
        });
      }

      const data: CreateRoleDTO = {
        ...req.body,
        firm_id: firmId
      };

      const role = await roleService.create(data);

      res.status(201).json({
        success: true,
        data: role,
        message: 'Role created successfully'
      });
    })
  ];

  /**
   * Update role (admin/partner only)
   */
  static update = [
    auditLog(AuditAction.UPDATE, 'roles'),
    asyncHandler(async (req: AuthRequest, res: Response) => {
      const { id } = req.params;
      const data: UpdateRoleDTO = req.body;

      // Verify role belongs to user's firm
      const existing = await roleService.getById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      if (existing.firm_id !== req.user?.firm_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const role = await roleService.update(id, data);

      res.json({
        success: true,
        data: role,
        message: 'Role updated successfully'
      });
    })
  ];

  /**
   * Delete role (admin/partner only)
   */
  static delete = [
    auditLog(AuditAction.DELETE, 'roles'),
    asyncHandler(async (req: AuthRequest, res: Response) => {
      const { id } = req.params;

      // Verify role belongs to user's firm
      const existing = await roleService.getById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      if (existing.firm_id !== req.user?.firm_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Check if role can be deleted (no users assigned)
      const canDelete = await roleService.canDelete(id);
      if (!canDelete) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete role with assigned users. Please reassign users first.'
        });
      }

      const success = await roleService.delete(id);

      res.json({
        success: true,
        message: 'Role deleted successfully'
      });
    })
  ];

  /**
   * Get users with specific role
   */
  static getUsersWithRole = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const users = await roleService.getUsersWithRole(id);

    res.json({
      success: true,
      data: users
    });
  });

  /**
   * Get permission matrix (for UI display)
   */
  static getPermissionMatrix = asyncHandler(async (req: AuthRequest, res: Response) => {
    const matrix = roleService.getPermissionMatrix();

    res.json({
      success: true,
      data: matrix
    });
  });

  /**
   * Check permission for current user
   */
  static checkPermission = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { resource, action } = req.query;

    if (!resource || !action) {
      return res.status(400).json({
        success: false,
        message: 'Resource and action are required'
      });
    }

    const userRole = req.user?.permissions ? {
      permissions: req.user.permissions
    } as any : null;

    if (!userRole) {
      return res.json({
        success: true,
        data: { hasPermission: false }
      });
    }

    const hasPermission = roleService.hasPermission(
      userRole,
      resource as string,
      action as string
    );

    res.json({
      success: true,
      data: { hasPermission }
    });
  });
}
