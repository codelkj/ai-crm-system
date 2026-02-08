/**
 * LegalNexus CRM - Database Migration Runner
 * Executes SQL migration and seed files in sequence
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runSQLFile(filePath, description) {
  const sql = fs.readFileSync(filePath, 'utf8');

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Running: ${description}`);
  console.log(`File: ${path.basename(filePath)}`);
  console.log('='.repeat(60));

  try {
    await pool.query(sql);
    console.log('✅ SUCCESS');
    return true;
  } catch (error) {
    console.error('❌ FAILED');
    console.error('Error:', error.message);
    console.error('Detail:', error.detail || 'No additional details');
    return false;
  }
}

async function runMigrations() {
  console.log('\n🚀 LegalNexus CRM - Database Migration\n');

  const migrations = [
    {
      file: 'migrations/001_multi_tenancy_foundation.sql',
      description: 'Phase 1: Multi-Tenancy Foundation Schema'
    },
    {
      file: 'seeds/001_initial_firm_data.sql',
      description: 'Phase 1: Initial Firm, Departments & Roles Seed Data'
    }
  ];

  let successCount = 0;
  let failCount = 0;

  for (const migration of migrations) {
    const filePath = path.join(__dirname, migration.file);

    if (!fs.existsSync(filePath)) {
      console.error(`\n❌ File not found: ${filePath}`);
      failCount++;
      continue;
    }

    const success = await runSQLFile(filePath, migration.description);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📊 Total: ${migrations.length}`);
  console.log('='.repeat(60));

  await pool.end();

  if (failCount > 0) {
    process.exit(1);
  }
}

// Run migrations
runMigrations().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
