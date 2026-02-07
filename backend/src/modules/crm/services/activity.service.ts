/**
 * Activity Service
 */

import { v4 as uuidv4 } from 'uuid';
import { Activity, CreateActivityDTO } from '../types/crm.types';
import { AppError } from '../../../shared/middleware/error-handler';
import { CompanyService } from './company.service';
import { ContactService } from './contact.service';

// Mock activity database
const mockActivities: Activity[] = [
  {
    id: uuidv4(),
    company_id: '',
    contact_id: '',
    deal_id: undefined,
    type: 'call',
    subject: 'Initial discovery call',
    description: 'Discussed project requirements and timeline',
    due_date: new Date('2024-01-20'),
    completed_at: new Date('2024-01-20'),
    created_at: new Date('2024-01-15'),
  },
  {
    id: uuidv4(),
    company_id: '',
    contact_id: '',
    deal_id: undefined,
    type: 'email',
    subject: 'Follow-up proposal',
    description: 'Sent detailed proposal and pricing information',
    due_date: undefined,
    completed_at: new Date('2024-01-21'),
    created_at: new Date('2024-01-20'),
  },
  {
    id: uuidv4(),
    company_id: '',
    contact_id: '',
    deal_id: undefined,
    type: 'meeting',
    subject: 'Quarterly business review',
    description: 'Review Q1 performance and discuss Q2 goals',
    due_date: new Date('2024-03-15'),
    completed_at: undefined,
    created_at: new Date('2024-02-01'),
  },
  {
    id: uuidv4(),
    company_id: '',
    contact_id: '',
    deal_id: undefined,
    type: 'note',
    subject: 'Client requirements update',
    description: 'Client requested additional features: API integration and custom reporting',
    due_date: undefined,
    completed_at: undefined,
    created_at: new Date('2024-01-22'),
  },
  {
    id: uuidv4(),
    company_id: '',
    contact_id: '',
    deal_id: undefined,
    type: 'call',
    subject: 'Technical consultation',
    description: 'Discussed technical architecture and integration options',
    due_date: new Date('2024-01-25'),
    completed_at: new Date('2024-01-25'),
    created_at: new Date('2024-01-23'),
  },
  {
    id: uuidv4(),
    company_id: '',
    contact_id: '',
    deal_id: undefined,
    type: 'meeting',
    subject: 'Contract negotiation',
    description: 'Finalize contract terms and pricing',
    due_date: new Date('2024-02-10'),
    completed_at: undefined,
    created_at: new Date('2024-02-01'),
  },
  {
    id: uuidv4(),
    company_id: '',
    contact_id: '',
    deal_id: undefined,
    type: 'email',
    subject: 'Product demo invitation',
    description: 'Invited client to exclusive product demo session',
    due_date: undefined,
    completed_at: new Date('2024-01-28'),
    created_at: new Date('2024-01-27'),
  },
  {
    id: uuidv4(),
    company_id: '',
    contact_id: '',
    deal_id: undefined,
    type: 'note',
    subject: 'Competitor analysis',
    description: 'Client is also evaluating Competitor X. Need to highlight our unique value proposition.',
    due_date: undefined,
    completed_at: undefined,
    created_at: new Date('2024-01-29'),
  },
  {
    id: uuidv4(),
    company_id: '',
    contact_id: '',
    deal_id: undefined,
    type: 'call',
    subject: 'Budget discussion',
    description: 'Discussed budget constraints and flexible payment options',
    due_date: new Date('2024-02-05'),
    completed_at: undefined,
    created_at: new Date('2024-02-03'),
  },
  {
    id: uuidv4(),
    company_id: '',
    contact_id: '',
    deal_id: undefined,
    type: 'meeting',
    subject: 'Kickoff meeting',
    description: 'Project kickoff with all stakeholders',
    due_date: new Date('2024-02-15'),
    completed_at: undefined,
    created_at: new Date('2024-02-05'),
  },
  {
    id: uuidv4(),
    company_id: '',
    contact_id: '',
    deal_id: undefined,
    type: 'email',
    subject: 'Contract signed confirmation',
    description: 'Confirmed receipt of signed contract and next steps',
    due_date: undefined,
    completed_at: new Date('2024-02-06'),
    created_at: new Date('2024-02-06'),
  },
  {
    id: uuidv4(),
    company_id: '',
    contact_id: '',
    deal_id: undefined,
    type: 'note',
    subject: 'Implementation timeline',
    description: 'Client prefers phased implementation starting Q2',
    due_date: undefined,
    completed_at: undefined,
    created_at: new Date('2024-02-07'),
  },
];

// Initialize activities with company and contact IDs
let initialized = false;
async function initializeActivities() {
  if (initialized) return;

  try {
    const companies = await CompanyService.getAll(1, 10);
    const contacts = await ContactService.getAll(1, 10);

    if (companies.data.length >= 3 && contacts.data.length >= 10) {
      // Acme Corporation activities (indices 0, 1, 3, 10)
      mockActivities[0].company_id = companies.data[0].id;
      mockActivities[0].contact_id = contacts.data[0].id; // John Smith

      mockActivities[1].company_id = companies.data[0].id;
      mockActivities[1].contact_id = contacts.data[1].id; // Sarah Johnson

      mockActivities[3].company_id = companies.data[0].id;
      mockActivities[3].contact_id = contacts.data[6].id; // Robert Anderson

      mockActivities[10].company_id = companies.data[0].id;
      mockActivities[10].contact_id = contacts.data[0].id; // John Smith

      // TechStart Inc activities (indices 2, 4, 6, 8)
      mockActivities[2].company_id = companies.data[1].id;
      mockActivities[2].contact_id = contacts.data[2].id; // Michael Brown

      mockActivities[4].company_id = companies.data[1].id;
      mockActivities[4].contact_id = contacts.data[3].id; // Emily Davis

      mockActivities[6].company_id = companies.data[1].id;
      mockActivities[6].contact_id = contacts.data[7].id; // Lisa Taylor

      mockActivities[8].company_id = companies.data[1].id;
      mockActivities[8].contact_id = contacts.data[2].id; // Michael Brown

      // Global Solutions LLC activities (indices 5, 7, 9, 11)
      mockActivities[5].company_id = companies.data[2].id;
      mockActivities[5].contact_id = contacts.data[4].id; // David Wilson

      mockActivities[7].company_id = companies.data[2].id;
      mockActivities[7].contact_id = contacts.data[5].id; // Jennifer Martinez

      mockActivities[9].company_id = companies.data[2].id;
      mockActivities[9].contact_id = contacts.data[8].id; // James Thomas

      mockActivities[11].company_id = companies.data[2].id;
      mockActivities[11].contact_id = contacts.data[4].id; // David Wilson
    }
    initialized = true;
  } catch (error) {
    console.error('Error initializing activities:', error);
  }
}

export class ActivityService {
  /**
   * Get all activities with pagination and filtering
   */
  static async getAll(
    page = 1,
    limit = 20,
    company_id?: string,
    contact_id?: string,
    deal_id?: string,
    type?: 'call' | 'email' | 'meeting' | 'note'
  ) {
    await initializeActivities();
    let filtered = [...mockActivities];

    // Filter by company
    if (company_id) {
      filtered = filtered.filter((a) => a.company_id === company_id);
    }

    // Filter by contact
    if (contact_id) {
      filtered = filtered.filter((a) => a.contact_id === contact_id);
    }

    // Filter by deal
    if (deal_id) {
      filtered = filtered.filter((a) => a.deal_id === deal_id);
    }

    // Filter by type
    if (type) {
      filtered = filtered.filter((a) => a.type === type);
    }

    // Sort by created_at (newest first)
    filtered.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

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
   * Get activity by ID
   */
  static async getById(id: string): Promise<Activity> {
    await initializeActivities();
    const activity = mockActivities.find((a) => a.id === id);
    if (!activity) {
      throw new AppError(404, 'Activity not found', 'ACTIVITY_NOT_FOUND');
    }
    return activity;
  }

  /**
   * Create new activity
   */
  static async create(data: CreateActivityDTO): Promise<Activity> {
    await initializeActivities();

    // Verify company exists
    await CompanyService.getById(data.company_id);

    // Verify contact exists if provided
    if (data.contact_id) {
      await ContactService.getById(data.contact_id);
    }

    const newActivity: Activity = {
      id: uuidv4(),
      company_id: data.company_id,
      contact_id: data.contact_id,
      deal_id: data.deal_id,
      type: data.type,
      subject: data.subject,
      description: data.description,
      due_date: data.due_date ? new Date(data.due_date) : undefined,
      completed_at: undefined,
      created_at: new Date(),
    };

    mockActivities.push(newActivity);
    return newActivity;
  }

  /**
   * Update activity
   */
  static async update(id: string, data: Partial<CreateActivityDTO>): Promise<Activity> {
    await initializeActivities();
    const index = mockActivities.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new AppError(404, 'Activity not found', 'ACTIVITY_NOT_FOUND');
    }

    // If updating company_id, verify it exists
    if (data.company_id) {
      await CompanyService.getById(data.company_id);
    }

    // Verify contact exists if provided
    if (data.contact_id) {
      await ContactService.getById(data.contact_id);
    }

    const updateData: any = { ...data };
    if (data.due_date) {
      updateData.due_date = new Date(data.due_date);
    }

    mockActivities[index] = {
      ...mockActivities[index],
      ...updateData,
    };

    return mockActivities[index];
  }

  /**
   * Delete activity
   */
  static async delete(id: string): Promise<void> {
    await initializeActivities();
    const index = mockActivities.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new AppError(404, 'Activity not found', 'ACTIVITY_NOT_FOUND');
    }

    mockActivities.splice(index, 1);
  }

  /**
   * Mark activity as completed
   */
  static async markCompleted(id: string): Promise<Activity> {
    await initializeActivities();
    const index = mockActivities.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new AppError(404, 'Activity not found', 'ACTIVITY_NOT_FOUND');
    }

    mockActivities[index].completed_at = new Date();
    return mockActivities[index];
  }
}
