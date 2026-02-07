# Database Schema Design

## Entity Relationship Diagram

```
┌─────────────────┐         ┌─────────────────┐
│    companies    │◄───────┤    contacts     │
│─────────────────│  1:N    │─────────────────│
│ id (PK)         │         │ id (PK)         │
│ name            │         │ company_id (FK) │
│ industry        │         │ first_name      │
│ website         │         │ last_name       │
│ phone           │         │ email           │
│ address         │         │ phone           │
│ city            │         │ position        │
│ state           │         │ is_primary      │
│ country         │         │ created_at      │
│ created_at      │         │ updated_at      │
│ updated_at      │         └─────────────────┘
└─────────────────┘                 │
        │                           │
        │ 1:N                       │ 1:N
        ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│      deals      │         │   activities    │
│─────────────────│         │─────────────────│
│ id (PK)         │         │ id (PK)         │
│ company_id (FK) │         │ contact_id (FK) │
│ contact_id (FK) │         │ company_id (FK) │
│ title           │         │ deal_id (FK)    │
│ value           │         │ type            │
│ stage_id (FK)   │         │ subject         │
│ probability     │         │ description     │
│ expected_close  │         │ due_date        │
│ created_at      │         │ completed_at    │
│ updated_at      │         │ created_at      │
└─────────────────┘         └─────────────────┘
        │
        │ N:1
        ▼
┌─────────────────┐
│  pipeline_stages│
│─────────────────│
│ id (PK)         │
│ name            │
│ order           │
│ probability     │
│ color           │
│ created_at      │
└─────────────────┘

┌─────────────────┐         ┌─────────────────┐
│ legal_documents │────────►│ extracted_terms │
│─────────────────│  1:N    │─────────────────│
│ id (PK)         │         │ id (PK)         │
│ company_id (FK) │         │ document_id (FK)│
│ deal_id (FK)    │         │ term_type       │
│ title           │         │ term_key        │
│ file_path       │         │ term_value      │
│ file_size       │         │ confidence      │
│ mime_type       │         │ page_number     │
│ upload_date     │         │ created_at      │
│ processed_at    │         └─────────────────┘
│ processing_status│
│ summary         │
│ created_at      │
└─────────────────┘

┌─────────────────┐         ┌─────────────────┐
│   bank_accounts │◄───────┤  transactions   │
│─────────────────│  1:N    │─────────────────│
│ id (PK)         │         │ id (PK)         │
│ account_name    │         │ account_id (FK) │
│ account_number  │         │ date            │
│ bank_name       │         │ description     │
│ account_type    │         │ amount          │
│ currency        │         │ type (debit/cr) │
│ created_at      │         │ category_id (FK)│
└─────────────────┘         │ ai_confidence   │
        │                   │ notes           │
        │ 1:N               │ created_at      │
        ▼                   └─────────────────┘
┌─────────────────┐                 │
│ cash_flow_proj  │                 │ N:1
│─────────────────│                 ▼
│ id (PK)         │         ┌─────────────────┐
│ account_id (FK) │         │   categories    │
│ projection_date │         │─────────────────│
│ projected_income│         │ id (PK)         │
│ projected_expense│        │ name            │
│ net_cash_flow   │         │ type (income/exp│
│ confidence      │         │ parent_id (FK)  │
│ created_at      │         │ created_at      │
└─────────────────┘         └─────────────────┘

┌─────────────────┐
│      users      │
│─────────────────│
│ id (PK)         │
│ email           │
│ password_hash   │
│ first_name      │
│ last_name       │
│ role            │
│ is_active       │
│ created_at      │
│ updated_at      │
│ last_login      │
└─────────────────┘
```

## Table Definitions

### Core CRM Tables

#### companies
```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    website VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_industry ON companies(industry);
```

#### contacts
```sql
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    position VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contacts_company_id ON contacts(company_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_name ON contacts(last_name, first_name);
```

#### activities
```sql
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL, -- 'call', 'email', 'meeting', 'note'
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activities_contact_id ON activities(contact_id);
CREATE INDEX idx_activities_company_id ON activities(company_id);
CREATE INDEX idx_activities_deal_id ON activities(deal_id);
CREATE INDEX idx_activities_due_date ON activities(due_date);
```

### Sales Pipeline Tables

#### pipeline_stages
```sql
CREATE TABLE pipeline_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    order INTEGER NOT NULL,
    probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
    color VARCHAR(7) DEFAULT '#cccccc',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(order)
);

-- Default stages
INSERT INTO pipeline_stages (name, order, probability, color) VALUES
    ('Lead', 1, 10, '#e3f2fd'),
    ('Qualified', 2, 25, '#bbdefb'),
    ('Proposal', 3, 50, '#64b5f6'),
    ('Negotiation', 4, 75, '#2196f3'),
    ('Won', 5, 100, '#4caf50'),
    ('Lost', 6, 0, '#f44336');
```

#### deals
```sql
CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    value DECIMAL(15, 2),
    stage_id UUID REFERENCES pipeline_stages(id) ON DELETE SET NULL,
    probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
    expected_close_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_deals_company_id ON deals(company_id);
CREATE INDEX idx_deals_stage_id ON deals(stage_id);
CREATE INDEX idx_deals_expected_close ON deals(expected_close_date);
```

### Legal Engine Tables

#### legal_documents
```sql
CREATE TABLE legal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    processing_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_legal_documents_company_id ON legal_documents(company_id);
CREATE INDEX idx_legal_documents_deal_id ON legal_documents(deal_id);
CREATE INDEX idx_legal_documents_status ON legal_documents(processing_status);
```

#### extracted_terms
```sql
CREATE TABLE extracted_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES legal_documents(id) ON DELETE CASCADE,
    term_type VARCHAR(100) NOT NULL, -- 'party', 'date', 'obligation', 'amount', 'clause'
    term_key VARCHAR(255) NOT NULL,
    term_value TEXT NOT NULL,
    confidence DECIMAL(5, 4), -- AI confidence score (0-1)
    page_number INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_extracted_terms_document_id ON extracted_terms(document_id);
CREATE INDEX idx_extracted_terms_type ON extracted_terms(term_type);
```

### Financial Tables

#### bank_accounts
```sql
CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(100),
    bank_name VARCHAR(255),
    account_type VARCHAR(50), -- 'checking', 'savings', 'credit'
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### categories
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, type)
);

-- Default categories
INSERT INTO categories (name, type) VALUES
    ('Sales Revenue', 'income'),
    ('Service Revenue', 'income'),
    ('Other Income', 'income'),
    ('Salaries', 'expense'),
    ('Rent', 'expense'),
    ('Utilities', 'expense'),
    ('Marketing', 'expense'),
    ('Office Supplies', 'expense'),
    ('Software', 'expense'),
    ('Other Expenses', 'expense');
```

#### transactions
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES bank_accounts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('debit', 'credit')),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    ai_confidence DECIMAL(5, 4), -- Categorization confidence
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
```

#### cash_flow_projections
```sql
CREATE TABLE cash_flow_projections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES bank_accounts(id) ON DELETE CASCADE,
    projection_date DATE NOT NULL,
    projected_income DECIMAL(15, 2) DEFAULT 0,
    projected_expenses DECIMAL(15, 2) DEFAULT 0,
    net_cash_flow DECIMAL(15, 2) GENERATED ALWAYS AS (projected_income - projected_expenses) STORED,
    confidence DECIMAL(5, 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(account_id, projection_date)
);

CREATE INDEX idx_cash_flow_account_id ON cash_flow_projections(account_id);
CREATE INDEX idx_cash_flow_date ON cash_flow_projections(projection_date);
```

### Authentication Table

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user', -- 'admin', 'manager', 'user'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
```

## Database Functions & Triggers

### Auto-update timestamp trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Normalization & Performance Notes

1. **3NF Compliance**: Schema is normalized to Third Normal Form
2. **Indexes**: Strategic indexes on foreign keys and frequently queried fields
3. **UUIDs**: Used for primary keys for distributed scalability
4. **Soft Deletes**: Consider adding `deleted_at` fields if needed
5. **Audit Trail**: Consider separate audit table for compliance
6. **Full-Text Search**: Add `tsvector` columns for document search if needed

## Data Integrity

- Foreign key constraints with appropriate CASCADE/SET NULL rules
- Check constraints on enums and ranges
- Unique constraints where business logic requires
- NOT NULL constraints on essential fields
