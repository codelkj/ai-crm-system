/**
 * Bank Account Service
 * Handles CRUD operations for bank accounts
 */

import { v4 as uuidv4 } from 'uuid';
import pool from '../../../config/database';
import { BankAccount, CreateBankAccountDTO } from '../types/financial.types';
import { AppError } from '../../../shared/middleware/error-handler';

export class BankAccountService {
  /**
   * Create new bank account
   */
  static async create(data: CreateBankAccountDTO): Promise<BankAccount> {
    const id = uuidv4();
    const currency = data.currency || 'USD';

    const query = `
      INSERT INTO bank_accounts (
        id, account_name, account_number, bank_name, account_type, currency
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      id,
      data.account_name,
      data.account_number || null,
      data.bank_name,
      data.account_type,
      currency
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') { // Unique violation
        throw new AppError(409, 'Bank account with this account number already exists', 'DUPLICATE_ACCOUNT');
      }
      throw new AppError(500, 'Failed to create bank account', 'DATABASE_ERROR');
    }
  }

  /**
   * Get all bank accounts
   */
  static async getAll(): Promise<BankAccount[]> {
    const query = `
      SELECT * FROM bank_accounts
      ORDER BY created_at DESC
    `;

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new AppError(500, 'Failed to fetch bank accounts', 'DATABASE_ERROR');
    }
  }

  /**
   * Get bank account by ID
   */
  static async getById(id: string): Promise<BankAccount> {
    const query = `
      SELECT * FROM bank_accounts
      WHERE id = $1
    `;

    try {
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        throw new AppError(404, 'Bank account not found', 'ACCOUNT_NOT_FOUND');
      }

      return result.rows[0];
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to fetch bank account', 'DATABASE_ERROR');
    }
  }

  /**
   * Delete bank account
   */
  static async delete(id: string): Promise<void> {
    // Check if account has transactions
    const checkQuery = `
      SELECT COUNT(*) as count FROM transactions
      WHERE account_id = $1
    `;

    try {
      const checkResult = await pool.query(checkQuery, [id]);
      const transactionCount = parseInt(checkResult.rows[0].count);

      if (transactionCount > 0) {
        throw new AppError(
          400,
          'Cannot delete bank account with existing transactions',
          'ACCOUNT_HAS_TRANSACTIONS'
        );
      }

      const deleteQuery = `
        DELETE FROM bank_accounts
        WHERE id = $1
        RETURNING id
      `;

      const result = await pool.query(deleteQuery, [id]);

      if (result.rows.length === 0) {
        throw new AppError(404, 'Bank account not found', 'ACCOUNT_NOT_FOUND');
      }
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to delete bank account', 'DATABASE_ERROR');
    }
  }

  /**
   * Check if account exists
   */
  static async exists(id: string): Promise<boolean> {
    const query = `
      SELECT 1 FROM bank_accounts WHERE id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows.length > 0;
    } catch (error) {
      return false;
    }
  }
}
