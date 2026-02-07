/**
 * Bank Account Controller
 */

import { Request, Response } from 'express';
import accountService from '../services/account.service';
import { CreateBankAccountDTO, UpdateBankAccountDTO } from '../types/financial.types';

class AccountController {
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const accounts = await accountService.getAll();
      res.json({
        success: true,
        data: accounts,
        count: accounts.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch accounts',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const account = await accountService.getById(id);

      if (!account) {
        res.status(404).json({
          success: false,
          error: 'Account not found',
        });
        return;
      }

      res.json({
        success: true,
        data: account,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch account',
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateBankAccountDTO = req.body;
      const account = await accountService.create(data);

      res.status(201).json({
        success: true,
        data: account,
        message: 'Account created successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create account',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateBankAccountDTO = req.body;
      const account = await accountService.update(id, data);

      if (!account) {
        res.status(404).json({
          success: false,
          error: 'Account not found',
        });
        return;
      }

      res.json({
        success: true,
        data: account,
        message: 'Account updated successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update account',
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await accountService.delete(id);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Account not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete account',
      });
    }
  }
}

export default new AccountController();
