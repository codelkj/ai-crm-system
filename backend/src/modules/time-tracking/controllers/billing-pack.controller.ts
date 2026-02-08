/**
 * Billing Pack Controller
 * Handles HTTP requests for billing pack operations
 */

import { Request, Response } from 'express';
import { billingPackService, CreateBillingPackDTO } from '../services/billing-pack.service';
import { AuthRequest } from '../../../shared/middleware/authenticate';

export class BillingPackController {
  /**
   * GET /api/v1/time-tracking/billing-packs
   * Get all billing packs with filters
   */
  async getAll(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const filters = {
        client_id: req.query.client_id as string,
        status: req.query.status as string,
        start_date: req.query.start_date as string,
        end_date: req.query.end_date as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };

      const result = await billingPackService.getAll(firmId, filters);
      res.json(result);
    } catch (error: any) {
      console.error('Get billing packs error:', error);
      res.status(500).json({ error: error.message || 'Failed to get billing packs' });
    }
  }

  /**
   * GET /api/v1/time-tracking/billing-packs/:id
   * Get billing pack by ID
   */
  async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const firmId = req.user!.firm_id;

      const billingPack = await billingPackService.getById(id, firmId);
      if (!billingPack) {
        return res.status(404).json({ error: 'Billing pack not found' });
      }

      res.json({ data: billingPack });
    } catch (error: any) {
      console.error('Get billing pack error:', error);
      res.status(500).json({ error: error.message || 'Failed to get billing pack' });
    }
  }

  /**
   * GET /api/v1/time-tracking/billing-packs/:id/entries
   * Get time entries for a billing pack
   */
  async getTimeEntries(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const firmId = req.user!.firm_id;

      const entries = await billingPackService.getTimeEntries(id, firmId);
      res.json({ data: entries });
    } catch (error: any) {
      console.error('Get billing pack entries error:', error);
      res.status(500).json({ error: error.message || 'Failed to get time entries' });
    }
  }

  /**
   * POST /api/v1/time-tracking/billing-packs
   * Create billing pack
   */
  async create(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const userId = req.user!.id;
      const data: CreateBillingPackDTO = req.body;

      const billingPack = await billingPackService.create(firmId, userId, data, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.status(201).json({ data: billingPack });
    } catch (error: any) {
      console.error('Create billing pack error:', error);
      res.status(400).json({ error: error.message || 'Failed to create billing pack' });
    }
  }

  /**
   * POST /api/v1/time-tracking/billing-packs/generate
   * Generate billing pack from approved unbilled time entries
   */
  async generate(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const userId = req.user!.id;
      const data: CreateBillingPackDTO = req.body;

      const billingPack = await billingPackService.generate(firmId, userId, data, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.status(201).json({ data: billingPack });
    } catch (error: any) {
      console.error('Generate billing pack error:', error);
      res.status(400).json({ error: error.message || 'Failed to generate billing pack' });
    }
  }

  /**
   * PUT /api/v1/time-tracking/billing-packs/:id
   * Update billing pack
   */
  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const firmId = req.user!.firm_id;
      const userId = req.user!.id;
      const data = req.body;

      const billingPack = await billingPackService.update(id, firmId, userId, data, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({ data: billingPack });
    } catch (error: any) {
      console.error('Update billing pack error:', error);
      res.status(400).json({ error: error.message || 'Failed to update billing pack' });
    }
  }

  /**
   * DELETE /api/v1/time-tracking/billing-packs/:id
   * Delete billing pack
   */
  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const firmId = req.user!.firm_id;
      const userId = req.user!.id;

      await billingPackService.delete(id, firmId, userId, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({ message: 'Billing pack deleted successfully' });
    } catch (error: any) {
      console.error('Delete billing pack error:', error);
      res.status(400).json({ error: error.message || 'Failed to delete billing pack' });
    }
  }

  /**
   * POST /api/v1/time-tracking/billing-packs/:id/send
   * Send billing pack to client
   */
  async send(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const firmId = req.user!.firm_id;
      const userId = req.user!.id;

      const billingPack = await billingPackService.send(id, firmId, userId, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({ data: billingPack });
    } catch (error: any) {
      console.error('Send billing pack error:', error);
      res.status(400).json({ error: error.message || 'Failed to send billing pack' });
    }
  }

  /**
   * POST /api/v1/time-tracking/billing-packs/:id/approve
   * Approve billing pack and optionally create invoice
   */
  async approve(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const firmId = req.user!.firm_id;
      const userId = req.user!.id;
      const { create_invoice } = req.body;

      const billingPack = await billingPackService.approve(
        id,
        firmId,
        userId,
        create_invoice || false,
        {
          ip: req.ip,
          userAgent: req.headers['user-agent']
        }
      );

      res.json({ data: billingPack });
    } catch (error: any) {
      console.error('Approve billing pack error:', error);
      res.status(400).json({ error: error.message || 'Failed to approve billing pack' });
    }
  }

  /**
   * GET /api/v1/time-tracking/billing-packs/stats
   * Get billing pack statistics
   */
  async getStats(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;

      const stats = await billingPackService.getStats(firmId);
      res.json({ data: stats });
    } catch (error: any) {
      console.error('Get billing pack stats error:', error);
      res.status(500).json({ error: error.message || 'Failed to get statistics' });
    }
  }
}

export const billingPackController = new BillingPackController();
