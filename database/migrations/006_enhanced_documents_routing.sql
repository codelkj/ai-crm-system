/**
 * Phase 6: Enhanced Document Management & Department Routing
 * Document access control, routing rules, document types
 */

-- =====================================================
-- 1. EXTEND LEGAL_DOCUMENTS TABLE
-- =====================================================

ALTER TABLE legal_documents
    ADD COLUMN IF NOT EXISTS document_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS matter_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS tags TEXT[],
    ADD COLUMN IF NOT EXISTS access_level VARCHAR(20) DEFAULT 'matter_team'
        CHECK (access_level IN ('public', 'matter_team', 'partner_only', 'restricted')),
    ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS parent_document_id UUID REFERENCES legal_documents(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS last_accessed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS template_category VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_legal_docs_type ON legal_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_legal_docs_matter ON legal_documents(matter_id);
CREATE INDEX IF NOT EXISTS idx_legal_docs_tags ON legal_documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_legal_docs_access_level ON legal_documents(access_level);
CREATE INDEX IF NOT EXISTS idx_legal_docs_parent ON legal_documents(parent_document_id);

-- =====================================================
-- 2. DOCUMENT ACCESS LOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS document_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
    document_id UUID REFERENCES legal_documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'view', 'download', 'edit', 'delete', 'share'
    ip_address VARCHAR(45),
    user_agent TEXT,
    access_granted BOOLEAN DEFAULT true,
    denial_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_doc_access_logs_firm ON document_access_logs(firm_id);
CREATE INDEX idx_doc_access_logs_document ON document_access_logs(document_id);
CREATE INDEX idx_doc_access_logs_user ON document_access_logs(user_id);
CREATE INDEX idx_doc_access_logs_created ON document_access_logs(created_at DESC);

-- =====================================================
-- 3. DOCUMENT TYPES
-- =====================================================

CREATE TABLE IF NOT EXISTS document_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    required_for_fica BOOLEAN DEFAULT false,
    default_access_level VARCHAR(20) DEFAULT 'matter_team',
    icon VARCHAR(50),
    color VARCHAR(20),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(firm_id, code)
);

CREATE INDEX idx_document_types_firm ON document_types(firm_id);
CREATE INDEX idx_document_types_active ON document_types(active);

-- Seed default document types for all firms
INSERT INTO document_types (firm_id, name, code, description, default_access_level, icon, color, required_for_fica)
SELECT
    f.id,
    dt.name,
    dt.code,
    dt.description,
    dt.access_level,
    dt.icon,
    dt.color,
    dt.fica
FROM firms f
CROSS JOIN (VALUES
    ('Contract', 'contract', 'Contracts and agreements', 'matter_team', '📄', '#4CAF50', false),
    ('Mandate', 'mandate', 'Client mandate letters', 'matter_team', '✍️', '#2196F3', true),
    ('Court Filing', 'court_filing', 'Court documents and filings', 'matter_team', '⚖️', '#9C27B0', false),
    ('Correspondence', 'correspondence', 'Letters and emails', 'matter_team', '📧', '#FF9800', false),
    ('Evidence', 'evidence', 'Evidence and exhibits', 'restricted', '🔒', '#F44336', false),
    ('Invoice', 'invoice', 'Invoices and billing documents', 'partner_only', '💰', '#00BCD4', false),
    ('Research', 'research', 'Legal research and memoranda', 'matter_team', '📚', '#795548', false),
    ('Template', 'template', 'Document templates', 'public', '📋', '#607D8B', false),
    ('ID Document', 'id_document', 'Identification documents', 'restricted', '🆔', '#E91E63', true),
    ('Proof of Address', 'proof_address', 'Proof of residential address', 'restricted', '🏠', '#3F51B5', true),
    ('Financial Statement', 'financial', 'Financial statements and records', 'partner_only', '📊', '#009688', true),
    ('Company Registration', 'company_reg', 'Company registration documents', 'matter_team', '🏢', '#8BC34A', true),
    ('Resolution', 'resolution', 'Board resolutions', 'matter_team', '📝', '#CDDC39', false),
    ('Opinion', 'opinion', 'Legal opinions', 'matter_team', '💭', '#FFC107', false),
    ('Affidavit', 'affidavit', 'Sworn statements and affidavits', 'matter_team', '⚖️', '#FF5722', false)
) AS dt(name, code, description, access_level, icon, color, fica)
ON CONFLICT (firm_id, code) DO NOTHING;

-- =====================================================
-- 4. DEPARTMENT ROUTING RULES
-- =====================================================

CREATE TABLE IF NOT EXISTS routing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 0,
    conditions JSONB NOT NULL, -- Flexible JSON conditions
    assign_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    round_robin BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_routing_rules_firm ON routing_rules(firm_id);
CREATE INDEX idx_routing_rules_department ON routing_rules(department_id);
CREATE INDEX idx_routing_rules_priority ON routing_rules(priority DESC);
CREATE INDEX idx_routing_rules_active ON routing_rules(active);

-- Routing state for round-robin
CREATE TABLE IF NOT EXISTS routing_round_robin_state (
    department_id UUID PRIMARY KEY REFERENCES departments(id) ON DELETE CASCADE,
    last_assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assignment_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. DOCUMENT SHARING
-- =====================================================

CREATE TABLE IF NOT EXISTS document_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES legal_documents(id) ON DELETE CASCADE,
    shared_by UUID REFERENCES users(id) ON DELETE SET NULL,
    shared_with_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    shared_with_department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    permission VARCHAR(20) DEFAULT 'view' CHECK (permission IN ('view', 'edit', 'manage')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (shared_with_user_id IS NOT NULL OR shared_with_department_id IS NOT NULL)
);

CREATE INDEX idx_doc_shares_document ON document_shares(document_id);
CREATE INDEX idx_doc_shares_user ON document_shares(shared_with_user_id);
CREATE INDEX idx_doc_shares_department ON document_shares(shared_with_department_id);
CREATE INDEX idx_doc_shares_expires ON document_shares(expires_at) WHERE expires_at IS NOT NULL;

-- =====================================================
-- 6. VIEWS: DOCUMENT PERMISSIONS
-- =====================================================

CREATE OR REPLACE VIEW v_document_access AS
SELECT
    ld.id AS document_id,
    ld.title AS document_name,
    ld.document_type,
    ld.access_level,
    ld.matter_id AS matter_id,
    u.id AS user_id,
    u.first_name || ' ' || u.last_name AS user_name,
    r.level AS user_role_level,
    CASE
        -- Partners/Directors see everything
        WHEN r.level <= 1 THEN true
        -- Public documents accessible to all
        WHEN ld.access_level = 'public' THEN true
        -- Partner-only documents
        WHEN ld.access_level = 'partner_only' AND r.level <= 1 THEN true
        -- Matter team members
        WHEN ld.access_level = 'matter_team' AND EXISTS (
            SELECT 1 FROM matter_assignments ma
            WHERE ma.matter_id = ld.matter_id AND ma.user_id = u.id
        ) THEN true
        -- Document owner (skip for now as uploaded_by doesn't exist)
        -- WHEN ld.uploaded_by = u.id THEN true
        -- Explicitly shared
        WHEN EXISTS (
            SELECT 1 FROM document_shares ds
            WHERE ds.document_id = ld.id
            AND (ds.shared_with_user_id = u.id OR ds.shared_with_department_id IN (
                SELECT department_id FROM user_departments WHERE user_id = u.id
            ))
            AND (ds.expires_at IS NULL OR ds.expires_at > CURRENT_TIMESTAMP)
        ) THEN true
        ELSE false
    END AS can_access
FROM legal_documents ld
CROSS JOIN users u
LEFT JOIN roles r ON r.id = u.role_id
WHERE ld.firm_id = u.firm_id;

-- =====================================================
-- 7. FUNCTIONS: ROUTING HELPERS
-- =====================================================

-- Function to get next user in round-robin
CREATE OR REPLACE FUNCTION get_next_round_robin_user(dept_id UUID)
RETURNS UUID AS $$
DECLARE
    next_user_id UUID;
    last_user_id UUID;
BEGIN
    -- Get last assigned user
    SELECT last_assigned_user_id INTO last_user_id
    FROM routing_round_robin_state
    WHERE department_id = dept_id;

    -- Get next user in department
    SELECT u.id INTO next_user_id
    FROM users u
    JOIN user_departments ud ON ud.user_id = u.id
    WHERE ud.department_id = dept_id
    AND u.is_active = true
    AND (last_user_id IS NULL OR u.id > last_user_id)
    ORDER BY u.id
    LIMIT 1;

    -- If no next user found, wrap around to first user
    IF next_user_id IS NULL THEN
        SELECT u.id INTO next_user_id
        FROM users u
        JOIN user_departments ud ON ud.user_id = u.id
        WHERE ud.department_id = dept_id
        AND u.is_active = true
        ORDER BY u.id
        LIMIT 1;
    END IF;

    -- Update round-robin state
    INSERT INTO routing_round_robin_state (department_id, last_assigned_user_id, assignment_count, updated_at)
    VALUES (dept_id, next_user_id, 1, CURRENT_TIMESTAMP)
    ON CONFLICT (department_id) DO UPDATE SET
        last_assigned_user_id = next_user_id,
        assignment_count = routing_round_robin_state.assignment_count + 1,
        updated_at = CURRENT_TIMESTAMP;

    RETURN next_user_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Summary of changes:
-- ✓ Extended legal_documents with access control fields
-- ✓ document_access_logs table for audit trail
-- ✓ document_types table with 15 default types
-- ✓ routing_rules table for department routing
-- ✓ routing_round_robin_state for load balancing
-- ✓ document_shares table for explicit sharing
-- ✓ v_document_access view for permission checks
-- ✓ get_next_round_robin_user function for routing
