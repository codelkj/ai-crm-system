const pool = require('./dist/config/database').default;

(async () => {
  try {
    console.log('🔍 Testing companies SQL query...\n');

    const firmId = '00000000-0000-0000-0000-000000000001';

    // Test the exact query from company.service.ts
    const result = await pool.query(
      `SELECT c.*,
        u.name as primary_director_name,
        d.name as department_name
       FROM companies c
       LEFT JOIN users u ON c.primary_director_id = u.id
       LEFT JOIN departments d ON c.department_id = d.id
       WHERE c.firm_id = $1
       ORDER BY c.created_at DESC
       LIMIT 10`,
      [firmId]
    );

    console.log('✅ Query successful!');
    console.log('Found', result.rows.length, 'companies\n');

    result.rows.forEach((company, i) => {
      console.log(`${i + 1}. ${company.name} (ID: ${company.id})`);
      console.log(`   Industry: ${company.industry || 'N/A'}`);
      console.log(`   Firm ID: ${company.firm_id}`);
    });

    await pool.end();
  } catch (error) {
    console.error('❌ SQL Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
})();
