/**
 * Matter Assignment Controller
 * Handles HTTP requests for team member assignments to matters
 */

import { Request, Response } from 'express';
import { matterAssignmentService } from '../services/matter-assignment.service';
import { AuthRequest } from '../../../shared/middleware/authenticate';

export class MatterAssignmentController {
  /**
   * Get assignments for a matter
   */
  async getByMatter(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const { matter_id } = req.params;
      const activeOnly = req.query.active_only !== 'false';

      const assignments = await matterAssignmentService.getByMatter(matter_id, firmId, activeOnly);

      res.json({ success: true, data: assignments });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Get assignments for a user
   */
  async getByUser(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const { user_id } = req.params;
      const activeOnly = req.query.active_only !== 'false';

      const assignments = await matterAssignmentService.getByUser(user_id, firmId, activeOnly);

      res.json({ success: true, data: assignments });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Get assignment by ID
   */
  async getById(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const { id } = req.params;

      const assignment = await matterAssignmentService.getById(id, firmId);

      if (!assignment) {
        return res.status(404).json({ success: false, error: 'Assignment not found' });
      }

      res.json({ success: true, data: assignment });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Assign user to matter
   */
  async create(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const userId = req.user!.id;

      const assignment = await matterAssignmentService.create(firmId, userId, req.body, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.status(201).json({ success: true, data: assignment });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Remove user from matter
   */
  async remove(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const userId = req.user!.id;
      const { id } = req.params;

      await matterAssignmentService.remove(id, firmId, userId, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({ success: true, message: 'Assignment removed successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Bulk assign team to matter
   */
  async bulkAssign(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const userId = req.user!.id;
      const { matter_id, assignments } = req.body;

      if (!matter_id || !Array.isArray(assignments)) {
        return res.status(400).json({
          success: false,
          error: 'matter_id and assignments array are required'
        });
      }

      const result = await matterAssignmentService.bulkAssign(
        firmId,
        userId,
        matter_id,
        assignments,
        {
          ip: req.ip,
          userAgent: req.headers['user-agent']
        }
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Transfer matter from one user to another
   */
  async transfer(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const userId = req.user!.id;
      const { matter_id, from_user_id, to_user_id } = req.body;

      if (!matter_id || !from_user_id || !to_user_id) {
        return res.status(400).json({
          success: false,
          error: 'matter_id, from_user_id, and to_user_id are required'
        });
      }

      await matterAssignmentService.transfer(
        matter_id,
        from_user_id,
        to_user_id,
        firmId,
        userId,
        {
          ip: req.ip,
          userAgent: req.headers['user-agent']
        }
      );

      res.json({ success: true, message: 'Matter transferred successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Get team statistics
   */
  async getTeamStats(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;

      const stats = await matterAssignmentService.getTeamStats(firmId);

      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export const matterAssignmentController = new MatterAssignmentController();
