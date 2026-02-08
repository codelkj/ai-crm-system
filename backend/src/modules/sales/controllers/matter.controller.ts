/**
 * Matter Controller
 * Handles HTTP requests for legal matter management
 */

import { Request, Response } from 'express';
import { matterService } from '../services/matter.service';
import { AuthRequest } from '../../../shared/middleware/authenticate';

export class MatterController {
  /**
   * Get all matters with filters
   */
  async getAll(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const filters = {
        client_id: req.query.client_id as string,
        department_id: req.query.department_id as string,
        lead_director_id: req.query.lead_director_id as string,
        lightning_stage_id: req.query.lightning_stage_id as string,
        matter_status: req.query.matter_status as string,
        health_status: req.query.health_status as string,
        matter_type: req.query.matter_type as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };

      const result = await matterService.getAll(firmId, filters);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Get matter by ID
   */
  async getById(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const { id } = req.params;

      const matter = await matterService.getById(id, firmId);

      if (!matter) {
        return res.status(404).json({ success: false, error: 'Matter not found' });
      }

      res.json({ success: true, data: matter });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Create new matter
   */
  async create(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const userId = req.user!.id;

      const matter = await matterService.create(firmId, userId, req.body, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.status(201).json({ success: true, data: matter });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Update matter
   */
  async update(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const userId = req.user!.id;
      const { id } = req.params;

      const matter = await matterService.update(id, firmId, userId, req.body, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({ success: true, data: matter });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Delete matter
   */
  async delete(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const userId = req.user!.id;
      const { id } = req.params;

      await matterService.delete(id, firmId, userId, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({ success: true, message: 'Matter deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Move matter to different stage
   */
  async moveStage(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const userId = req.user!.id;
      const { id } = req.params;
      const { stage_id, notes } = req.body;

      if (!stage_id) {
        return res.status(400).json({ success: false, error: 'stage_id is required' });
      }

      const matter = await matterService.moveStage(id, firmId, userId, stage_id, notes, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({ success: true, data: matter });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Get matter statistics
   */
  async getStats(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const departmentId = req.query.department_id as string;

      const stats = await matterService.getStats(firmId, departmentId);

      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Get matters by department
   */
  async getByDepartment(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;

      const departments = await matterService.getByDepartment(firmId);

      res.json({ success: true, data: departments });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Get team workload
   */
  async getTeamWorkload(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const userId = req.query.user_id as string;

      const workload = await matterService.getTeamWorkload(firmId, userId);

      res.json({ success: true, data: workload });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export const matterController = new MatterController();
