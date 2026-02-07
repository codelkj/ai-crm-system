/**
 * Seed Base Data (Pipeline Stages and Categories)
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedBaseData() {
  const client = await pool.connect();

  try {
    console.log('🌱 Seeding base data...\n');

    // Seed Pipeline Stages
    console.log('📊 Seeding pipeline stages...');
    const stagesSql = fs.readFileSync(
      path.join(__dirname, '../database/seeds/001_pipeline_stages.sql'),
      'utf8'
    );
    await client.query(stagesSql);
    console.log('✓ Pipeline stages seeded\n');

    // Seed Categories
    console.log('💰 Seeding categories...');
    const categoriesSql = fs.readFileSync(
      path.join(__dirname, '../database/seeds/002_categories.sql'),
      'utf8'
    );
    await client.query(categoriesSql);
    console.log('✓ Categories seeded\n');

    console.log('✅ Base data seeding completed!\n');

  } catch (error) {
    console.error('❌ Error seeding base data:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedBaseData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
