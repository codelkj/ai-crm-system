/**
 * Audit Log Controller
 * POPIA-compliant audit trail viewer (admin/partner only)
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../shared/middleware/authenticate';
import { asyncHandler } from '../../../shared/utils/async-handler';
import auditLogService, { AuditLogFilter } from '../services/audit-log.service';

export class AuditLogController {
  /**
   * Get audit logs with filters
   */
  static getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const firmId = req.user?.firm_id;
    if (!firmId) {
      return res.status(400).json({
        success: false,
        message: 'User not associated with any firm'
      });
    }

    const filters: AuditLogFilter = {
      firm_id: firmId,
      user_id: req.query.user_id as string,
      entity_type: req.query.entity_type as string,
      entity_id: req.query.entity_id as string,
      action: req.query.action as string,
      start_date: req.query.start_date ? new Date(req.query.start_date as string) : undefined,
      end_date: req.query.end_date ? new Date(req.query.end_date as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0
    };

    const result = await auditLogService.getAll(filters);

    res.json({
      success: true,
      data: result.logs,
      pagination: {
        total: result.total,
        limit: filters.limit,
        offset: filters.offset,
        pages: Math.ceil(result.total / (filters.limit || 50))
      }
    });
  });

  /**
   * Get audit trail for specific entity
   */
  static getEntityHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const firmId = req.user?.firm_id;
    if (!firmId) {
      return res.status(400).json({
        success: false,
        message: 'User not associated with any firm'
      });
    }

    const { entityType, entityId } = req.params;

    const logs = await auditLogService.getEntityHistory(firmId, entityType, entityId);

    res.json({
      success: true,
      data: logs
    });
  });

  /**
   * Get user activity summary
   */
  static getUserActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
    const firmId = req.user?.firm_id;
    if (!firmId) {
      return res.status(400).json({
        success: false,
        message: 'User not associated with any firm'
      });
    }

    const { userId } = req.params;
    const days = req.query.days ? parseInt(req.query.days as string) : 30;

    const activity = await auditLogService.getUserActivity(firmId, userId, days);

    res.json({
      success: true,
      data: activity
    });
  });

  /**
   * Get entity access statistics
   */
  static getEntityAccessStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const firmId = req.user?.firm_id;
    if (!firmId) {
      return res.status(400).json({
        success: false,
        message: 'User not associated with any firm'
      });
    }

    const { entityType } = req.params;
    const days = req.query.days ? parseInt(req.query.days as string) : 30;

    const stats = await auditLogService.getEntityAccessStats(firmId, entityType, days);

    res.json({
      success: true,
      data: stats
    });
  });

  /**
   * Get recent activity across firm
   */
  static getRecentActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
    const firmId = req.user?.firm_id;
    if (!firmId) {
      return res.status(400).json({
        success: false,
        message: 'User not associated with any firm'
      });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

    const logs = await auditLogService.getRecentActivity(firmId, limit);

    res.json({
      success: true,
      data: logs
    });
  });
}
