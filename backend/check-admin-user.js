const pool = require('./dist/config/database').default;

(async () => {
  try {
    console.log('🔍 Checking admin user...\n');

    // Get admin user
    const userResult = await pool.query(
      'SELECT id, email, firm_id, first_name, last_name, is_active FROM users WHERE email = $1',
      ['admin@example.com']
    );

    if (userResult.rows.length === 0) {
      console.log('❌ Admin user not found!');
      await pool.end();
      return;
    }

    const admin = userResult.rows[0];
    console.log('Admin User:');
    console.log('  ID:', admin.id);
    console.log('  Email:', admin.email);
    console.log('  Name:', admin.first_name, admin.last_name);
    console.log('  Firm ID:', admin.firm_id);
    console.log('  Active:', admin.is_active);

    if (!admin.firm_id) {
      console.log('\n❌ PROBLEM: Admin user has NO firm_id!');
      console.log('This is why companies are empty.');

      // Check if there's a default firm
      const firmResult = await pool.query('SELECT id, name FROM firms LIMIT 1');
      if (firmResult.rows.length > 0) {
        const firm = firmResult.rows[0];
        console.log('\n💡 Found default firm:', firm.name, '(' + firm.id + ')');
        console.log('\nFixing admin user...');

        await pool.query(
          'UPDATE users SET firm_id = $1 WHERE email = $2',
          [firm.id, 'admin@example.com']
        );

        console.log('✅ Updated admin user with firm_id:', firm.id);
        console.log('\n🔄 Please log out and log in again!');
      }
    } else {
      console.log('\n✅ Admin has firm_id');

      // Check companies for this firm
      const companiesResult = await pool.query(
        'SELECT COUNT(*) as count FROM companies WHERE firm_id = $1',
        [admin.firm_id]
      );

      console.log('\nCompanies for this firm:', companiesResult.rows[0].count);

      if (parseInt(companiesResult.rows[0].count) === 0) {
        console.log('❌ No companies found for this firm!');
      } else {
        console.log('✅ Companies exist - JWT token might be the issue');
      }
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
