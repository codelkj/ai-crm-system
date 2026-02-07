/**
 * CRM Types
 */

export interface Company {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Contact {
  id: string;
  company_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position?: string;
  is_primary: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Activity {
  id: string;
  contact_id?: string;
  company_id: string;
  deal_id?: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  subject: string;
  description?: string;
  due_date?: Date;
  completed_at?: Date;
  created_at: Date;
}

export interface CreateCompanyDTO {
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface CreateContactDTO {
  company_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position?: string;
  is_primary?: boolean;
}

export interface CreateActivityDTO {
  contact_id?: string;
  company_id: string;
  deal_id?: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  subject: string;
  description?: string;
  due_date?: string;
}
