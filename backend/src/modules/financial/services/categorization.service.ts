/**
 * AI Categorization Service
 * Uses OpenAI to categorize financial transactions
 */

import pool from '../../../config/database';
import openai, { callAI } from '../../../config/ai';
import { Category, CategorizationResult } from '../types/financial.types';
import { CATEGORIZATION_PROMPT } from '../prompts/categorization.prompt';
import { AppError } from '../../../shared/middleware/error-handler';

export class CategorizationService {
  /**
   * Get all categories from database
   */
  static async getAllCategories(): Promise<Category[]> {
    const query = `
      SELECT id, name, type, parent_id, created_at
      FROM categories
      ORDER BY type, name
    `;

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new AppError(500, 'Failed to fetch categories', 'DATABASE_ERROR');
    }
  }

  /**
   * Categorize a single transaction using AI
   */
  static async categorizeTransaction(
    description: string,
    amount: number,
    date: Date,
    type: 'debit' | 'credit'
  ): Promise<CategorizationResult> {
    // If OpenAI is not configured, use fallback
    if (!openai) {
      return this.fallbackCategorization(type);
    }

    try {
      // Get all available categories
      const categories = await this.getAllCategories();

      // Determine transaction type (income/expense) from debit/credit
      const transactionType = type === 'credit' ? 'income' : 'expense';

      // Filter categories by type
      const relevantCategories = categories.filter(c => c.type === transactionType);

      if (relevantCategories.length === 0) {
        throw new AppError(500, `No categories found for type: ${transactionType}`, 'NO_CATEGORIES');
      }

      // Format categories for prompt
      const categoriesText = relevantCategories
        .map(c => `- ${c.name} (ID: ${c.id}, Type: ${c.type})`)
        .join('\n');

      // Build prompt
      const prompt = CATEGORIZATION_PROMPT
        .replace('{categories}', categoriesText)
        .replace('{date}', date.toISOString().split('T')[0])
        .replace('{description}', description)
        .replace('{amount}', amount.toString())
        .replace('{type}', type);

      // Call OpenAI with retry logic
      let retries = 3;
      let lastError: any;

      while (retries > 0) {
        try {
          const responseText = await callAI(prompt, {
            response_format: { type: 'json_object' }
          });

          if (!responseText) {
            throw new Error('Empty response from AI');
          }

          // Parse JSON response
          const result = JSON.parse(responseText);

          // Validate response structure
          if (!result.category_id || !result.category_name || result.confidence === undefined) {
            throw new Error('Invalid response structure from AI');
          }

          // Verify category exists
          const categoryExists = relevantCategories.some(c => c.id === result.category_id);
          if (!categoryExists) {
            throw new Error(`Invalid category_id returned: ${result.category_id}`);
          }

          return {
            category_id: result.category_id,
            category_name: result.category_name,
            confidence: parseFloat(result.confidence),
            reasoning: result.reasoning || 'AI categorization'
          };
        } catch (error: any) {
          lastError = error;
          retries--;

          if (retries > 0) {
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
          }
        }
      }

      // If all retries failed, use fallback
      console.error('AI categorization failed after retries:', lastError);
      return this.fallbackCategorization(type);
    } catch (error: any) {
      console.error('Error in categorizeTransaction:', error);
      return this.fallbackCategorization(type);
    }
  }

  /**
   * Batch categorize multiple transactions
   * Process in chunks to avoid overwhelming the API
   */
  static async batchCategorize(
    transactions: Array<{
      description: string;
      amount: number;
      date: Date;
      type: 'debit' | 'credit';
    }>
  ): Promise<CategorizationResult[]> {
    const results: CategorizationResult[] = [];
    const BATCH_SIZE = 10;

    // Process in batches
    for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
      const batch = transactions.slice(i, i + BATCH_SIZE);

      // Process batch in parallel
      const batchResults = await Promise.all(
        batch.map(t =>
          this.categorizeTransaction(t.description, t.amount, t.date, t.type)
        )
      );

      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Fallback categorization when AI is unavailable
   */
  private static async fallbackCategorization(type: 'debit' | 'credit'): Promise<CategorizationResult> {
    const categories = await this.getAllCategories();
    const transactionType = type === 'credit' ? 'income' : 'expense';

    // Find "Other" category
    const otherCategory = categories.find(
      c => c.type === transactionType && (
        c.name === 'Other Income' ||
        c.name === 'Other Expenses' ||
        c.name.toLowerCase().includes('other')
      )
    );

    if (otherCategory) {
      return {
        category_id: otherCategory.id,
        category_name: otherCategory.name,
        confidence: 0.5,
        reasoning: 'Fallback categorization (AI unavailable)'
      };
    }

    // Use first category of matching type
    const fallbackCategory = categories.find(c => c.type === transactionType);
    if (fallbackCategory) {
      return {
        category_id: fallbackCategory.id,
        category_name: fallbackCategory.name,
        confidence: 0.3,
        reasoning: 'Fallback categorization (AI unavailable)'
      };
    }

    throw new AppError(500, `No categories available for type: ${transactionType}`, 'NO_CATEGORIES');
  }
}
