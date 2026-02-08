/**
 * Time Entry Controller
 * Handles HTTP requests for time entry operations
 */

import { Request, Response } from 'express';
import { timeEntryService, CreateTimeEntryDTO, UpdateTimeEntryDTO } from '../services/time-entry.service';
import { AuthRequest } from '../../../shared/middleware/authenticate';

export class TimeEntryController {
  /**
   * GET /api/v1/time-tracking/entries
   * Get all time entries with filters
   */
  async getAll(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const filters = {
        matter_id: req.query.matter_id as string,
        user_id: req.query.user_id as string,
        start_date: req.query.start_date as string,
        end_date: req.query.end_date as string,
        billable: req.query.billable === 'true' ? true : req.query.billable === 'false' ? false : undefined,
        billed: req.query.billed === 'true' ? true : req.query.billed === 'false' ? false : undefined,
        approved: req.query.approved === 'true' ? true : req.query.approved === 'false' ? false : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };

      const result = await timeEntryService.getAll(firmId, filters);
      res.json(result);
    } catch (error: any) {
      console.error('Get time entries error:', error);
      res.status(500).json({ error: error.message || 'Failed to get time entries' });
    }
  }

  /**
   * GET /api/v1/time-tracking/entries/:id
   * Get time entry by ID
   */
  async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const firmId = req.user!.firm_id;

      const timeEntry = await timeEntryService.getById(id, firmId);
      if (!timeEntry) {
        return res.status(404).json({ error: 'Time entry not found' });
      }

      res.json({ data: timeEntry });
    } catch (error: any) {
      console.error('Get time entry error:', error);
      res.status(500).json({ error: error.message || 'Failed to get time entry' });
    }
  }

  /**
   * POST /api/v1/time-tracking/entries
   * Create time entry
   */
  async create(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const userId = req.user!.id;
      const data: CreateTimeEntryDTO = req.body;

      // Map 'date' to 'entry_date' if provided
      if (req.body.date && !req.body.entry_date) {
        data.entry_date = req.body.date;
      }

      const timeEntry = await timeEntryService.create(firmId, userId, data, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.status(201).json({ data: timeEntry });
    } catch (error: any) {
      console.error('Create time entry error:', error);
      res.status(400).json({ error: error.message || 'Failed to create time entry' });
    }
  }

  /**
   * PUT /api/v1/time-tracking/entries/:id
   * Update time entry
   */
  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const firmId = req.user!.firm_id;
      const userId = req.user!.id;
      const data: UpdateTimeEntryDTO = req.body;

      const timeEntry = await timeEntryService.update(id, firmId, userId, data, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({ data: timeEntry });
    } catch (error: any) {
      console.error('Update time entry error:', error);
      res.status(400).json({ error: error.message || 'Failed to update time entry' });
    }
  }

  /**
   * DELETE /api/v1/time-tracking/entries/:id
   * Delete time entry
   */
  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const firmId = req.user!.firm_id;
      const userId = req.user!.id;

      await timeEntryService.delete(id, firmId, userId, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({ message: 'Time entry deleted successfully' });
    } catch (error: any) {
      console.error('Delete time entry error:', error);
      res.status(400).json({ error: error.message || 'Failed to delete time entry' });
    }
  }

  /**
   * POST /api/v1/time-tracking/entries/:id/approve
   * Approve time entry
   */
  async approve(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const firmId = req.user!.firm_id;
      const approverId = req.user!.id;

      const timeEntry = await timeEntryService.approve(id, firmId, approverId, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({ data: timeEntry });
    } catch (error: any) {
      console.error('Approve time entry error:', error);
      res.status(400).json({ error: error.message || 'Failed to approve time entry' });
    }
  }

  /**
   * POST /api/v1/time-tracking/entries/:id/unapprove
   * Unapprove time entry
   */
  async unapprove(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const firmId = req.user!.firm_id;
      const userId = req.user!.id;

      const timeEntry = await timeEntryService.unapprove(id, firmId, userId, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({ data: timeEntry });
    } catch (error: any) {
      console.error('Unapprove time entry error:', error);
      res.status(400).json({ error: error.message || 'Failed to unapprove time entry' });
    }
  }

  /**
   * POST /api/v1/time-tracking/entries/bulk-approve
   * Bulk approve time entries
   */
  async bulkApprove(req: AuthRequest, res: Response) {
    try {
      const { ids } = req.body;
      const firmId = req.user!.firm_id;
      const approverId = req.user!.id;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Invalid IDs array' });
      }

      const count = await timeEntryService.bulkApprove(ids, firmId, approverId, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({ message: `${count} time entries approved`, count });
    } catch (error: any) {
      console.error('Bulk approve error:', error);
      res.status(400).json({ error: error.message || 'Failed to bulk approve' });
    }
  }

  /**
   * GET /api/v1/time-tracking/entries/unbilled/by-matter
   * Get unbilled hours summary by matter
   */
  async getUnbilledByMatter(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const matterId = req.query.matter_id as string;

      const result = await timeEntryService.getUnbilledByMatter(firmId, matterId);
      res.json({ data: result });
    } catch (error: any) {
      console.error('Get unbilled by matter error:', error);
      res.status(500).json({ error: error.message || 'Failed to get unbilled hours' });
    }
  }

  /**
   * GET /api/v1/time-tracking/entries/unbilled/by-user
   * Get unbilled hours summary by user
   */
  async getUnbilledByUser(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const userId = req.query.user_id as string;

      const result = await timeEntryService.getUnbilledByUser(firmId, userId);
      res.json({ data: result });
    } catch (error: any) {
      console.error('Get unbilled by user error:', error);
      res.status(500).json({ error: error.message || 'Failed to get unbilled hours' });
    }
  }

  /**
   * GET /api/v1/time-tracking/entries/pending-approval
   * Get time entries pending approval
   */
  async getPendingApproval(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;

      const result = await timeEntryService.getPendingApproval(firmId);
      res.json({ data: result });
    } catch (error: any) {
      console.error('Get pending approval error:', error);
      res.status(500).json({ error: error.message || 'Failed to get pending approvals' });
    }
  }

  /**
   * GET /api/v1/time-tracking/entries/stats
   * Get time entry statistics
   */
  async getStats(req: AuthRequest, res: Response) {
    try {
      const firmId = req.user!.firm_id;
      const startDate = req.query.start_date as string;
      const endDate = req.query.end_date as string;

      const stats = await timeEntryService.getStats(firmId, startDate, endDate);
      res.json({ data: stats });
    } catch (error: any) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: error.message || 'Failed to get statistics' });
    }
  }
}

export const timeEntryController = new TimeEntryController();
