/**
 * Run Phase 4 Migration: Lightning Path & Matters
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'crm_ai_db',
  user: 'crm_user',
  password: 'crm_password'
});

async function runMigration() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  PHASE 4: LIGHTNING PATH & MATTERS - DATABASE MIGRATION    ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '004_lightning_path_and_matters.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Running migration script...\n');

    // Execute migration
    await pool.query(migrationSQL);

    console.log('✅ Migration completed successfully!\n');

    // Verify results
    const verification = await pool.query(`
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
      WHERE table_name = 'deals' AND column_name IN ('pipeline_type', 'matter_number', 'lightning_stage_id', 'department_id', 'lead_director_id')
    `);

    console.log('📊 Verification Results:');
    verification.rows.forEach(row => {
      console.log(`   ${row.status} ${row.count}`);
    });

    // Check views created
    const views = await pool.query(`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public' AND table_name IN (
        'matter_summary',
        'matters_by_department',
        'lightning_path_pipeline',
        'team_workload'
      )
    `);

    console.log(`\n📈 Views Created: ${views.rows.length}`);
    views.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    // Check tables created
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name IN (
        'lightning_stages',
        'matter_assignments',
        'matter_services',
        'stage_transitions'
      )
    `);

    console.log(`\n📋 Tables Created: ${tables.rows.length}`);
    tables.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    console.log('\n✨ Phase 4 database schema ready!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
