/**
 * Transaction Service
 * Orchestrates CSV upload, parsing, categorization, and transaction management
 */

import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import pool from '../../../config/database';
import {
  Transaction,
  CreateTransactionDTO,
  TransactionFilters,
  TransactionProcessingResult,
  PaginatedResponse,
  UpdateTransactionCategoryDTO,
  CSVParseOptions
} from '../types/financial.types';
import { AppError } from '../../../shared/middleware/error-handler';
import { BankAccountService } from './bank-account.service';
import { CSVParserService } from './csv-parser.service';
import { CategorizationService } from './categorization.service';

export class TransactionService {
  /**
   * Process CSV upload: parse, categorize, and store transactions
   */
  static async processCSVUpload(
    filePath: string,
    accountId: string,
    options: CSVParseOptions = {}
  ): Promise<TransactionProcessingResult> {
    try {
      // 1. Verify account exists
      const accountExists = await BankAccountService.exists(accountId);
      if (!accountExists) {
        throw new AppError(404, 'Bank account not found', 'ACCOUNT_NOT_FOUND');
      }

      // 2. Parse CSV file
      const parsedTransactions = await CSVParserService.parseCSV(filePath, options);

      if (parsedTransactions.length === 0) {
        throw new AppError(400, 'No valid transactions found in CSV file', 'EMPTY_CSV');
      }

      // 3. Check for duplicates
      const { newTransactions, duplicates } = await this.filterDuplicates(
        accountId,
        parsedTransactions
      );

      // 4. Categorize transactions using AI
      const categorizations = await CategorizationService.batchCategorize(
        newTransactions.map(t => ({
          description: t.description,
          amount: t.amount,
          date: t.date,
          type: t.type
        }))
      );

      // 5. Insert transactions into database
      const insertedTransactions: Transaction[] = [];
      const errors: Array<{ row: number; error: string }> = [];

      for (let i = 0; i < newTransactions.length; i++) {
        try {
          const parsedTx = newTransactions[i];
          const categorization = categorizations[i];

          const transaction = await this.create({
            account_id: accountId,
            date: parsedTx.date,
            description: parsedTx.description,
            amount: parsedTx.amount,
            type: parsedTx.type,
            category_id: categorization.category_id,
            ai_confidence: categorization.confidence,
            notes: undefined
          });

          insertedTransactions.push(transaction);
        } catch (error: any) {
          errors.push({
            row: i + 2, // +2 for header and 0-based index
            error: error.message || 'Unknown error'
          });
        }
      }

      // 6. Delete uploaded CSV file
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error('Failed to delete uploaded CSV file:', error);
      }

      // 7. Return processing results
      return {
        total_processed: parsedTransactions.length,
        successful: insertedTransactions.length,
        failed: errors.length,
        duplicates: duplicates.length,
        transactions: insertedTransactions,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error: any) {
      // Clean up file on error
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupError) {
        console.error('Failed to delete CSV file after error:', cleanupError);
      }

      if (error instanceof AppError) throw error;
      throw new AppError(500, `CSV processing failed: ${error.message}`, 'CSV_PROCESS_ERROR');
    }
  }

  /**
   * Filter out duplicate transactions
   */
  private static async filterDuplicates(
    accountId: string,
    transactions: Array<{ date: Date; description: string; amount: number; type: 'debit' | 'credit' }>
  ): Promise<{
    newTransactions: typeof transactions;
    duplicates: typeof transactions;
  }> {
    const newTransactions: typeof transactions = [];
    const duplicates: typeof transactions = [];

    for (const transaction of transactions) {
      const isDuplicate = await this.checkDuplicate(
        accountId,
        transaction.date,
        transaction.description,
        transaction.amount
      );

      if (isDuplicate) {
        duplicates.push(transaction);
      } else {
        newTransactions.push(transaction);
      }
    }

    return { newTransactions, duplicates };
  }

  /**
   * Check if a transaction is a duplicate
   * Looks for exact match within last 30 days
   */
  private static async checkDuplicate(
    accountId: string,
    date: Date,
    description: string,
    amount: number
  ): Promise<boolean> {
    const query = `
      SELECT 1 FROM transactions
      WHERE account_id = $1
        AND date = $2
        AND description = $3
        AND amount = $4
        AND created_at >= NOW() - INTERVAL '30 days'
      LIMIT 1
    `;

    try {
      const result = await pool.query(query, [accountId, date, description, amount]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking duplicate:', error);
      return false;
    }
  }

  /**
   * Normalize transaction data from database (convert numeric strings to numbers)
   */
  private static normalizeTransaction(tx: any): Transaction {
    return {
      ...tx,
      amount: typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount,
      ai_confidence: tx.ai_confidence !== null && typeof tx.ai_confidence === 'string'
        ? parseFloat(tx.ai_confidence)
        : tx.ai_confidence
    };
  }

  /**
   * Create a single transaction
   */
  static async create(data: CreateTransactionDTO): Promise<Transaction> {
    const id = uuidv4();

    const query = `
      INSERT INTO transactions (
        id, account_id, date, description, amount, type, category_id, ai_confidence, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      id,
      data.account_id,
      data.date,
      data.description,
      data.amount,
      data.type,
      data.category_id || null,
      data.ai_confidence || null,
      data.notes || null
    ];

    try {
      const result = await pool.query(query, values);
      return this.normalizeTransaction(result.rows[0]);
    } catch (error: any) {
      throw new AppError(500, 'Failed to create transaction', 'DATABASE_ERROR');
    }
  }

  /**
   * Get all transactions with filtering and pagination
   */
  static async getAll(filters: TransactionFilters): Promise<PaginatedResponse<Transaction>> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    // Build dynamic WHERE clause
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (filters.account_id) {
      conditions.push(`t.account_id = $${paramIndex++}`);
      values.push(filters.account_id);
    }

    if (filters.type) {
      conditions.push(`t.type = $${paramIndex++}`);
      values.push(filters.type);
    }

    if (filters.category_id) {
      conditions.push(`t.category_id = $${paramIndex++}`);
      values.push(filters.category_id);
    }

    if (filters.date_from) {
      conditions.push(`t.date >= $${paramIndex++}`);
      values.push(filters.date_from);
    }

    if (filters.date_to) {
      conditions.push(`t.date <= $${paramIndex++}`);
      values.push(filters.date_to);
    }

    if (filters.min_amount !== undefined) {
      conditions.push(`t.amount >= $${paramIndex++}`);
      values.push(filters.min_amount);
    }

    if (filters.max_amount !== undefined) {
      conditions.push(`t.amount <= $${paramIndex++}`);
      values.push(filters.max_amount);
    }

    if (filters.search) {
      conditions.push(`t.description ILIKE $${paramIndex++}`);
      values.push(`%${filters.search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM transactions t
      ${whereClause}
    `;

    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated data with category name
    const dataQuery = `
      SELECT
        t.id,
        t.account_id,
        t.date,
        t.description,
        t.amount,
        t.type,
        t.category_id,
        c.name as category_name,
        t.ai_confidence,
        t.notes,
        t.created_at
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      ${whereClause}
      ORDER BY t.date DESC, t.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    values.push(limit, offset);

    try {
      const dataResult = await pool.query(dataQuery, values);

      return {
        data: dataResult.rows.map(row => this.normalizeTransaction(row)),
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error: any) {
      throw new AppError(500, 'Failed to fetch transactions', 'DATABASE_ERROR');
    }
  }

  /**
   * Get transaction by ID
   */
  static async getById(id: string): Promise<Transaction> {
    const query = `
      SELECT
        t.id,
        t.account_id,
        t.date,
        t.description,
        t.amount,
        t.type,
        t.category_id,
        c.name as category_name,
        t.ai_confidence,
        t.notes,
        t.created_at
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = $1
    `;

    try {
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        throw new AppError(404, 'Transaction not found', 'TRANSACTION_NOT_FOUND');
      }

      return this.normalizeTransaction(result.rows[0]);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to fetch transaction', 'DATABASE_ERROR');
    }
  }

  /**
   * Update transaction category (manual override)
   */
  static async updateCategory(
    id: string,
    data: UpdateTransactionCategoryDTO
  ): Promise<Transaction> {
    // Verify category exists
    const categoryQuery = `SELECT 1 FROM categories WHERE id = $1`;
    const categoryResult = await pool.query(categoryQuery, [data.category_id]);

    if (categoryResult.rows.length === 0) {
      throw new AppError(404, 'Category not found', 'CATEGORY_NOT_FOUND');
    }

    const query = `
      UPDATE transactions
      SET
        category_id = $1,
        notes = $2,
        ai_confidence = NULL
      WHERE id = $3
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        data.category_id,
        data.notes || null,
        id
      ]);

      if (result.rows.length === 0) {
        throw new AppError(404, 'Transaction not found', 'TRANSACTION_NOT_FOUND');
      }

      // Fetch with category name
      return await this.getById(id);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to update transaction', 'DATABASE_ERROR');
    }
  }
}
