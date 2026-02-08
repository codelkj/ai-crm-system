/**
 * Run Phase 5 AI Integration Migration
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
    console.log('║  PHASE 5: AI INTEGRATION MIGRATION                        ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const sqlPath = path.join(__dirname, '../../database/migrations/005_ai_integration.sql');
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
      AND tablename IN ('document_embeddings', 'ai_insights', 'fica_documents', 'client_fica_documents')
      ORDER BY tablename
    `);
    console.log(`   Tables created: ${tablesResult.rows.map(r => r.tablename).join(', ')}`);

    // Check pgvector extension
    const extResult = await client.query(`
      SELECT extname, extversion FROM pg_extension WHERE extname = 'vector'
    `);
    if (extResult.rows.length > 0) {
      console.log(`   ✓ pgvector extension: v${extResult.rows[0].extversion}`);
    }

    // Check FICA documents seeded
    const ficaResult = await client.query(`
      SELECT COUNT(*) as count FROM fica_documents
    `);
    console.log(`   ✓ FICA documents seeded: ${ficaResult.rows[0].count} records`);

    // Check function
    const funcResult = await client.query(`
      SELECT proname FROM pg_proc WHERE proname = 'search_documents_by_embedding'
    `);
    console.log(`   ✓ Function: ${funcResult.rows[0]?.proname || 'search_documents_by_embedding'}`);

    // Check view
    const viewResult = await client.query(`
      SELECT viewname FROM pg_views WHERE viewname = 'v_fica_compliance'
    `);
    console.log(`   ✓ View: ${viewResult.rows[0]?.viewname || 'v_fica_compliance'}`);

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ PHASE 5 MIGRATION COMPLETE!                           ║');
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
