-- Demo user account
-- Password: Admin123! (bcrypt hashed)

INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) VALUES
    ('admin@crm.com', '$2b$10$rKvK8w9qJ7qZ5xYz5QqN4.vQ8xH6xN7X5Z9K8vQ8xH6xN7X5Z9K8v', 'Admin', 'User', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Note: In production, generate actual password hash using bcrypt
-- Example in Node.js: const hash = await bcrypt.hash('Admin123!', 10);
