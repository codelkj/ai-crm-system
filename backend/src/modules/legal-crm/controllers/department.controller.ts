/**
 * Department Controller
 * Manages practice areas/departments within law firms
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../shared/middleware/authenticate';
import { asyncHandler } from '../../../shared/utils/async-handler';
import departmentService, { CreateDepartmentDTO, UpdateDepartmentDTO } from '../services/department.service';
import { auditLog } from '../../../shared/middleware/audit.middleware';
import { AuditAction } from '../services/audit-log.service';

export class DepartmentController {
  /**
   * Get all departments for current firm
   */
  static getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const firmId = req.user?.firm_id;
    if (!firmId) {
      return res.status(400).json({
        success: false,
        message: 'User not associated with any firm'
      });
    }

    const departments = await departmentService.getAll(firmId);

    res.json({
      success: true,
      data: departments
    });
  });

  /**
   * Get active departments only
   */
  static getActive = asyncHandler(async (req: AuthRequest, res: Response) => {
    const firmId = req.user?.firm_id;
    if (!firmId) {
      return res.status(400).json({
        success: false,
        message: 'User not associated with any firm'
      });
    }

    const departments = await departmentService.getActive(firmId);

    res.json({
      success: true,
      data: departments
    });
  });

  /**
   * Get department by ID
   */
  static getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const department = await departmentService.getById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Verify department belongs to user's firm
    if (department.firm_id !== req.user?.firm_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: department
    });
  });

  /**
   * Create department
   */
  static create = [
    auditLog(AuditAction.CREATE, 'departments'),
    asyncHandler(async (req: AuthRequest, res: Response) => {
      const firmId = req.user?.firm_id;
      if (!firmId) {
        return res.status(400).json({
          success: false,
          message: 'User not associated with any firm'
        });
      }

      const data: CreateDepartmentDTO = {
        ...req.body,
        firm_id: firmId
      };

      const department = await departmentService.create(data);

      res.status(201).json({
        success: true,
        data: department,
        message: 'Department created successfully'
      });
    })
  ];

  /**
   * Update department
   */
  static update = [
    auditLog(AuditAction.UPDATE, 'departments'),
    asyncHandler(async (req: AuthRequest, res: Response) => {
      const { id } = req.params;
      const data: UpdateDepartmentDTO = req.body;

      // Verify department belongs to user's firm
      const existing = await departmentService.getById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }

      if (existing.firm_id !== req.user?.firm_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const department = await departmentService.update(id, data);

      res.json({
        success: true,
        data: department,
        message: 'Department updated successfully'
      });
    })
  ];

  /**
   * Delete department (soft delete)
   */
  static delete = [
    auditLog(AuditAction.DELETE, 'departments'),
    asyncHandler(async (req: AuthRequest, res: Response) => {
      const { id } = req.params;

      // Verify department belongs to user's firm
      const existing = await departmentService.getById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }

      if (existing.firm_id !== req.user?.firm_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const success = await departmentService.delete(id);

      res.json({
        success: true,
        message: 'Department deactivated successfully'
      });
    })
  ];

  /**
   * Get department statistics
   */
  static getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const stats = await departmentService.getStats(id);

    res.json({
      success: true,
      data: stats
    });
  });

  /**
   * Get department directors
   */
  static getDirectors = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const directors = await departmentService.getDirectors(id);

    res.json({
      success: true,
      data: directors
    });
  });

  /**
   * Assign user to department
   */
  static assignUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { user_id, is_director } = req.body;

    await departmentService.assignUser(id, user_id, is_director);

    res.json({
      success: true,
      message: 'User assigned to department successfully'
    });
  });

  /**
   * Remove user from department
   */
  static removeUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id, userId } = req.params;

    const success = await departmentService.removeUser(id, userId);
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      message: 'User removed from department successfully'
    });
  });
}
