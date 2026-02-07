-- Seed data for financial categories

INSERT INTO categories (name, type) VALUES
    -- Income categories
    ('Sales Revenue', 'income'),
    ('Service Revenue', 'income'),
    ('Consulting Revenue', 'income'),
    ('Other Income', 'income'),

    -- Expense categories
    ('Salaries & Wages', 'expense'),
    ('Rent', 'expense'),
    ('Utilities', 'expense'),
    ('Marketing & Advertising', 'expense'),
    ('Office Supplies', 'expense'),
    ('Software & Subscriptions', 'expense'),
    ('Professional Services', 'expense'),
    ('Travel & Entertainment', 'expense'),
    ('Insurance', 'expense'),
    ('Taxes', 'expense'),
    ('Other Expenses', 'expense')
ON CONFLICT (name, type) DO NOTHING;
