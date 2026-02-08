-- =====================================================
-- Phase 3: Time Tracking & Billing Packs
-- Migration: 003_time_tracking_and_billing.sql
-- =====================================================

-- Time Entries Table
-- Tracks billable hours with approval workflow
CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    matter_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    entry_date DATE NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    hourly_rate DECIMAL(10,2) NOT NULL CHECK (hourly_rate >= 0),
    -- Auto-calculate amount: (duration_minutes / 60.0) * hourly_rate
    amount DECIMAL(15,2) GENERATED ALWAYS AS ((duration_minutes / 60.0) * hourly_rate) STORED,
    description TEXT NOT NULL,
    billable BOOLEAN DEFAULT true,
    billed BOOLEAN DEFAULT false,
    invoice_line_item_id UUID REFERENCES invoice_line_items(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT time_entry_valid_approval CHECK (
        (approved_by IS NULL AND approved_at IS NULL) OR
        (approved_by IS NOT NULL AND approved_at IS NOT NULL)
    )
);

CREATE INDEX idx_time_entries_firm ON time_entries(firm_id);
CREATE INDEX idx_time_entries_matter ON time_entries(matter_id);
CREATE INDEX idx_time_entries_user ON time_entries(user_id);
CREATE INDEX idx_time_entries_date ON time_entries(entry_date);
CREATE INDEX idx_time_entries_billed ON time_entries(billed, billable) WHERE billable = true;
CREATE INDEX idx_time_entries_approved ON time_entries(approved_by, approved_at);

-- Billing Packs Table
-- Monthly billing summaries for clients
CREATE TABLE billing_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'sent', 'approved')),
    total_time_entries INTEGER DEFAULT 0,
    total_hours DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    generated_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT billing_pack_valid_period CHECK (period_end >= period_start)
);

CREATE INDEX idx_billing_packs_firm ON billing_packs(firm_id);
CREATE INDEX idx_billing_packs_client ON billing_packs(client_id);
CREATE INDEX idx_billing_packs_period ON billing_packs(period_start, period_end);
CREATE INDEX idx_billing_packs_status ON billing_packs(status);

-- Billing Pack Entries (Junction Table)
-- Links time entries to billing packs
CREATE TABLE billing_pack_entries (
    billing_pack_id UUID NOT NULL REFERENCES billing_packs(id) ON DELETE CASCADE,
    time_entry_id UUID NOT NULL REFERENCES time_entries(id) ON DELETE CASCADE,
    PRIMARY KEY (billing_pack_id, time_entry_id)
);

CREATE INDEX idx_billing_pack_entries_pack ON billing_pack_entries(billing_pack_id);
CREATE INDEX idx_billing_pack_entries_entry ON billing_pack_entries(time_entry_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Update time_entries.updated_at on modification
CREATE OR REPLACE FUNCTION update_time_entry_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER time_entries_updated_at
    BEFORE UPDATE ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_time_entry_timestamp();

-- Trigger: Update billing_packs.updated_at on modification
CREATE OR REPLACE FUNCTION update_billing_pack_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER billing_packs_updated_at
    BEFORE UPDATE ON billing_packs
    FOR EACH ROW
    EXECUTE FUNCTION update_billing_pack_timestamp();

-- Trigger: Recalculate billing pack totals when entries are added/removed
CREATE OR REPLACE FUNCTION recalculate_billing_pack_totals()
RETURNS TRIGGER AS $$
DECLARE
    pack_id UUID;
BEGIN
    -- Determine which billing pack to update
    IF TG_OP = 'DELETE' THEN
        pack_id := OLD.billing_pack_id;
    ELSE
        pack_id := NEW.billing_pack_id;
    END IF;

    -- Recalculate totals
    UPDATE billing_packs bp
    SET
        total_time_entries = (
            SELECT COUNT(*)
            FROM billing_pack_entries bpe
            WHERE bpe.billing_pack_id = bp.id
        ),
        total_hours = (
            SELECT COALESCE(SUM(te.duration_minutes / 60.0), 0)
            FROM billing_pack_entries bpe
            JOIN time_entries te ON te.id = bpe.time_entry_id
            WHERE bpe.billing_pack_id = bp.id
        ),
        total_amount = (
            SELECT COALESCE(SUM(te.amount), 0)
            FROM billing_pack_entries bpe
            JOIN time_entries te ON te.id = bpe.time_entry_id
            WHERE bpe.billing_pack_id = bp.id
        )
    WHERE bp.id = pack_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER billing_pack_entries_totals
    AFTER INSERT OR DELETE ON billing_pack_entries
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_billing_pack_totals();

-- =====================================================
-- VIEWS
-- =====================================================

-- View: Unbilled Hours Summary by Matter
CREATE OR REPLACE VIEW unbilled_hours_by_matter AS
SELECT
    te.firm_id,
    te.matter_id,
    d.title as matter_name,
    d.company_id as client_id,
    c.name as client_name,
    COUNT(te.id) as entry_count,
    SUM(te.duration_minutes) / 60.0 as total_hours,
    SUM(te.amount) as total_amount,
    MIN(te.entry_date) as earliest_date,
    MAX(te.entry_date) as latest_date
FROM time_entries te
LEFT JOIN deals d ON d.id = te.matter_id
LEFT JOIN companies c ON c.id = d.company_id
WHERE te.billable = true
  AND te.billed = false
  AND te.approved_by IS NOT NULL
GROUP BY te.firm_id, te.matter_id, d.title, d.company_id, c.name;

-- View: Unbilled Hours Summary by User
CREATE OR REPLACE VIEW unbilled_hours_by_user AS
SELECT
    te.firm_id,
    te.user_id,
    CONCAT(u.first_name, ' ', u.last_name) as user_name,
    COUNT(te.id) as entry_count,
    SUM(te.duration_minutes) / 60.0 as total_hours,
    SUM(te.amount) as total_amount,
    MIN(te.entry_date) as earliest_date,
    MAX(te.entry_date) as latest_date
FROM time_entries te
LEFT JOIN users u ON u.id = te.user_id
WHERE te.billable = true
  AND te.billed = false
  AND te.approved_by IS NOT NULL
GROUP BY te.firm_id, te.user_id, u.first_name, u.last_name;

-- View: Time Entries Pending Approval
CREATE OR REPLACE VIEW time_entries_pending_approval AS
SELECT
    te.id,
    te.firm_id,
    te.matter_id,
    d.title as matter_name,
    te.user_id,
    CONCAT(u.first_name, ' ', u.last_name) as user_name,
    te.entry_date,
    te.duration_minutes,
    te.duration_minutes / 60.0 as hours,
    te.hourly_rate,
    te.amount,
    te.description,
    te.created_at
FROM time_entries te
LEFT JOIN users u ON u.id = te.user_id
LEFT JOIN deals d ON d.id = te.matter_id
WHERE te.approved_by IS NULL
ORDER BY te.entry_date DESC, te.created_at DESC;

-- View: Billing Pack Summary
CREATE OR REPLACE VIEW billing_pack_summary AS
SELECT
    bp.id,
    bp.firm_id,
    bp.client_id,
    c.name as client_name,
    bp.period_start,
    bp.period_end,
    bp.status,
    bp.total_time_entries,
    bp.total_hours,
    bp.total_amount,
    bp.generated_by,
    CONCAT(u.first_name, ' ', u.last_name) as generated_by_name,
    bp.generated_at,
    bp.sent_at,
    bp.created_at
FROM billing_packs bp
LEFT JOIN companies c ON c.id = bp.client_id
LEFT JOIN users u ON u.id = bp.generated_by;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE time_entries IS 'Tracks billable time entries for legal matters with approval workflow';
COMMENT ON COLUMN time_entries.duration_minutes IS 'Duration in minutes (e.g., 90 for 1.5 hours)';
COMMENT ON COLUMN time_entries.amount IS 'Auto-calculated: (duration_minutes / 60) * hourly_rate';
COMMENT ON COLUMN time_entries.billable IS 'Whether this entry should be billed to client';
COMMENT ON COLUMN time_entries.billed IS 'Whether this entry has been included in an invoice';
COMMENT ON COLUMN time_entries.approved_by IS 'User who approved this entry (NULL = pending approval)';

COMMENT ON TABLE billing_packs IS 'Monthly billing summaries for client review before invoicing';
COMMENT ON COLUMN billing_packs.total_time_entries IS 'Auto-calculated count of linked time entries';
COMMENT ON COLUMN billing_packs.total_hours IS 'Auto-calculated sum of hours from linked entries';
COMMENT ON COLUMN billing_packs.total_amount IS 'Auto-calculated sum of amounts from linked entries';

COMMENT ON TABLE billing_pack_entries IS 'Links time entries to billing packs for monthly summaries';

COMMENT ON VIEW unbilled_hours_by_matter IS 'Summary of approved unbilled time grouped by matter';
COMMENT ON VIEW unbilled_hours_by_user IS 'Summary of approved unbilled time grouped by user';
COMMENT ON VIEW time_entries_pending_approval IS 'All time entries awaiting approval';
COMMENT ON VIEW billing_pack_summary IS 'Billing packs with client and user names joined';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
