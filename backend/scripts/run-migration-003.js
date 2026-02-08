/**
 * Run Phase 3 Migration: Time Tracking & Billing Packs
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'crm_ai_db',
  user: 'crm_user',
  password: 'crm_password'
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('🔧 Running Phase 3 Migration: Time Tracking & Billing Packs...\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '../../database/migrations/003_time_tracking_and_billing.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Execute migration
    await client.query(sql);

    console.log('✅ Migration completed successfully!\n');

    // Verify tables created
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('time_entries', 'billing_packs', 'billing_pack_entries')
      ORDER BY table_name
    `);

    console.log('📊 Tables created:');
    tables.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    // Verify views created
    const views = await client.query(`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
        AND table_name LIKE '%billing%' OR table_name LIKE '%unbilled%' OR table_name LIKE '%time_entries%'
      ORDER BY table_name
    `);

    console.log('\n📋 Views created:');
    views.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    console.log('\n✨ Phase 3 database schema ready!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
