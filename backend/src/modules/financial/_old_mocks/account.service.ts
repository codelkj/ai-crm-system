/**
 * Bank Account Service
 */

import { v4 as uuidv4 } from 'uuid';
import {
  BankAccount,
  CreateBankAccountDTO,
  UpdateBankAccountDTO,
} from '../types/financial.types';

class AccountService {
  private accounts: BankAccount[] = [];

  constructor() {
    this.initializeMockAccounts();
  }

  private initializeMockAccounts(): void {
    const now = new Date();

    this.accounts = [
      {
        id: uuidv4(),
        name: 'Business Checking',
        account_number: '****1234',
        bank_name: 'Chase Bank',
        account_type: 'checking',
        currency: 'USD',
        initial_balance: 50000,
        current_balance: 50000, // Will be calculated from transactions
        created_at: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Business Savings',
        account_number: '****5678',
        bank_name: 'Chase Bank',
        account_type: 'savings',
        currency: 'USD',
        initial_balance: 100000,
        current_balance: 100000,
        created_at: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Corporate Credit Card',
        account_number: '****9012',
        bank_name: 'American Express',
        account_type: 'credit',
        currency: 'USD',
        initial_balance: 0,
        current_balance: 0,
        created_at: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
        updated_at: now,
      },
    ];
  }

  async getAll(): Promise<BankAccount[]> {
    return this.accounts;
  }

  async getById(id: string): Promise<BankAccount | null> {
    return this.accounts.find((acc) => acc.id === id) || null;
  }

  async create(data: CreateBankAccountDTO): Promise<BankAccount> {
    const account: BankAccount = {
      id: uuidv4(),
      name: data.name,
      account_number: data.account_number,
      bank_name: data.bank_name,
      account_type: data.account_type,
      currency: data.currency || 'USD',
      initial_balance: data.initial_balance,
      current_balance: data.initial_balance,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.accounts.push(account);
    return account;
  }

  async update(
    id: string,
    data: UpdateBankAccountDTO
  ): Promise<BankAccount | null> {
    const index = this.accounts.findIndex((acc) => acc.id === id);
    if (index === -1) return null;

    this.accounts[index] = {
      ...this.accounts[index],
      ...data,
      updated_at: new Date(),
    };

    return this.accounts[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.accounts.findIndex((acc) => acc.id === id);
    if (index === -1) return false;

    this.accounts.splice(index, 1);
    return true;
  }

  async updateBalance(accountId: string, newBalance: number): Promise<void> {
    const account = await this.getById(accountId);
    if (account) {
      account.current_balance = newBalance;
      account.updated_at = new Date();
    }
  }

  async calculateBalance(
    accountId: string,
    transactions: Array<{
      account_id: string;
      type: string;
      amount: number;
    }>
  ): Promise<number> {
    const account = await this.getById(accountId);
    if (!account) return 0;

    let balance = account.initial_balance;

    const accountTransactions = transactions.filter(
      (t) => t.account_id === accountId
    );

    for (const transaction of accountTransactions) {
      if (transaction.type === 'income') {
        balance += transaction.amount;
      } else {
        balance -= transaction.amount;
      }
    }

    return balance;
  }
}

export default new AccountService();
