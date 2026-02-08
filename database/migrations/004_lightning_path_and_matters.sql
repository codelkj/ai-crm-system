-- =====================================================
-- PHASE 4: LIGHTNING PATH & MATTERS
-- Hybrid Pipeline System: Sales + Legal Intake
-- =====================================================

-- =====================================================
-- 1. LIGHTNING PATH STAGES (Legal Intake Pipeline)
-- =====================================================

CREATE TABLE lightning_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20),
    stage_order INTEGER NOT NULL,
    is_closed BOOLEAN DEFAULT false,
    closed_status VARCHAR(20) CHECK (closed_status IN ('won', 'lost', 'pass')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(firm_id, stage_order)
);

CREATE INDEX idx_lightning_stages_firm ON lightning_stages(firm_id);
CREATE INDEX idx_lightning_stages_order ON lightning_stages(firm_id, stage_order);

-- Seed default Lightning Path stages
INSERT INTO lightning_stages (firm_id, name, color, stage_order, is_closed, closed_status, description) VALUES
    (
        '00000000-0000-0000-0000-000000000001'::uuid,
        'Prospect',
        '#6366f1',
        1,
        false,
        NULL,
        'Initial contact or inquiry received'
    ),
    (
        '00000000-0000-0000-0000-000000000001'::uuid,
        'Contacted',
        '#8b5cf6',
        2,
        false,
        NULL,
        'Client contacted for initial consultation'
    ),
    (
        '00000000-0000-0000-0000-000000000001'::uuid,
        'Scoping',
        '#ec4899',
        3,
        false,
        NULL,
        'Defining scope of work and budget'
    ),
    (
        '00000000-0000-0000-0000-000000000001'::uuid,
        'Contract Negotiation',
        '#f59e0b',
        4,
        false,
        NULL,
        'Negotiating terms and contract'
    ),
    (
        '00000000-0000-0000-0000-000000000001'::uuid,
        'Closed - Won',
        '#10b981',
        5,
        true,
        'won',
        'Matter accepted and opened'
    ),
    (
        '00000000-0000-0000-0000-000000000001'::uuid,
        'Closed - Lost',
        '#ef4444',
        6,
        true,
        'lost',
        'Client chose another firm'
    ),
    (
        '00000000-0000-0000-0000-000000000001'::uuid,
        'Closed - Pass',
        '#6b7280',
        7,
        true,
        'pass',
        'Declined to take the matter'
    )
ON CONFLICT (firm_id, stage_order) DO NOTHING;

-- =====================================================
-- 2. EXTEND DEALS TABLE FOR MATTERS
-- =====================================================

-- Add matter-specific columns while keeping sales pipeline separate
ALTER TABLE deals
    ADD COLUMN IF NOT EXISTS pipeline_type VARCHAR(20) DEFAULT 'sales' CHECK (pipeline_type IN ('sales', 'legal')),
    ADD COLUMN IF NOT EXISTS lightning_stage_id UUID REFERENCES lightning_stages(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS matter_number VARCHAR(50),
    ADD COLUMN IF NOT EXISTS matter_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS lead_director_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS budget_hours DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS budget_amount DECIMAL(15,2),
    ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS actual_amount DECIMAL(15,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS burn_rate DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN budget_hours > 0 THEN (actual_hours / budget_hours) * 100 ELSE 0 END
    ) STORED,
    ADD COLUMN IF NOT EXISTS health_status VARCHAR(20) DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'warning', 'critical')),
    ADD COLUMN IF NOT EXISTS opened_date DATE,
    ADD COLUMN IF NOT EXISTS closed_date DATE,
    ADD COLUMN IF NOT EXISTS matter_status VARCHAR(20) DEFAULT 'active' CHECK (matter_status IN ('active', 'on_hold', 'closed', 'archived'));

-- Create indexes for matter queries
CREATE INDEX IF NOT EXISTS idx_deals_pipeline_type ON deals(pipeline_type);
CREATE INDEX IF NOT EXISTS idx_deals_lightning_stage ON deals(lightning_stage_id);
CREATE INDEX IF NOT EXISTS idx_deals_matter_number ON deals(matter_number) WHERE matter_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deals_department ON deals(department_id);
CREATE INDEX IF NOT EXISTS idx_deals_lead_director ON deals(lead_director_id);
CREATE INDEX IF NOT EXISTS idx_deals_matter_status ON deals(matter_status);
CREATE INDEX IF NOT EXISTS idx_deals_health_status ON deals(health_status);

-- Create sequence for matter numbers
CREATE SEQUENCE IF NOT EXISTS matter_number_seq START 1000;

-- =====================================================
-- 3. MATTER ASSIGNMENTS (Team Members)
-- =====================================================

CREATE TABLE matter_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    assigned_date DATE DEFAULT CURRENT_DATE,
    removed_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(matter_id, user_id, role)
);

CREATE INDEX idx_matter_assignments_matter ON matter_assignments(matter_id);
CREATE INDEX idx_matter_assignments_user ON matter_assignments(user_id);
CREATE INDEX idx_matter_assignments_active ON matter_assignments(is_active);

-- =====================================================
-- 4. MATTER SERVICES (Scope of Work)
-- =====================================================

CREATE TABLE matter_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    budgeted_hours DECIMAL(10,2),
    charge_out_rate DECIMAL(10,2),
    budgeted_amount DECIMAL(15,2) GENERATED ALWAYS AS (budgeted_hours * charge_out_rate) STORED,
    actual_hours DECIMAL(10,2) DEFAULT 0,
    actual_amount DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    service_order INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_matter_services_matter ON matter_services(matter_id);
CREATE INDEX idx_matter_services_status ON matter_services(status);

-- =====================================================
-- 5. STAGE TRANSITIONS (Audit Trail)
-- =====================================================

CREATE TABLE stage_transitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    from_stage_id UUID REFERENCES lightning_stages(id) ON DELETE SET NULL,
    to_stage_id UUID REFERENCES lightning_stages(id) ON DELETE SET NULL,
    transitioned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    transitioned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    duration_days INTEGER
);

CREATE INDEX idx_stage_transitions_matter ON stage_transitions(matter_id);
CREATE INDEX idx_stage_transitions_date ON stage_transitions(transitioned_at);

-- =====================================================
-- 6. TRIGGERS FOR AUTO-CALCULATIONS
-- =====================================================

-- Update actual hours/amount from time entries
CREATE OR REPLACE FUNCTION update_matter_actuals()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the matter's actual hours and amount
    UPDATE deals
    SET
        actual_hours = (
            SELECT COALESCE(SUM(duration_minutes) / 60.0, 0)
            FROM time_entries
            WHERE matter_id = NEW.matter_id
        ),
        actual_amount = (
            SELECT COALESCE(SUM(amount), 0)
            FROM time_entries
            WHERE matter_id = NEW.matter_id
        )
    WHERE id = NEW.matter_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_matter_actuals
    AFTER INSERT OR UPDATE OR DELETE ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_matter_actuals();

-- Auto-calculate health status based on burn rate
CREATE OR REPLACE FUNCTION update_matter_health_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.burn_rate >= 95 THEN
        NEW.health_status := 'critical';
    ELSIF NEW.burn_rate >= 80 THEN
        NEW.health_status := 'warning';
    ELSE
        NEW.health_status := 'healthy';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_matter_health_status
    BEFORE INSERT OR UPDATE ON deals
    FOR EACH ROW
    WHEN (NEW.pipeline_type = 'legal')
    EXECUTE FUNCTION update_matter_health_status();

-- Track stage transition duration
CREATE OR REPLACE FUNCTION calculate_stage_duration()
RETURNS TRIGGER AS $$
DECLARE
    prev_transition_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get the date of the previous transition
    SELECT transitioned_at INTO prev_transition_date
    FROM stage_transitions
    WHERE matter_id = NEW.matter_id
    ORDER BY transitioned_at DESC
    LIMIT 1;

    -- Calculate duration if there was a previous transition
    IF prev_transition_date IS NOT NULL THEN
        NEW.duration_days := EXTRACT(EPOCH FROM (NEW.transitioned_at - prev_transition_date)) / 86400;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_stage_duration
    BEFORE INSERT ON stage_transitions
    FOR EACH ROW
    EXECUTE FUNCTION calculate_stage_duration();

-- =====================================================
-- 7. VIEWS FOR REPORTING
-- =====================================================

-- Matter summary view with team and budget info
CREATE OR REPLACE VIEW matter_summary AS
SELECT
    d.id,
    d.firm_id,
    d.matter_number,
    d.title as matter_name,
    d.matter_type,
    d.company_id as client_id,
    c.name as client_name,
    d.department_id,
    dept.name as department_name,
    d.lead_director_id,
    CONCAT(lead.first_name, ' ', lead.last_name) as lead_director_name,
    d.lightning_stage_id,
    ls.name as stage_name,
    ls.color as stage_color,
    d.budget_hours,
    d.budget_amount,
    d.actual_hours,
    d.actual_amount,
    d.burn_rate,
    d.health_status,
    d.matter_status,
    d.opened_date,
    d.closed_date,
    d.value as estimated_value,
    (
        SELECT COUNT(*)
        FROM matter_assignments ma
        WHERE ma.matter_id = d.id AND ma.is_active = true
    ) as team_size,
    (
        SELECT COUNT(*)
        FROM time_entries te
        WHERE te.matter_id = d.id AND te.billed = false AND te.billable = true AND te.approved_by IS NOT NULL
    ) as unbilled_entries_count,
    d.created_at,
    d.updated_at
FROM deals d
LEFT JOIN companies c ON c.id = d.company_id
LEFT JOIN departments dept ON dept.id = d.department_id
LEFT JOIN users lead ON lead.id = d.lead_director_id
LEFT JOIN lightning_stages ls ON ls.id = d.lightning_stage_id
WHERE d.pipeline_type = 'legal';

-- Active matters by department
CREATE OR REPLACE VIEW matters_by_department AS
SELECT
    d.firm_id,
    dept.id as department_id,
    dept.name as department_name,
    COUNT(d.id) as total_matters,
    COUNT(CASE WHEN d.matter_status = 'active' THEN 1 END) as active_matters,
    COUNT(CASE WHEN d.health_status = 'critical' THEN 1 END) as critical_matters,
    SUM(d.budget_amount) as total_budget,
    SUM(d.actual_amount) as total_actual,
    AVG(d.burn_rate) as avg_burn_rate
FROM deals d
JOIN departments dept ON dept.id = d.department_id
WHERE d.pipeline_type = 'legal'
GROUP BY d.firm_id, dept.id, dept.name;

-- Matter stage pipeline (for Lightning Path Kanban)
CREATE OR REPLACE VIEW lightning_path_pipeline AS
SELECT
    ls.id as stage_id,
    ls.firm_id,
    ls.name as stage_name,
    ls.color as stage_color,
    ls.stage_order,
    ls.is_closed,
    COUNT(d.id) as matter_count,
    SUM(d.value) as total_value,
    AVG(CURRENT_DATE - d.created_at::date) as avg_days_in_stage
FROM lightning_stages ls
LEFT JOIN deals d ON d.lightning_stage_id = ls.id AND d.pipeline_type = 'legal' AND d.matter_status != 'archived'
GROUP BY ls.id, ls.firm_id, ls.name, ls.color, ls.stage_order, ls.is_closed
ORDER BY ls.stage_order;

-- Team workload by user
CREATE OR REPLACE VIEW team_workload AS
SELECT
    u.id as user_id,
    u.firm_id,
    CONCAT(u.first_name, ' ', u.last_name) as user_name,
    u.job_title,
    dept.name as department_name,
    COUNT(DISTINCT ma.matter_id) as assigned_matters,
    COUNT(DISTINCT CASE WHEN d.matter_status = 'active' THEN ma.matter_id END) as active_matters,
    SUM(CASE WHEN d.matter_status = 'active' THEN d.budget_hours ELSE 0 END) as total_budgeted_hours,
    SUM(CASE WHEN d.matter_status = 'active' THEN d.actual_hours ELSE 0 END) as total_actual_hours,
    (
        SELECT COUNT(*)
        FROM time_entries te
        WHERE te.user_id = u.id
        AND te.entry_date >= CURRENT_DATE - INTERVAL '30 days'
        AND te.approved_by IS NULL
    ) as pending_time_entries,
    (
        SELECT SUM(duration_minutes) / 60.0
        FROM time_entries te
        WHERE te.user_id = u.id
        AND te.entry_date >= CURRENT_DATE - INTERVAL '30 days'
    ) as hours_last_30_days
FROM users u
LEFT JOIN matter_assignments ma ON ma.user_id = u.id AND ma.is_active = true
LEFT JOIN deals d ON d.id = ma.matter_id
LEFT JOIN user_departments ud ON ud.user_id = u.id
LEFT JOIN departments dept ON dept.id = ud.department_id
WHERE u.is_attorney = true OR u.job_title IN ('Paralegal', 'Associate', 'Senior Associate', 'Candidate Attorney')
GROUP BY u.id, u.firm_id, u.first_name, u.last_name, u.job_title, dept.name;

-- =====================================================
-- 8. UPDATE PERMISSIONS FOR MATTERS
-- =====================================================

-- Update Partner/Director role to include matters permissions
UPDATE roles
SET permissions = jsonb_set(
    permissions,
    '{matters}',
    '["create", "read", "update", "delete", "assign", "close", "transfer"]'::jsonb
)
WHERE name = 'Partner/Director';

UPDATE roles
SET permissions = jsonb_set(
    permissions,
    '{lightning_path}',
    '["read", "move", "manage"]'::jsonb
)
WHERE name = 'Partner/Director';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Verification query
SELECT
    'Lightning Stages Created:' as status,
    COUNT(*)::text as count
FROM lightning_stages
WHERE firm_id = '00000000-0000-0000-0000-000000000001'::uuid
UNION ALL
SELECT
    'Matter Columns Added:',
    COUNT(column_name)::text
FROM information_schema.columns
WHERE table_name = 'deals' AND column_name IN ('pipeline_type', 'matter_number', 'lightning_stage_id');
