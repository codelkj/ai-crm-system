/**
 * Lightning Path Controller
 * Handles HTTP requests for Lightning Path stage management
 */

import { Request, Response } from 'express';
import { lightningStageService } from '../services/lightning-stage.service';
import { matterService } from '../services/matter.service';
import { AuthRequest } from '../../../shared/middleware/authenticate';

export class LightningPathController {
  /**
   * Get all stages
   */
  async getStages(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const includeStats = req.query.include_stats === 'true';

      const stages = await lightningStageService.getAll(firmId, includeStats);

      res.json({ success: true, data: stages });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Get stage by ID
   */
  async getStageById(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const { id } = req.params;

      const stage = await lightningStageService.getById(id, firmId);

      if (!stage) {
        return res.status(404).json({ success: false, error: 'Stage not found' });
      }

      res.json({ success: true, data: stage });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Create new stage
   */
  async createStage(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const userId = req.user!.id;

      const stage = await lightningStageService.create(firmId, userId, req.body, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.status(201).json({ success: true, data: stage });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Update stage
   */
  async updateStage(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const userId = req.user!.id;
      const { id } = req.params;

      const stage = await lightningStageService.update(id, firmId, userId, req.body, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({ success: true, data: stage });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Delete stage
   */
  async deleteStage(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const userId = req.user!.id;
      const { id } = req.params;

      await lightningStageService.delete(id, firmId, userId, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({ success: true, message: 'Stage deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Reorder stages
   */
  async reorderStages(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const userId = req.user!.id;
      const { stage_orders } = req.body;

      if (!Array.isArray(stage_orders)) {
        return res.status(400).json({ success: false, error: 'stage_orders must be an array' });
      }

      const stages = await lightningStageService.reorder(firmId, userId, stage_orders, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({ success: true, data: stages });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Get pipeline statistics
   */
  async getPipelineStats(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;

      const stats = await lightningStageService.getPipelineStats(firmId);

      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Get matters for Lightning Path Kanban board
   */
  async getMattersForKanban(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;

      // Get all active matters grouped by stage
      const matters = await matterService.getAll(firmId, {
        matter_status: 'active',
        limit: 1000  // Get all for Kanban view
      });

      // Get all stages with stats
      const stages = await lightningStageService.getAll(firmId, true);

      // Group matters by stage
      const kanbanData = stages.map(stage => ({
        stage,
        matters: matters.data.filter(m => m.lightning_stage_id === stage.id)
      }));

      res.json({ success: true, data: kanbanData });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Move matter between stages (for Kanban drag-and-drop)
   */
  async moveMatter(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const userId = req.user!.id;
      const { matter_id, to_stage_id, notes } = req.body;

      if (!matter_id || !to_stage_id) {
        return res.status(400).json({
          success: false,
          error: 'matter_id and to_stage_id are required'
        });
      }

      const matter = await matterService.moveStage(
        matter_id,
        firmId,
        userId,
        to_stage_id,
        notes,
        {
          ip: req.ip,
          userAgent: req.headers['user-agent']
        }
      );

      res.json({ success: true, data: matter });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export const lightningPathController = new LightningPathController();
