/**
 * Phase 5: Maximum AI Integration
 * Vector embeddings, AI insights, semantic search
 */

-- =====================================================
-- 1. DOCUMENT EMBEDDINGS (for semantic search)
-- =====================================================
-- Note: pgvector extension disabled (not installed)
-- Embeddings stored as JSONB for now, can migrate to vector later

CREATE TABLE document_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES legal_documents(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    embedding JSONB, -- Will store as JSON array until pgvector is installed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_doc_embeddings_doc ON document_embeddings(document_id);
CREATE INDEX idx_doc_embeddings_text ON document_embeddings USING gin(to_tsvector('english', chunk_text));

-- =====================================================
-- 3. AI-GENERATED INSIGHTS
-- =====================================================

CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- 'client', 'matter', 'document'
    entity_id UUID NOT NULL,
    insight_type VARCHAR(50) NOT NULL, -- 'intake_classification', 'risk_score', 'fica_gap', 'contract_analysis', 'document_summary'
    insight_data JSONB NOT NULL,
    confidence DECIMAL(5,4),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_insights_firm ON ai_insights(firm_id);
CREATE INDEX idx_ai_insights_entity ON ai_insights(entity_type, entity_id);
CREATE INDEX idx_ai_insights_type ON ai_insights(insight_type);
CREATE INDEX idx_ai_insights_generated ON ai_insights(generated_at DESC);

-- =====================================================
-- 4. EXTEND COMPANIES TABLE FOR RISK SCORING
-- =====================================================

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS ai_risk_score DECIMAL(5,2),
    ADD COLUMN IF NOT EXISTS ai_risk_factors JSONB,
    ADD COLUMN IF NOT EXISTS ai_last_analyzed TIMESTAMP WITH TIME ZONE;

CREATE INDEX idx_companies_risk_score ON companies(ai_risk_score) WHERE ai_risk_score IS NOT NULL;

-- =====================================================
-- 5. EXTEND LEGAL_DOCUMENTS TABLE FOR AI PROCESSING
-- =====================================================

ALTER TABLE legal_documents
    ADD COLUMN IF NOT EXISTS ai_summary TEXT,
    ADD COLUMN IF NOT EXISTS ai_key_terms JSONB,
    ADD COLUMN IF NOT EXISTS ai_processed BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS ai_processed_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS ai_processing_error TEXT;

CREATE INDEX idx_legal_docs_ai_processed ON legal_documents(ai_processed, ai_processed_at);

-- =====================================================
-- 6. EXTEND DEALS TABLE FOR AI INSIGHTS
-- =====================================================

ALTER TABLE deals
    ADD COLUMN IF NOT EXISTS ai_intake_classification JSONB,
    ADD COLUMN IF NOT EXISTS ai_suggested_department_id UUID REFERENCES departments(id),
    ADD COLUMN IF NOT EXISTS ai_suggested_director_id UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS ai_classification_confidence DECIMAL(5,4);

CREATE INDEX idx_deals_ai_classification ON deals(ai_intake_classification) WHERE ai_intake_classification IS NOT NULL;

-- =====================================================
-- 7. FICA COMPLIANCE TRACKING
-- =====================================================

CREATE TABLE fica_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
    document_code VARCHAR(50) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    required_for_entity_type VARCHAR(20) NOT NULL CHECK (required_for_entity_type IN ('individual', 'company', 'both')),
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(firm_id, document_code)
);

CREATE INDEX idx_fica_documents_firm ON fica_documents(firm_id);
CREATE INDEX idx_fica_documents_entity_type ON fica_documents(required_for_entity_type);

-- Seed default FICA documents
INSERT INTO fica_documents (firm_id, document_code, document_name, required_for_entity_type, description)
SELECT
    f.id,
    doc.code,
    doc.name,
    doc.entity_type,
    doc.description
FROM firms f
CROSS JOIN (VALUES
    ('id_copy', 'Copy of ID/Passport', 'individual', 'Valid South African ID or passport copy'),
    ('proof_address', 'Proof of Residential Address', 'both', 'Utility bill, bank statement, or lease agreement (not older than 3 months)'),
    ('fica_form', 'FICA Declaration Form', 'both', 'Completed and signed FICA client declaration form'),
    ('tax_number', 'Tax Number Certificate', 'both', 'SARS tax number certificate or clearance'),
    ('company_reg', 'Company Registration Certificate (CK1)', 'company', 'CIPC registration certificate'),
    ('company_directors', 'Register of Directors and Members (CK2)', 'company', 'Current director and shareholder information'),
    ('financial_statements', 'Latest Financial Statements', 'company', 'Audited or management financial statements'),
    ('resolution', 'Board Resolution', 'company', 'Authorization to instruct attorneys'),
    ('beneficial_owners', 'Beneficial Ownership Declaration', 'company', 'Declaration of ultimate beneficial owners (>25% ownership)')
) AS doc(code, name, entity_type, description)
ON CONFLICT (firm_id, document_code) DO NOTHING;

CREATE TABLE client_fica_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    fica_document_id UUID REFERENCES fica_documents(id) ON DELETE CASCADE,
    legal_document_id UUID REFERENCES legal_documents(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'not_submitted' CHECK (status IN ('not_submitted', 'submitted', 'verified', 'expired', 'rejected')),
    submitted_date DATE,
    verified_date DATE,
    expiry_date DATE,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, fica_document_id)
);

CREATE INDEX idx_client_fica_client ON client_fica_documents(client_id);
CREATE INDEX idx_client_fica_status ON client_fica_documents(status);
CREATE INDEX idx_client_fica_expiry ON client_fica_documents(expiry_date) WHERE expiry_date IS NOT NULL;

-- =====================================================
-- 8. VIEW: FICA COMPLIANCE SUMMARY
-- =====================================================

CREATE OR REPLACE VIEW v_fica_compliance AS
SELECT
    c.id AS client_id,
    c.name AS client_name,
    c.client_type,
    c.fica_status,
    COUNT(DISTINCT fd.id) AS total_required_docs,
    COUNT(DISTINCT CASE WHEN cfd.status = 'verified' THEN cfd.id END) AS verified_docs,
    COUNT(DISTINCT CASE WHEN cfd.status = 'submitted' THEN cfd.id END) AS pending_docs,
    COUNT(DISTINCT CASE WHEN cfd.status IS NULL OR cfd.status = 'not_submitted' THEN fd.id END) AS missing_docs,
    ARRAY_AGG(DISTINCT fd.document_name) FILTER (WHERE cfd.status IS NULL OR cfd.status = 'not_submitted') AS missing_document_names,
    MAX(cfd.verified_date) AS last_verified_date,
    CASE
        WHEN COUNT(DISTINCT fd.id) = COUNT(DISTINCT CASE WHEN cfd.status = 'verified' THEN cfd.id END) THEN 'complete'
        WHEN COUNT(DISTINCT CASE WHEN cfd.status IN ('submitted', 'verified') THEN cfd.id END) > 0 THEN 'in_progress'
        ELSE 'not_started'
    END AS compliance_status
FROM companies c
LEFT JOIN fica_documents fd ON fd.firm_id = c.firm_id
    AND (fd.required_for_entity_type = c.client_type OR fd.required_for_entity_type = 'both')
    AND fd.active = true
LEFT JOIN client_fica_documents cfd ON cfd.client_id = c.id AND cfd.fica_document_id = fd.id
GROUP BY c.id, c.name, c.client_type, c.fica_status;

-- =====================================================
-- 9. FUNCTIONS: AI SEARCH HELPERS
-- =====================================================

-- Function to search documents by text (full-text search)
-- Note: Vector similarity search requires pgvector extension
CREATE OR REPLACE FUNCTION search_documents_by_text(
    search_query text,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    document_id UUID,
    chunk_text TEXT,
    chunk_index INTEGER,
    rank FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        de.document_id,
        de.chunk_text,
        de.chunk_index,
        ts_rank(to_tsvector('english', de.chunk_text), plainto_tsquery('english', search_query)) AS rank
    FROM document_embeddings de
    WHERE to_tsvector('english', de.chunk_text) @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Summary of changes:
-- ✓ document_embeddings table created (using JSONB for embeddings until pgvector installed)
-- ✓ ai_insights table created for storing AI analysis results
-- ✓ FICA compliance tracking (fica_documents, client_fica_documents)
-- ✓ Extended companies table with AI risk scoring fields
-- ✓ Extended legal_documents table with AI processing fields
-- ✓ Extended deals table with intake classification fields
-- ✓ v_fica_compliance view for compliance status
-- ✓ search_documents_by_text function for full-text search
-- Note: Vector similarity search requires pgvector extension (not currently installed)
