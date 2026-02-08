/**
 * Firm Controller
 * Manages law firm records (multi-tenancy core)
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../shared/middleware/authenticate';
import { asyncHandler } from '../../../shared/utils/async-handler';
import firmService, { CreateFirmDTO, UpdateFirmDTO } from '../services/firm.service';
import { auditLog } from '../../../shared/middleware/audit.middleware';
import { AuditAction } from '../services/audit-log.service';

export class FirmController {
  /**
   * Get all firms (admin only)
   */
  static getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const firms = await firmService.getAll();

    res.json({
      success: true,
      data: firms
    });
  });

  /**
   * Get current user's firm
   */
  static getCurrent = asyncHandler(async (req: AuthRequest, res: Response) => {
    const firmId = req.user?.firm_id;
    if (!firmId) {
      return res.status(400).json({
        success: false,
        message: 'User not associated with any firm'
      });
    }

    const firm = await firmService.getById(firmId);
    if (!firm) {
      return res.status(404).json({
        success: false,
        message: 'Firm not found'
      });
    }

    res.json({
      success: true,
      data: firm
    });
  });

  /**
   * Get firm by ID
   */
  static getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const firm = await firmService.getById(id);
    if (!firm) {
      return res.status(404).json({
        success: false,
        message: 'Firm not found'
      });
    }

    res.json({
      success: true,
      data: firm
    });
  });

  /**
   * Create firm (admin only)
   */
  static create = [
    auditLog(AuditAction.CREATE, 'firms'),
    asyncHandler(async (req: AuthRequest, res: Response) => {
      const data: CreateFirmDTO = req.body;

      const firm = await firmService.create(data);

      res.status(201).json({
        success: true,
        data: firm,
        message: 'Firm created successfully'
      });
    })
  ];

  /**
   * Update firm
   */
  static update = [
    auditLog(AuditAction.UPDATE, 'firms'),
    asyncHandler(async (req: AuthRequest, res: Response) => {
      const { id } = req.params;
      const data: UpdateFirmDTO = req.body;

      const firm = await firmService.update(id, data);
      if (!firm) {
        return res.status(404).json({
          success: false,
          message: 'Firm not found'
        });
      }

      res.json({
        success: true,
        data: firm,
        message: 'Firm updated successfully'
      });
    })
  ];

  /**
   * Delete firm (soft delete)
   */
  static delete = [
    auditLog(AuditAction.DELETE, 'firms'),
    asyncHandler(async (req: AuthRequest, res: Response) => {
      const { id } = req.params;

      const success = await firmService.delete(id);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Firm not found'
        });
      }

      res.json({
        success: true,
        message: 'Firm deactivated successfully'
      });
    })
  ];

  /**
   * Get firm statistics
   */
  static getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const firmId = req.user?.firm_id;
    if (!firmId) {
      return res.status(400).json({
        success: false,
        message: 'User not associated with any firm'
      });
    }

    const stats = await firmService.getStats(firmId);

    res.json({
      success: true,
      data: stats
    });
  });
}
