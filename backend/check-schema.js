const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://crm_user:crm_password@localhost:5432/crm_ai_db'
});

async function checkSchema() {
  try {
    // Check users table
    const usersRes = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log('\n=== USERS TABLE ===');
    usersRes.rows.forEach(r => {
      console.log(`  ${r.column_name} (${r.data_type})`);
    });

    // Check time_entries table
    const timeRes = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'time_entries'
      ORDER BY ordinal_position
    `);

    console.log('\n=== TIME_ENTRIES TABLE ===');
    timeRes.rows.forEach(r => {
      console.log(`  ${r.column_name} (${r.data_type})`);
    });

    // Check deals table (matters)
    const dealsRes = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'deals'
      ORDER BY ordinal_position
    `);

    console.log('\n=== DEALS TABLE ===');
    dealsRes.rows.forEach(r => {
      console.log(`  ${r.column_name} (${r.data_type})`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
