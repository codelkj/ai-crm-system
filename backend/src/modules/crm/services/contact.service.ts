/**
 * Contact Service
 */

import { v4 as uuidv4 } from 'uuid';
import { Contact, CreateContactDTO } from '../types/crm.types';
import { AppError } from '../../../shared/middleware/error-handler';
import { CompanyService } from './company.service';

// Mock contact database
const mockContacts: Contact[] = [
  {
    id: uuidv4(),
    company_id: '',
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@acme.com',
    phone: '+1-555-0101',
    position: 'CEO',
    is_primary: true,
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-01-15'),
  },
  {
    id: uuidv4(),
    company_id: '',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@acme.com',
    phone: '+1-555-0102',
    position: 'CTO',
    is_primary: false,
    created_at: new Date('2024-01-16'),
    updated_at: new Date('2024-01-16'),
  },
  {
    id: uuidv4(),
    company_id: '',
    first_name: 'Michael',
    last_name: 'Brown',
    email: 'michael.brown@techstart.io',
    phone: '+1-555-0201',
    position: 'VP of Engineering',
    is_primary: true,
    created_at: new Date('2024-01-20'),
    updated_at: new Date('2024-01-20'),
  },
  {
    id: uuidv4(),
    company_id: '',
    first_name: 'Emily',
    last_name: 'Davis',
    email: 'emily.davis@techstart.io',
    phone: '+1-555-0202',
    position: 'Product Manager',
    is_primary: false,
    created_at: new Date('2024-01-21'),
    updated_at: new Date('2024-01-21'),
  },
  {
    id: uuidv4(),
    company_id: '',
    first_name: 'David',
    last_name: 'Wilson',
    email: 'david.wilson@globalsolutions.com',
    phone: '+1-555-0301',
    position: 'Managing Director',
    is_primary: true,
    created_at: new Date('2024-02-01'),
    updated_at: new Date('2024-02-01'),
  },
  {
    id: uuidv4(),
    company_id: '',
    first_name: 'Jennifer',
    last_name: 'Martinez',
    email: 'jennifer.martinez@globalsolutions.com',
    phone: '+1-555-0302',
    position: 'Senior Consultant',
    is_primary: false,
    created_at: new Date('2024-02-02'),
    updated_at: new Date('2024-02-02'),
  },
  {
    id: uuidv4(),
    company_id: '',
    first_name: 'Robert',
    last_name: 'Anderson',
    email: 'robert.anderson@acme.com',
    phone: '+1-555-0103',
    position: 'VP of Sales',
    is_primary: false,
    created_at: new Date('2024-01-17'),
    updated_at: new Date('2024-01-17'),
  },
  {
    id: uuidv4(),
    company_id: '',
    first_name: 'Lisa',
    last_name: 'Taylor',
    email: 'lisa.taylor@techstart.io',
    phone: '+1-555-0203',
    position: 'Marketing Director',
    is_primary: false,
    created_at: new Date('2024-01-22'),
    updated_at: new Date('2024-01-22'),
  },
  {
    id: uuidv4(),
    company_id: '',
    first_name: 'James',
    last_name: 'Thomas',
    email: 'james.thomas@globalsolutions.com',
    phone: '+1-555-0303',
    position: 'Business Analyst',
    is_primary: false,
    created_at: new Date('2024-02-03'),
    updated_at: new Date('2024-02-03'),
  },
  {
    id: uuidv4(),
    company_id: '',
    first_name: 'Patricia',
    last_name: 'Jackson',
    email: 'patricia.jackson@acme.com',
    phone: '+1-555-0104',
    position: 'CFO',
    is_primary: false,
    created_at: new Date('2024-01-18'),
    updated_at: new Date('2024-01-18'),
  },
];

// Initialize contacts with company IDs
let initialized = false;
async function initializeContacts() {
  if (initialized) return;

  try {
    const companies = await CompanyService.getAll(1, 10);
    if (companies.data.length >= 3) {
      // Acme Corporation contacts (indices 0, 1, 6, 9)
      mockContacts[0].company_id = companies.data[0].id;
      mockContacts[1].company_id = companies.data[0].id;
      mockContacts[6].company_id = companies.data[0].id;
      mockContacts[9].company_id = companies.data[0].id;

      // TechStart Inc contacts (indices 2, 3, 7)
      mockContacts[2].company_id = companies.data[1].id;
      mockContacts[3].company_id = companies.data[1].id;
      mockContacts[7].company_id = companies.data[1].id;

      // Global Solutions LLC contacts (indices 4, 5, 8)
      mockContacts[4].company_id = companies.data[2].id;
      mockContacts[5].company_id = companies.data[2].id;
      mockContacts[8].company_id = companies.data[2].id;
    }
    initialized = true;
  } catch (error) {
    console.error('Error initializing contacts:', error);
  }
}

export class ContactService {
  /**
   * Get all contacts with pagination and filtering
   */
  static async getAll(page = 1, limit = 20, company_id?: string, search?: string) {
    await initializeContacts();
    let filtered = [...mockContacts];

    // Filter by company
    if (company_id) {
      filtered = filtered.filter((c) => c.company_id === company_id);
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.first_name.toLowerCase().includes(searchLower) ||
          c.last_name.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower) ||
          c.position?.toLowerCase().includes(searchLower)
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
   * Get contact by ID
   */
  static async getById(id: string): Promise<Contact> {
    await initializeContacts();
    const contact = mockContacts.find((c) => c.id === id);
    if (!contact) {
      throw new AppError(404, 'Contact not found', 'CONTACT_NOT_FOUND');
    }
    return contact;
  }

  /**
   * Create new contact
   */
  static async create(data: CreateContactDTO): Promise<Contact> {
    await initializeContacts();

    // Verify company exists
    await CompanyService.getById(data.company_id);

    // Check if email already exists
    const existingContact = mockContacts.find((c) => c.email === data.email);
    if (existingContact) {
      throw new AppError(400, 'Contact with this email already exists', 'CONTACT_EXISTS');
    }

    const newContact: Contact = {
      id: uuidv4(),
      company_id: data.company_id,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      position: data.position,
      is_primary: data.is_primary ?? false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockContacts.push(newContact);
    return newContact;
  }

  /**
   * Update contact
   */
  static async update(id: string, data: Partial<CreateContactDTO>): Promise<Contact> {
    await initializeContacts();
    const index = mockContacts.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new AppError(404, 'Contact not found', 'CONTACT_NOT_FOUND');
    }

    // If updating company_id, verify it exists
    if (data.company_id) {
      await CompanyService.getById(data.company_id);
    }

    // Check if email already exists (excluding current contact)
    if (data.email) {
      const existingContact = mockContacts.find((c) => c.email === data.email && c.id !== id);
      if (existingContact) {
        throw new AppError(400, 'Contact with this email already exists', 'CONTACT_EXISTS');
      }
    }

    mockContacts[index] = {
      ...mockContacts[index],
      ...data,
      updated_at: new Date(),
    };

    return mockContacts[index];
  }

  /**
   * Delete contact
   */
  static async delete(id: string): Promise<void> {
    await initializeContacts();
    const index = mockContacts.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new AppError(404, 'Contact not found', 'CONTACT_NOT_FOUND');
    }

    mockContacts.splice(index, 1);
  }
}
