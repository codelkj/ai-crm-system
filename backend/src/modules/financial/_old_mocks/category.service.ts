/**
 * Category Service
 */

import { v4 as uuidv4 } from 'uuid';
import {
  Category,
  CategoryType,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from '../types/financial.types';

class CategoryService {
  private categories: Category[] = [];

  constructor() {
    this.initializeMockCategories();
  }

  private initializeMockCategories(): void {
    const now = new Date();

    // Income categories
    const incomeCategories = [
      {
        id: uuidv4(),
        name: 'Salary',
        type: 'income' as CategoryType,
        description: 'Employee salaries and wages',
        color: '#10B981',
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Sales Revenue',
        type: 'income' as CategoryType,
        description: 'Revenue from product/service sales',
        color: '#059669',
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Consulting',
        type: 'income' as CategoryType,
        description: 'Consulting and professional services',
        color: '#047857',
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Investment Income',
        type: 'income' as CategoryType,
        description: 'Returns from investments',
        color: '#065F46',
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Other Income',
        type: 'income' as CategoryType,
        description: 'Miscellaneous income',
        color: '#34D399',
        created_at: now,
        updated_at: now,
      },
    ];

    // Expense categories
    const expenseCategories = [
      {
        id: uuidv4(),
        name: 'Rent',
        type: 'expense' as CategoryType,
        description: 'Office and property rent',
        color: '#EF4444',
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Utilities',
        type: 'expense' as CategoryType,
        description: 'Electricity, water, internet, etc.',
        color: '#DC2626',
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Payroll',
        type: 'expense' as CategoryType,
        description: 'Employee salaries and benefits',
        color: '#B91C1C',
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Software & Subscriptions',
        type: 'expense' as CategoryType,
        description: 'Software licenses and subscriptions',
        color: '#991B1B',
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Marketing',
        type: 'expense' as CategoryType,
        description: 'Marketing and advertising expenses',
        color: '#7F1D1D',
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Office Supplies',
        type: 'expense' as CategoryType,
        description: 'Office equipment and supplies',
        color: '#F87171',
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Travel',
        type: 'expense' as CategoryType,
        description: 'Business travel expenses',
        color: '#FCA5A5',
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Professional Services',
        type: 'expense' as CategoryType,
        description: 'Legal, accounting, consulting',
        color: '#FEE2E2',
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Insurance',
        type: 'expense' as CategoryType,
        description: 'Business insurance',
        color: '#DC2626',
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Other Expenses',
        type: 'expense' as CategoryType,
        description: 'Miscellaneous expenses',
        color: '#B91C1C',
        created_at: now,
        updated_at: now,
      },
    ];

    this.categories = [...incomeCategories, ...expenseCategories];
  }

  async getAll(): Promise<Category[]> {
    return this.categories;
  }

  async getById(id: string): Promise<Category | null> {
    return this.categories.find((cat) => cat.id === id) || null;
  }

  async getByType(type: CategoryType): Promise<Category[]> {
    return this.categories.filter((cat) => cat.type === type);
  }

  async create(data: CreateCategoryDTO): Promise<Category> {
    const category: Category = {
      id: uuidv4(),
      name: data.name,
      type: data.type,
      description: data.description,
      color: data.color || (data.type === 'income' ? '#10B981' : '#EF4444'),
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.categories.push(category);
    return category;
  }

  async update(id: string, data: UpdateCategoryDTO): Promise<Category | null> {
    const index = this.categories.findIndex((cat) => cat.id === id);
    if (index === -1) return null;

    this.categories[index] = {
      ...this.categories[index],
      ...data,
      updated_at: new Date(),
    };

    return this.categories[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.categories.findIndex((cat) => cat.id === id);
    if (index === -1) return false;

    this.categories.splice(index, 1);
    return true;
  }
}

export default new CategoryService();
