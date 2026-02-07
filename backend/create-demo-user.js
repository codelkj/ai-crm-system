/**
 * Create demo user for login
 * Email: admin@example.com
 * Password: password123
 */

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

async function createDemoUser() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Hash password
    const passwordHash = await bcrypt.hash('password123', 10);

    console.log('Creating demo user...');
    console.log('Email: admin@example.com');
    console.log('Password: password123');

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email)
       DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         role = EXCLUDED.role,
         is_active = EXCLUDED.is_active
       RETURNING id, email, first_name, last_name, role`,
      ['admin@example.com', passwordHash, 'Admin', 'User', 'admin', true]
    );

    console.log('✓ Demo user created successfully:');
    console.log(result.rows[0]);

  } catch (error) {
    console.error('Error creating demo user:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createDemoUser();
