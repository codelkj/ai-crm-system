-- =====================================================
-- LegalNexus CRM - Phase 2: Invoicing System
-- Migration 002: Invoice Management Schema
-- =====================================================

-- =====================================================
-- 1. INVOICES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL,
    client_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    matter_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled')),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    vat_rate DECIMAL(5,4) DEFAULT 0.15,
    vat_amount DECIMAL(15,2) GENERATED ALWAYS AS (subtotal * vat_rate) STORED,
    total DECIMAL(15,2) GENERATED ALWAYS AS (subtotal + (subtotal * vat_rate)) STORED,
    amount_paid DECIMAL(15,2) DEFAULT 0,
    balance_due DECIMAL(15,2) GENERATED ALWAYS AS ((subtotal + (subtotal * vat_rate)) - amount_paid) STORED,
    notes TEXT,
    terms TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    sent_date TIMESTAMP WITH TIME ZONE,
    paid_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(firm_id, invoice_number)
);

CREATE INDEX IF NOT EXISTS idx_invoices_firm ON invoices(firm_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_matter ON invoices(matter_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_created_by ON invoices(created_by);

-- =====================================================
-- 2. INVOICE LINE ITEMS
-- =====================================================

CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(15,2) NOT NULL,
    amount DECIMAL(15,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    line_order INTEGER NOT NULL,
    billable_type VARCHAR(50),
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice ON invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_reference ON invoice_line_items(billable_type, reference_id);

-- =====================================================
-- 3. INVOICE PAYMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS invoice_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50),
    reference VARCHAR(100),
    notes TEXT,
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice ON invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_date ON invoice_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_recorded_by ON invoice_payments(recorded_by);

-- =====================================================
-- 4. INVOICE NUMBER SEQUENCE
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1000;

-- =====================================================
-- 5. TRIGGERS
-- =====================================================

-- Update invoice updated_at timestamp
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_invoices_updated_at') THEN
        CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =====================================================
-- 6. VIEWS FOR REPORTING
-- =====================================================

CREATE OR REPLACE VIEW invoice_summary AS
SELECT
    i.id,
    i.firm_id,
    i.invoice_number,
    i.status,
    i.issue_date,
    i.due_date,
    c.name as client_name,
    i.total,
    i.amount_paid,
    i.balance_due,
    CASE
        WHEN i.status = 'paid' THEN 'paid'
        WHEN i.due_date < CURRENT_DATE AND i.status != 'paid' THEN 'overdue'
        WHEN i.due_date >= CURRENT_DATE THEN 'current'
        ELSE i.status
    END as payment_status,
    (CURRENT_DATE - i.due_date)::INTEGER as days_overdue
FROM invoices i
LEFT JOIN companies c ON i.client_id = c.id;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

COMMENT ON TABLE invoices IS 'Client invoices with automatic VAT calculation';
COMMENT ON TABLE invoice_line_items IS 'Line items for invoices (time entries, expenses, etc.)';
COMMENT ON TABLE invoice_payments IS 'Payment records against invoices';
COMMENT ON COLUMN invoices.vat_rate IS 'VAT rate applied (default 15% for South Africa)';
COMMENT ON COLUMN invoices.balance_due IS 'Calculated: total - amount_paid';
