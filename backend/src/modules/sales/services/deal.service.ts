/**
 * Deal Service
 */

import { v4 as uuidv4 } from 'uuid';
import { Deal, CreateDealDTO, UpdateDealDTO, KanbanBoardResponse, KanbanColumn } from '../types/sales.types';
import { AppError } from '../../../shared/middleware/error-handler';
import { CompanyService } from '../../crm/services/company.service';
import { ContactService } from '../../crm/services/contact.service';
import { PipelineStageService } from './stage.service';

// Mock deals database - will be initialized with company and contact IDs
const mockDeals: Deal[] = [];

// Initialize deals with real company and contact IDs
let initialized = false;
async function initializeDeals() {
  if (initialized) return;

  try {
    const companies = await CompanyService.getAll(1, 10);
    const contacts = await ContactService.getAll(1, 20);
    const stages = await PipelineStageService.getAll();

    if (companies.data.length >= 3 && contacts.data.length >= 10 && stages.length >= 6) {
      const [leadStage, qualifiedStage, proposalStage, negotiationStage, wonStage, lostStage] = stages;

      // Lead stage deals (4 deals)
      mockDeals.push(
        {
          id: uuidv4(),
          title: 'Enterprise Software License',
          company_id: companies.data[0].id, // Acme Corporation
          contact_id: contacts.data[0].id, // John Smith
          stage_id: leadStage.id,
          value: 150000,
          currency: 'USD',
          probability: 20,
          expected_close_date: new Date('2024-04-15'),
          description: 'Initial inquiry about enterprise software licensing for 500+ users',
          created_at: new Date('2024-02-01'),
          updated_at: new Date('2024-02-01'),
        },
        {
          id: uuidv4(),
          title: 'Cloud Migration Project',
          company_id: companies.data[1].id, // TechStart Inc
          contact_id: contacts.data[2].id, // Michael Brown
          stage_id: leadStage.id,
          value: 85000,
          currency: 'USD',
          probability: 15,
          expected_close_date: new Date('2024-05-01'),
          description: 'Interested in migrating legacy systems to cloud infrastructure',
          created_at: new Date('2024-02-05'),
          updated_at: new Date('2024-02-05'),
        },
        {
          id: uuidv4(),
          title: 'Consulting Services Package',
          company_id: companies.data[2].id, // Global Solutions LLC
          contact_id: contacts.data[4].id, // David Wilson
          stage_id: leadStage.id,
          value: 45000,
          currency: 'USD',
          probability: 25,
          expected_close_date: new Date('2024-03-30'),
          description: 'Looking for strategic consulting on digital transformation',
          created_at: new Date('2024-02-10'),
          updated_at: new Date('2024-02-10'),
        },
        {
          id: uuidv4(),
          title: 'Mobile App Development',
          company_id: companies.data[0].id, // Acme Corporation
          contact_id: contacts.data[1].id, // Sarah Johnson
          stage_id: leadStage.id,
          value: 120000,
          currency: 'USD',
          probability: 10,
          expected_close_date: new Date('2024-06-15'),
          description: 'Custom mobile app for customer engagement',
          created_at: new Date('2024-02-12'),
          updated_at: new Date('2024-02-12'),
        }
      );

      // Qualified stage deals (3 deals)
      mockDeals.push(
        {
          id: uuidv4(),
          title: 'Annual Support Contract',
          company_id: companies.data[1].id, // TechStart Inc
          contact_id: contacts.data[3].id, // Emily Davis
          stage_id: qualifiedStage.id,
          value: 95000,
          currency: 'USD',
          probability: 40,
          expected_close_date: new Date('2024-03-25'),
          description: 'Premium support package with 24/7 coverage',
          created_at: new Date('2024-01-20'),
          updated_at: new Date('2024-02-08'),
        },
        {
          id: uuidv4(),
          title: 'Data Analytics Platform',
          company_id: companies.data[2].id, // Global Solutions LLC
          contact_id: contacts.data[5].id, // Jennifer Martinez
          stage_id: qualifiedStage.id,
          value: 175000,
          currency: 'USD',
          probability: 50,
          expected_close_date: new Date('2024-04-10'),
          description: 'BI and analytics solution for enterprise data',
          created_at: new Date('2024-01-25'),
          updated_at: new Date('2024-02-07'),
        },
        {
          id: uuidv4(),
          title: 'Security Audit & Compliance',
          company_id: companies.data[0].id, // Acme Corporation
          contact_id: contacts.data[6].id, // Robert Anderson
          stage_id: qualifiedStage.id,
          value: 62000,
          currency: 'USD',
          probability: 45,
          expected_close_date: new Date('2024-03-20'),
          description: 'Comprehensive security assessment and compliance certification',
          created_at: new Date('2024-01-28'),
          updated_at: new Date('2024-02-09'),
        }
      );

      // Proposal stage deals (3 deals)
      mockDeals.push(
        {
          id: uuidv4(),
          title: 'CRM Implementation',
          company_id: companies.data[1].id, // TechStart Inc
          contact_id: contacts.data[7].id, // Lisa Taylor
          stage_id: proposalStage.id,
          value: 135000,
          currency: 'USD',
          probability: 60,
          expected_close_date: new Date('2024-03-15'),
          description: 'Full CRM deployment with custom integrations',
          created_at: new Date('2024-01-15'),
          updated_at: new Date('2024-02-06'),
        },
        {
          id: uuidv4(),
          title: 'Infrastructure Upgrade',
          company_id: companies.data[2].id, // Global Solutions LLC
          contact_id: contacts.data[8].id, // James Thomas
          stage_id: proposalStage.id,
          value: 210000,
          currency: 'USD',
          probability: 65,
          expected_close_date: new Date('2024-03-28'),
          description: 'Network and server infrastructure modernization',
          created_at: new Date('2024-01-10'),
          updated_at: new Date('2024-02-05'),
        },
        {
          id: uuidv4(),
          title: 'Training Program',
          company_id: companies.data[0].id, // Acme Corporation
          contact_id: contacts.data[9].id, // Patricia Jackson
          stage_id: proposalStage.id,
          value: 48000,
          currency: 'USD',
          probability: 70,
          expected_close_date: new Date('2024-03-10'),
          description: 'Comprehensive staff training on new systems',
          created_at: new Date('2024-01-18'),
          updated_at: new Date('2024-02-04'),
        }
      );

      // Negotiation stage deals (2 deals)
      mockDeals.push(
        {
          id: uuidv4(),
          title: 'API Integration Suite',
          company_id: companies.data[1].id, // TechStart Inc
          contact_id: contacts.data[2].id, // Michael Brown
          stage_id: negotiationStage.id,
          value: 185000,
          currency: 'USD',
          probability: 80,
          expected_close_date: new Date('2024-03-05'),
          description: 'Custom API development and third-party integrations',
          created_at: new Date('2024-01-05'),
          updated_at: new Date('2024-02-03'),
        },
        {
          id: uuidv4(),
          title: 'Business Intelligence Dashboard',
          company_id: companies.data[0].id, // Acme Corporation
          contact_id: contacts.data[0].id, // John Smith
          stage_id: negotiationStage.id,
          value: 92000,
          currency: 'USD',
          probability: 85,
          expected_close_date: new Date('2024-02-28'),
          description: 'Executive dashboard with real-time analytics',
          created_at: new Date('2024-01-08'),
          updated_at: new Date('2024-02-02'),
        }
      );

      // Won stage deals (2 deals)
      mockDeals.push(
        {
          id: uuidv4(),
          title: 'E-commerce Platform',
          company_id: companies.data[2].id, // Global Solutions LLC
          contact_id: contacts.data[4].id, // David Wilson
          stage_id: wonStage.id,
          value: 250000,
          currency: 'USD',
          probability: 100,
          expected_close_date: new Date('2024-02-15'),
          description: 'Full-featured e-commerce solution with payment integration',
          created_at: new Date('2023-12-15'),
          updated_at: new Date('2024-02-15'),
        },
        {
          id: uuidv4(),
          title: 'Staff Augmentation',
          company_id: companies.data[1].id, // TechStart Inc
          contact_id: contacts.data[3].id, // Emily Davis
          stage_id: wonStage.id,
          value: 72000,
          currency: 'USD',
          probability: 100,
          expected_close_date: new Date('2024-02-10'),
          description: 'Three senior developers for 6-month engagement',
          created_at: new Date('2023-12-20'),
          updated_at: new Date('2024-02-10'),
        }
      );

      // Lost stage deal (1 deal)
      mockDeals.push({
        id: uuidv4(),
        title: 'Legacy System Maintenance',
        company_id: companies.data[0].id, // Acme Corporation
        contact_id: contacts.data[6].id, // Robert Anderson
        stage_id: lostStage.id,
        value: 38000,
        currency: 'USD',
        probability: 0,
        expected_close_date: new Date('2024-02-01'),
        description: 'Ongoing maintenance for legacy systems - went with competitor',
        created_at: new Date('2023-12-10'),
        updated_at: new Date('2024-01-30'),
      });
    }

    initialized = true;
  } catch (error) {
    console.error('Error initializing deals:', error);
  }
}

export class DealService {
  /**
   * Get all deals with pagination and filtering
   */
  static async getAll(page = 1, limit = 20, stage_id?: string, company_id?: string) {
    await initializeDeals();
    let filtered = [...mockDeals];

    // Filter by stage
    if (stage_id) {
      filtered = filtered.filter((d) => d.stage_id === stage_id);
    }

    // Filter by company
    if (company_id) {
      filtered = filtered.filter((d) => d.company_id === company_id);
    }

    // Sort by created_at descending
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
   * Get deal by ID
   */
  static async getById(id: string): Promise<Deal> {
    await initializeDeals();
    const deal = mockDeals.find((d) => d.id === id);
    if (!deal) {
      throw new AppError(404, 'Deal not found', 'DEAL_NOT_FOUND');
    }
    return deal;
  }

  /**
   * Create new deal
   */
  static async create(data: CreateDealDTO): Promise<Deal> {
    await initializeDeals();

    // Verify company exists
    await CompanyService.getById(data.company_id);

    // Verify contact exists
    await ContactService.getById(data.contact_id);

    // Verify stage exists
    await PipelineStageService.getById(data.stage_id);

    const newDeal: Deal = {
      id: uuidv4(),
      title: data.title,
      company_id: data.company_id,
      contact_id: data.contact_id,
      stage_id: data.stage_id,
      value: data.value,
      currency: data.currency || 'USD',
      probability: data.probability || 50,
      expected_close_date: data.expected_close_date ? new Date(data.expected_close_date) : undefined,
      description: data.description,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockDeals.push(newDeal);
    return newDeal;
  }

  /**
   * Update deal
   */
  static async update(id: string, data: UpdateDealDTO): Promise<Deal> {
    await initializeDeals();
    const index = mockDeals.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new AppError(404, 'Deal not found', 'DEAL_NOT_FOUND');
    }

    // Verify company exists if updating
    if (data.company_id) {
      await CompanyService.getById(data.company_id);
    }

    // Verify contact exists if updating
    if (data.contact_id) {
      await ContactService.getById(data.contact_id);
    }

    // Verify stage exists if updating
    if (data.stage_id) {
      await PipelineStageService.getById(data.stage_id);
    }

    mockDeals[index] = {
      ...mockDeals[index],
      ...data,
      expected_close_date: data.expected_close_date
        ? new Date(data.expected_close_date)
        : mockDeals[index].expected_close_date,
      updated_at: new Date(),
    };

    return mockDeals[index];
  }

  /**
   * Delete deal
   */
  static async delete(id: string): Promise<void> {
    await initializeDeals();
    const index = mockDeals.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new AppError(404, 'Deal not found', 'DEAL_NOT_FOUND');
    }

    mockDeals.splice(index, 1);
  }

  /**
   * Move deal to a different stage (for Kanban drag-and-drop)
   */
  static async moveToStage(id: string, stage_id: string): Promise<Deal> {
    await initializeDeals();
    const index = mockDeals.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new AppError(404, 'Deal not found', 'DEAL_NOT_FOUND');
    }

    // Verify stage exists
    await PipelineStageService.getById(stage_id);

    mockDeals[index].stage_id = stage_id;
    mockDeals[index].updated_at = new Date();

    return mockDeals[index];
  }

  /**
   * Get Kanban view - deals grouped by stage
   */
  static async getKanbanView(): Promise<any> {
    await initializeDeals();

    // Get all stages
    const stages = await PipelineStageService.getAll();

    // Attach deals to each stage
    const stagesWithDeals = stages.map((stage) => {
      const stageDeals = mockDeals.filter((d) => d.stage_id === stage.id);
      return {
        ...stage,
        deals: stageDeals.sort((a, b) => b.created_at.getTime() - a.created_at.getTime()),
      };
    });

    // Calculate totals
    const dealCount = mockDeals.length;
    const totalValue = mockDeals.reduce((sum, deal) => sum + deal.value, 0);

    return {
      stages: stagesWithDeals,
      dealCount,
      totalValue,
    };
  }
}
