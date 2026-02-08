-- =====================================================
-- LegalNexus CRM - Phase 1: Multi-Tenancy Foundation
-- Migration 001: Multi-Tenancy & Legal Client Schema
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. FIRMS TABLE (Multi-Tenancy Core)
-- =====================================================

CREATE TABLE IF NOT EXISTS firms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100),
    vat_number VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    country VARCHAR(100) DEFAULT 'South Africa',
    phone VARCHAR(50),
    email VARCHAR(255),
    logo_url TEXT,
    banking_details JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_firms_active ON firms(active);

-- =====================================================
-- 2. DEPARTMENTS/PRACTICE AREAS
-- =====================================================

CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(firm_id, code)
);

CREATE INDEX IF NOT EXISTS idx_departments_firm ON departments(firm_id);
CREATE INDEX IF NOT EXISTS idx_departments_active ON departments(active);

-- =====================================================
-- 3. ROLES & PERMISSIONS (Legal-Specific)
-- =====================================================

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    level INTEGER NOT NULL, -- 1=Partner/Director, 2=Senior Associate, 3=Associate, 4=Candidate Attorney, 5=Admin, 6=Finance
    permissions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(firm_id, name)
);

CREATE INDEX IF NOT EXISTS idx_roles_firm ON roles(firm_id);
CREATE INDEX IF NOT EXISTS idx_roles_level ON roles(level);

-- =====================================================
-- 4. ADD FIRM_ID TO EXISTING TABLES
-- =====================================================

-- Add firm_id to users
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'firm_id') THEN
        ALTER TABLE users ADD COLUMN firm_id UUID REFERENCES firms(id) ON DELETE CASCADE;
        CREATE INDEX idx_users_firm ON users(firm_id);
    END IF;
END $$;

-- Add firm_id to companies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'companies' AND column_name = 'firm_id') THEN
        ALTER TABLE companies ADD COLUMN firm_id UUID REFERENCES firms(id) ON DELETE CASCADE;
        CREATE INDEX idx_companies_firm ON companies(firm_id);
    END IF;
END $$;

-- Add firm_id to contacts
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'contacts' AND column_name = 'firm_id') THEN
        ALTER TABLE contacts ADD COLUMN firm_id UUID REFERENCES firms(id) ON DELETE CASCADE;
        CREATE INDEX idx_contacts_firm ON contacts(firm_id);
    END IF;
END $$;

-- Add firm_id to deals
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'deals' AND column_name = 'firm_id') THEN
        ALTER TABLE deals ADD COLUMN firm_id UUID REFERENCES firms(id) ON DELETE CASCADE;
        CREATE INDEX idx_deals_firm ON deals(firm_id);
    END IF;
END $$;

-- Add firm_id to activities
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'activities' AND column_name = 'firm_id') THEN
        ALTER TABLE activities ADD COLUMN firm_id UUID REFERENCES firms(id) ON DELETE CASCADE;
        CREATE INDEX idx_activities_firm ON activities(firm_id);
    END IF;
END $$;

-- Add firm_id to transactions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'transactions' AND column_name = 'firm_id') THEN
        ALTER TABLE transactions ADD COLUMN firm_id UUID REFERENCES firms(id) ON DELETE CASCADE;
        CREATE INDEX idx_transactions_firm ON transactions(firm_id);
    END IF;
END $$;

-- Add firm_id to bank_accounts
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'bank_accounts' AND column_name = 'firm_id') THEN
        ALTER TABLE bank_accounts ADD COLUMN firm_id UUID REFERENCES firms(id) ON DELETE CASCADE;
        CREATE INDEX idx_bank_accounts_firm ON bank_accounts(firm_id);
    END IF;
END $$;

-- Add firm_id to legal_documents
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'legal_documents' AND column_name = 'firm_id') THEN
        ALTER TABLE legal_documents ADD COLUMN firm_id UUID REFERENCES firms(id) ON DELETE CASCADE;
        CREATE INDEX idx_legal_documents_firm ON legal_documents(firm_id);
    END IF;
END $$;

-- =====================================================
-- 5. EXTEND USERS TABLE FOR LEGAL ROLES
-- =====================================================

DO $$
BEGIN
    -- role_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'role_id') THEN
        ALTER TABLE users ADD COLUMN role_id UUID REFERENCES roles(id) ON DELETE SET NULL;
        CREATE INDEX idx_users_role ON users(role_id);
    END IF;

    -- employee_number
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'employee_number') THEN
        ALTER TABLE users ADD COLUMN employee_number VARCHAR(20);
    END IF;

    -- job_title
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'job_title') THEN
        ALTER TABLE users ADD COLUMN job_title VARCHAR(100);
    END IF;

    -- hourly_rate
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'hourly_rate') THEN
        ALTER TABLE users ADD COLUMN hourly_rate DECIMAL(10,2);
    END IF;

    -- is_attorney
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'is_attorney') THEN
        ALTER TABLE users ADD COLUMN is_attorney BOOLEAN DEFAULT false;
    END IF;

    -- bar_number
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'bar_number') THEN
        ALTER TABLE users ADD COLUMN bar_number VARCHAR(50);
    END IF;
END $$;

-- =====================================================
-- 6. USER DEPARTMENTS (Many-to-Many)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_departments (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    is_director BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, department_id)
);

CREATE INDEX IF NOT EXISTS idx_user_departments_user ON user_departments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_departments_dept ON user_departments(department_id);
CREATE INDEX IF NOT EXISTS idx_user_departments_director ON user_departments(is_director);

-- =====================================================
-- 7. EXTEND COMPANIES TABLE FOR LEGAL CLIENTS
-- =====================================================

DO $$
BEGIN
    -- client_type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'companies' AND column_name = 'client_type') THEN
        ALTER TABLE companies ADD COLUMN client_type VARCHAR(20) DEFAULT 'company'
            CHECK (client_type IN ('individual', 'company'));
    END IF;

    -- legal_entity_type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'companies' AND column_name = 'legal_entity_type') THEN
        ALTER TABLE companies ADD COLUMN legal_entity_type VARCHAR(50);
    END IF;

    -- registration_number
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'companies' AND column_name = 'registration_number') THEN
        ALTER TABLE companies ADD COLUMN registration_number VARCHAR(100);
    END IF;

    -- tax_number
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'companies' AND column_name = 'tax_number') THEN
        ALTER TABLE companies ADD COLUMN tax_number VARCHAR(50);
    END IF;

    -- primary_director_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'companies' AND column_name = 'primary_director_id') THEN
        ALTER TABLE companies ADD COLUMN primary_director_id UUID REFERENCES users(id) ON DELETE SET NULL;
        CREATE INDEX idx_companies_primary_director ON companies(primary_director_id);
    END IF;

    -- department_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'companies' AND column_name = 'department_id') THEN
        ALTER TABLE companies ADD COLUMN department_id UUID REFERENCES departments(id) ON DELETE SET NULL;
        CREATE INDEX idx_companies_department ON companies(department_id);
    END IF;

    -- risk_rating
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'companies' AND column_name = 'risk_rating') THEN
        ALTER TABLE companies ADD COLUMN risk_rating VARCHAR(10) DEFAULT 'low'
            CHECK (risk_rating IN ('low', 'medium', 'high'));
        CREATE INDEX idx_companies_risk_rating ON companies(risk_rating);
    END IF;

    -- fica_status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'companies' AND column_name = 'fica_status') THEN
        ALTER TABLE companies ADD COLUMN fica_status VARCHAR(20) DEFAULT 'not_started'
            CHECK (fica_status IN ('not_started', 'in_progress', 'complete', 'exception'));
        CREATE INDEX idx_companies_fica_status ON companies(fica_status);
    END IF;

    -- fica_completed_date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'companies' AND column_name = 'fica_completed_date') THEN
        ALTER TABLE companies ADD COLUMN fica_completed_date DATE;
    END IF;

    -- preferred_billing_date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'companies' AND column_name = 'preferred_billing_date') THEN
        ALTER TABLE companies ADD COLUMN preferred_billing_date INTEGER
            CHECK (preferred_billing_date >= 1 AND preferred_billing_date <= 31);
    END IF;

    -- billing_email
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'companies' AND column_name = 'billing_email') THEN
        ALTER TABLE companies ADD COLUMN billing_email VARCHAR(255);
    END IF;

    -- credit_limit
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'companies' AND column_name = 'credit_limit') THEN
        ALTER TABLE companies ADD COLUMN credit_limit DECIMAL(15,2);
    END IF;

    -- payment_terms
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'companies' AND column_name = 'payment_terms') THEN
        ALTER TABLE companies ADD COLUMN payment_terms INTEGER DEFAULT 30;
    END IF;
END $$;

-- =====================================================
-- 8. POPIA-COMPLIANT AUDIT LOGGING
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    changes JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_firm ON audit_logs(firm_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- =====================================================
-- 9. UPDATED_AT TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to new tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_firms_updated_at') THEN
        CREATE TRIGGER update_firms_updated_at BEFORE UPDATE ON firms
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_departments_updated_at') THEN
        CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_roles_updated_at') THEN
        CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

COMMENT ON TABLE firms IS 'Multi-tenant firms - core table for tenant isolation';
COMMENT ON TABLE departments IS 'Practice areas/departments within law firms';
COMMENT ON TABLE roles IS 'Legal-specific roles with hierarchical levels and permissions';
COMMENT ON TABLE audit_logs IS 'POPIA-compliant audit trail for all data access and modifications';
COMMENT ON COLUMN users.firm_id IS 'Multi-tenancy: Associates user with their firm';
COMMENT ON COLUMN companies.fica_status IS 'FICA compliance status tracking';
COMMENT ON COLUMN companies.risk_rating IS 'Client risk assessment (low/medium/high)';
