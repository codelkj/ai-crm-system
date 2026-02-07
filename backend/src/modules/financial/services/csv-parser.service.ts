/**
 * CSV Parser Service
 * Handles parsing of CSV files from various bank formats
 */

import Papa from 'papaparse';
import fs from 'fs';
import {
  ParsedTransaction,
  CSVFormat,
  CSVColumnMapping,
  CSVParseOptions
} from '../types/financial.types';
import { AppError } from '../../../shared/middleware/error-handler';

export class CSVParserService {
  /**
   * Parse CSV file and return normalized transactions
   */
  static async parseCSV(
    filePath: string,
    options: CSVParseOptions = {}
  ): Promise<ParsedTransaction[]> {
    try {
      // Read file content
      const fileContent = fs.readFileSync(filePath, 'utf-8');

      // Detect format if not provided
      const format = options.format || this.detectCSVFormat(fileContent);

      // Get column mapping for the detected format
      const mapping = options.customMapping || this.getColumnMapping(format);

      // Parse CSV
      const parseResult = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim(),
      });

      if (parseResult.errors.length > 0) {
        throw new AppError(
          400,
          `CSV parsing errors: ${parseResult.errors.map(e => e.message).join(', ')}`,
          'CSV_PARSE_ERROR'
        );
      }

      const rows = parseResult.data as any[];
      const transactions: ParsedTransaction[] = [];
      const errors: Array<{ row: number; error: string }> = [];

      // Process each row
      for (let i = 0; i < rows.length; i++) {
        try {
          const transaction = this.normalizeTransaction(rows[i], mapping);
          transactions.push(transaction);
        } catch (error: any) {
          errors.push({
            row: i + 2, // +2 because: 1 for header, 1 for 0-based index
            error: error.message
          });
        }
      }

      // If there are too many errors, fail the entire import
      if (errors.length > 0) {
        const errorRate = errors.length / rows.length;
        if (errorRate > 0.1) { // More than 10% errors
          throw new AppError(
            400,
            `Too many parsing errors (${errors.length}/${rows.length}). Please check your CSV format.`,
            'CSV_PARSE_ERROR',
            errors
          );
        }
      }

      return transactions;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, `Failed to parse CSV: ${error.message}`, 'CSV_PARSE_ERROR');
    }
  }

  /**
   * Detect CSV format from file content
   */
  static detectCSVFormat(content: string): CSVFormat {
    const firstLine = content.split('\n')[0].toLowerCase();

    // Chase format
    if (firstLine.includes('posting date') && firstLine.includes('balance')) {
      return 'chase';
    }

    // Bank of America format
    if (firstLine.includes('posted date') && firstLine.includes('payee')) {
      return 'bank_of_america';
    }

    // Standard format
    if (firstLine.includes('date') && firstLine.includes('description') && firstLine.includes('amount')) {
      return 'standard';
    }

    // Default to standard
    return 'standard';
  }

  /**
   * Get column mapping for a given format
   */
  static getColumnMapping(format: CSVFormat): CSVColumnMapping {
    const mappings: Record<CSVFormat, CSVColumnMapping> = {
      standard: {
        date: 'date',
        description: 'description',
        amount: 'amount',
        type: 'type'
      },
      chase: {
        date: 'Posting Date',
        description: 'Description',
        amount: 'Amount',
        type: 'Type'
      },
      bank_of_america: {
        date: 'Posted Date',
        description: 'Payee',
        amount: 'Amount',
        type: 'Type'
      },
      custom: {
        date: 'date',
        description: 'description',
        amount: 'amount',
        type: 'type'
      }
    };

    return mappings[format];
  }

  /**
   * Normalize a CSV row into a ParsedTransaction
   */
  static normalizeTransaction(
    row: any,
    mapping: CSVColumnMapping
  ): ParsedTransaction {
    // Extract values using column mapping
    const dateStr = row[mapping.date];
    const description = row[mapping.description];
    const amountStr = row[mapping.amount];
    const typeStr = mapping.type ? row[mapping.type] : undefined;

    // Validate required fields
    if (!dateStr || !description || !amountStr) {
      throw new Error('Missing required fields: date, description, or amount');
    }

    // Parse date
    const date = this.parseDate(dateStr);
    if (!date || isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${dateStr}`);
    }

    // Parse amount
    const amount = this.parseAmount(amountStr);
    if (isNaN(amount)) {
      throw new Error(`Invalid amount: ${amountStr}`);
    }

    // Determine transaction type
    const type = this.determineType(amount, typeStr);

    return {
      date,
      description: description.trim(),
      amount: Math.abs(amount),
      type,
      raw_data: row
    };
  }

  /**
   * Parse date from various formats
   */
  static parseDate(dateStr: string): Date {
    // Try ISO format first
    let date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }

    // Try MM/DD/YYYY
    const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      const [, month, day, year] = match;
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    throw new Error(`Unable to parse date: ${dateStr}`);
  }

  /**
   * Parse amount from string (handles currency symbols, commas, negatives)
   */
  static parseAmount(amountStr: string): number {
    // Remove currency symbols, commas, and whitespace
    let cleaned = amountStr
      .replace(/[$,\s€£¥]/g, '')
      .trim();

    // Handle parentheses for negatives (accounting format)
    if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
      cleaned = '-' + cleaned.slice(1, -1);
    }

    const amount = parseFloat(cleaned);
    return amount;
  }

  /**
   * Determine transaction type (debit/credit)
   */
  static determineType(amount: number, typeStr?: string): 'debit' | 'credit' {
    // If type is explicitly provided
    if (typeStr) {
      const typeLower = typeStr.toLowerCase().trim();
      if (typeLower === 'debit' || typeLower === 'withdrawal' || typeLower === 'expense') {
        return 'debit';
      }
      if (typeLower === 'credit' || typeLower === 'deposit' || typeLower === 'income') {
        return 'credit';
      }
    }

    // Determine from amount sign
    // Negative amounts are debits (money out), positive are credits (money in)
    return amount < 0 ? 'debit' : 'credit';
  }
}
