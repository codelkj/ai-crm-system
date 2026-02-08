/**
 * Update Partner/Director role with billing_packs permissions
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'crm_ai_db',
  user: 'crm_user',
  password: 'crm_password'
});

async function updatePermissions() {
  try {
    console.log('🔧 Updating Partner/Director role permissions...\n');

    const result = await pool.query(
      `UPDATE roles
       SET permissions = jsonb_set(
         permissions,
         '{billing_packs}',
         '["create", "read", "update", "delete", "send", "approve"]'::jsonb
       )
       WHERE name = 'Partner/Director'
       RETURNING id, name, permissions`
    );

    if (result.rowCount > 0) {
      console.log('✅ Successfully updated role permissions!\n');
      console.log('Updated role:', result.rows[0].name);
      console.log('New permissions:', JSON.stringify(result.rows[0].permissions, null, 2));
    } else {
      console.log('⚠️  No Partner/Director role found to update');
    }

  } catch (error) {
    console.error('❌ Failed to update permissions:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

updatePermissions();
