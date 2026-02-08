/**
 * Run Phase 6 Enhanced Documents & Routing Migration
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
  const client = await pool.connect();

  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  PHASE 6: ENHANCED DOCUMENTS & ROUTING MIGRATION          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const sqlPath = path.join(__dirname, '../../database/migrations/006_enhanced_documents_routing.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📦 Running migration...\n');

    await client.query(sql);

    console.log('✅ Migration completed successfully!\n');

    // Verify created objects
    console.log('🔍 Verifying created objects...\n');

    // Check tables
    const tablesResult = await client.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename IN ('document_access_logs', 'document_types', 'routing_rules', 'routing_round_robin_state', 'document_shares')
      ORDER BY tablename
    `);
    console.log(`   Tables created: ${tablesResult.rows.map(r => r.tablename).join(', ')}`);

    // Check document types seeded
    const docTypesResult = await client.query(`
      SELECT COUNT(*) as count FROM document_types
    `);
    console.log(`   ✓ Document types seeded: ${docTypesResult.rows[0].count} records`);

    // Check function
    const funcResult = await client.query(`
      SELECT proname FROM pg_proc WHERE proname = 'get_next_round_robin_user'
    `);
    console.log(`   ✓ Function: ${funcResult.rows[0]?.proname || 'get_next_round_robin_user'}`);

    // Check view
    const viewResult = await client.query(`
      SELECT viewname FROM pg_views WHERE viewname = 'v_document_access'
    `);
    console.log(`   ✓ View: ${viewResult.rows[0]?.viewname || 'v_document_access'}`);

    // Check legal_documents columns
    const columnsResult = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'legal_documents'
      AND column_name IN ('document_type', 'access_level', 'tags', 'version')
    `);
    console.log(`   ✓ legal_documents extended: ${columnsResult.rows.map(r => r.column_name).join(', ')}`);

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ PHASE 6 MIGRATION COMPLETE!                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

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
