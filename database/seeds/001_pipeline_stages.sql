-- Seed data for pipeline stages

INSERT INTO pipeline_stages (name, "order", probability, color) VALUES
    ('Lead', 1, 10, '#e3f2fd'),
    ('Qualified', 2, 25, '#bbdefb'),
    ('Proposal', 3, 50, '#64b5f6'),
    ('Negotiation', 4, 75, '#2196f3'),
    ('Won', 5, 100, '#4caf50'),
    ('Lost', 6, 0, '#f44336')
ON CONFLICT DO NOTHING;
