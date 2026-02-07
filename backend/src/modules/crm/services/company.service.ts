/**
 * Company Service
 */

import { v4 as uuidv4 } from 'uuid';
import { Company, CreateCompanyDTO } from '../types/crm.types';
import { AppError } from '../../../shared/middleware/error-handler';

// Mock company database
const mockCompanies: Company[] = [
  {
    id: uuidv4(),
    name: 'Acme Corporation',
    industry: 'Technology',
    website: 'https://acme.com',
    phone: '+1-555-0100',
    address: '123 Tech Street',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-01-15'),
  },
  {
    id: uuidv4(),
    name: 'TechStart Inc',
    industry: 'Software',
    website: 'https://techstart.io',
    phone: '+1-555-0200',
    address: '456 Innovation Drive',
    city: 'Austin',
    state: 'TX',
    country: 'USA',
    created_at: new Date('2024-01-20'),
    updated_at: new Date('2024-01-20'),
  },
  {
    id: uuidv4(),
    name: 'Global Solutions LLC',
    industry: 'Consulting',
    website: 'https://globalsolutions.com',
    phone: '+1-555-0300',
    address: '789 Business Plaza',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    created_at: new Date('2024-02-01'),
    updated_at: new Date('2024-02-01'),
  },
];

export class CompanyService {
  /**
   * Get all companies with pagination
   */
  static async getAll(page = 1, limit = 20, search?: string) {
    let filtered = [...mockCompanies];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.industry?.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    return {
      data: paginated,
      meta: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    };
  }

  /**
   * Get company by ID
   */
  static async getById(id: string): Promise<Company> {
    const company = mockCompanies.find((c) => c.id === id);
    if (!company) {
      throw new AppError(404, 'Company not found', 'COMPANY_NOT_FOUND');
    }
    return company;
  }

  /**
   * Create new company
   */
  static async create(data: CreateCompanyDTO): Promise<Company> {
    const newCompany: Company = {
      id: uuidv4(),
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockCompanies.push(newCompany);
    return newCompany;
  }

  /**
   * Update company
   */
  static async update(id: string, data: Partial<CreateCompanyDTO>): Promise<Company> {
    const index = mockCompanies.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new AppError(404, 'Company not found', 'COMPANY_NOT_FOUND');
    }

    mockCompanies[index] = {
      ...mockCompanies[index],
      ...data,
      updated_at: new Date(),
    };

    return mockCompanies[index];
  }

  /**
   * Delete company
   */
  static async delete(id: string): Promise<void> {
    const index = mockCompanies.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new AppError(404, 'Company not found', 'COMPANY_NOT_FOUND');
    }

    mockCompanies.splice(index, 1);
  }
}
