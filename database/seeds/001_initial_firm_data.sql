-- =====================================================
-- LegalNexus CRM - Seed Data
-- Initial Firm, Departments, and Roles
-- =====================================================

-- =====================================================
-- 1. CREATE DEFAULT FIRM
-- =====================================================

INSERT INTO firms (id, name, registration_number, vat_number, address, city, province, country, phone, email, banking_details, active)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'LegalNexus Law Firm',
    '2023/123456/07',
    '4123456789',
    '123 Legal Street, Cape Town Central',
    'Cape Town',
    'Western Cape',
    'South Africa',
    '+27 21 123 4567',
    'info@legalnexus.co.za',
    '{"bank": "Standard Bank", "account": "123456789", "branch": "051001", "account_type": "Business Current"}'::jsonb,
    true
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. CREATE PRACTICE AREAS/DEPARTMENTS
-- =====================================================

INSERT INTO departments (firm_id, name, code, description, active) VALUES
    (
        '00000000-0000-0000-0000-000000000001'::uuid,
        'Litigation',
        'LIT',
        'Civil and commercial litigation, dispute resolution, and court representation',
        true
    ),
    (
        '00000000-0000-0000-0000-000000000001'::uuid,
        'Corporate & Commercial',
        'CORP',
        'Corporate law, mergers & acquisitions, commercial contracts, and company secretarial services',
        true
    ),
    (
        '00000000-0000-0000-0000-000000000001'::uuid,
        'Conveyancing',
        'CONV',
        'Property transfers, mortgage bonds, and property-related legal services',
        true
    ),
    (
        '00000000-0000-0000-0000-000000000001'::uuid,
        'Labour & Employment',
        'LAB',
        'Labour law, employment contracts, CCMA representation, and workplace disputes',
        true
    ),
    (
        '00000000-0000-0000-0000-000000000001'::uuid,
        'Tax & Estate Planning',
        'TAX',
        'Tax advisory, estate planning, wills, trusts, and estate administration',
        true
    ),
    (
        '00000000-0000-0000-0000-000000000001'::uuid,
        'Family Law',
        'FAM',
        'Divorce, maintenance, custody, and family-related legal matters',
        true
    ),
    (
        '00000000-0000-0000-0000-000000000001'::uuid,
        'Intellectual Property',
        'IP',
        'Trademarks, patents, copyright, and IP protection services',
        true
    )
ON CONFLICT (firm_id, code) DO NOTHING;

-- =====================================================
-- 3. CREATE LEGAL ROLES
-- =====================================================

INSERT INTO roles (firm_id, name, description, level, permissions) VALUES
    (
        '00000000-0000-0000-0000-000000000001'::uuid,
        'Partner/Director',
        'Senior partner with full system access and strategic decision-making authority',
        1,
        '{
            "clients": ["create", "read", "update", "delete"],
            "matters": ["create", "read", "update", "delete", "assign", "close"],
            "documents": ["create", "read", "update", "delete", "all_access"],
            "financials": ["create", "read", "update", "delete", "approve"],
            "invoices": ["create", "read", "update", "delete", "send", "approve"],
            "time_entries": ["create", "read", "update", "delete", "approve"],
            "billing_packs": ["create", "read", "update", "delete", "send", "approve"],
            "users": ["create", "read", "update", "delete"],
            "reports": ["all"],
            "settings": ["manage"],
            "audit_logs": ["read"]
        }'::jsonb
    ),
    (
        '00000000-0000-0000-0000-000000000001'::uuid,
        'Senior Associate',
        'Senior attorney with extensive matter management and client oversight',
        2,
        '{
            "clients": ["create", "read", "update"],
            "matters": ["create", "read", "update", "assign"],
            "documents": ["create", "read", "update", "delete"],
            "financials": ["read"],
            "invoices": ["create", "read", "update"],
            "time_entries": ["create", "read", "update", "approve_own_team"],
            "users": ["read"],
            "reports": ["department", "own_matters"]
        }'::jsonb
    ),
    (
        '00000000-0000-0000-0000-000000000001'::uuid,
        'Associate',
        'Attorney handling matters with supervision',
        3,
        '{
            "clients": ["create", "read", "update"],
            "matters": ["create", "read", "update"],
            "documents": ["create", "read", "update"],
            "financials": ["read_own"],
            "invoices": ["read"],
            "time_entries": ["create", "read", "update"],
            "users": ["read"],
            "reports": ["own_matters"]
        }'::jsonb
    ),
    (
        '00000000-0000-0000-0000-000000000001'::uuid,
        'Candidate Attorney',
        'Trainee attorney with supervised access',
        4,
        '{
            "clients": ["read"],
            "matters": ["read", "update_assigned"],
            "documents": ["create", "read"],
            "financials": ["read_own"],
            "invoices": ["read"],
            "time_entries": ["create", "read"],
            "users": ["read"],
            "reports": ["own_time"]
        }'::jsonb
    ),
    (
        '00000000-0000-0000-0000-000000000001'::uuid,
        'Practice Manager',
        'Administrative oversight of practice operations',
        5,
        '{
            "clients": ["read", "update"],
            "matters": ["read", "update"],
            "documents": ["read"],
            "financials": ["read"],
            "invoices": ["read", "update"],
            "time_entries": ["read"],
            "users": ["create", "read", "update"],
            "reports": ["operational", "management"],
            "settings": ["manage_practice"]
        }'::jsonb
    ),
    (
        '00000000-0000-0000-0000-000000000001'::uuid,
        'Finance Manager',
        'Financial management and invoicing oversight',
        6,
        '{
            "clients": ["read"],
            "matters": ["read"],
            "documents": ["read"],
            "financials": ["create", "read", "update", "delete"],
            "invoices": ["create", "read", "update", "delete", "send"],
            "time_entries": ["read", "approve"],
            "users": ["read"],
            "reports": ["financial", "billing", "revenue"],
            "billing_packs": ["create", "read", "update", "send"]
        }'::jsonb
    ),
    (
        '00000000-0000-0000-0000-000000000001'::uuid,
        'Paralegal',
        'Legal support staff with document and administrative access',
        7,
        '{
            "clients": ["read", "update"],
            "matters": ["read", "update"],
            "documents": ["create", "read", "update"],
            "financials": ["read_assigned"],
            "invoices": ["read"],
            "time_entries": ["create", "read"],
            "users": ["read"],
            "reports": ["own_work"]
        }'::jsonb
    ),
    (
        '00000000-0000-0000-0000-000000000001'::uuid,
        'Secretary',
        'Administrative support with limited system access',
        8,
        '{
            "clients": ["read"],
            "matters": ["read"],
            "documents": ["read", "create"],
            "financials": [],
            "invoices": ["read"],
            "time_entries": ["read_own"],
            "users": ["read"],
            "reports": []
        }'::jsonb
    )
ON CONFLICT (firm_id, name) DO NOTHING;

-- =====================================================
-- 4. UPDATE EXISTING USERS TO DEFAULT FIRM
-- =====================================================

-- Set all existing users to default firm (if they don't have firm_id set)
UPDATE users
SET firm_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE firm_id IS NULL;

-- =====================================================
-- 5. UPDATE EXISTING COMPANIES TO DEFAULT FIRM
-- =====================================================

-- Set all existing companies to default firm
UPDATE companies
SET firm_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE firm_id IS NULL;

-- =====================================================
-- 6. UPDATE EXISTING DEALS TO DEFAULT FIRM
-- =====================================================

UPDATE deals
SET firm_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE firm_id IS NULL;

-- =====================================================
-- 7. UPDATE EXISTING CONTACTS TO DEFAULT FIRM
-- =====================================================

UPDATE contacts
SET firm_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE firm_id IS NULL;

-- =====================================================
-- 8. UPDATE EXISTING ACTIVITIES TO DEFAULT FIRM
-- =====================================================

UPDATE activities
SET firm_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE firm_id IS NULL;

-- =====================================================
-- 9. UPDATE EXISTING TRANSACTIONS TO DEFAULT FIRM
-- =====================================================

UPDATE transactions
SET firm_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE firm_id IS NULL;

-- =====================================================
-- 10. UPDATE EXISTING BANK ACCOUNTS TO DEFAULT FIRM
-- =====================================================

UPDATE bank_accounts
SET firm_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE firm_id IS NULL;

-- =====================================================
-- 11. UPDATE EXISTING LEGAL DOCUMENTS TO DEFAULT FIRM
-- =====================================================

UPDATE legal_documents
SET firm_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE firm_id IS NULL;

-- =====================================================
-- SEED DATA COMPLETE
-- =====================================================

-- Verification query
SELECT 'Firm created:' as status, name FROM firms WHERE id = '00000000-0000-0000-0000-000000000001'::uuid
UNION ALL
SELECT 'Departments created:', COUNT(*)::text FROM departments WHERE firm_id = '00000000-0000-0000-0000-000000000001'::uuid
UNION ALL
SELECT 'Roles created:', COUNT(*)::text FROM roles WHERE firm_id = '00000000-0000-0000-0000-000000000001'::uuid;
