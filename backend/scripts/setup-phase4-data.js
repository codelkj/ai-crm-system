/**
 * Setup Phase 4 - Add Permissions & Create Test Data
 * Adds matter permissions to Partner/Director role and creates synthetic data
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'crm_ai_db',
  user: 'crm_user',
  password: 'crm_password'
});

async function setupPhase4() {
  const client = await pool.connect();

  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  PHASE 4: SETUP PERMISSIONS & TEST DATA                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    await client.query('BEGIN');

    // 1. Update Partner/Director role permissions
    console.log('1️⃣  Updating Partner/Director permissions...');
    const roleResult = await client.query(`
      UPDATE roles
      SET permissions = permissions ||
        '{"matters": ["create", "read", "update", "delete", "assign", "close", "transfer"],
          "lightning_path": ["read", "move", "manage"]}'::jsonb
      WHERE name = 'Partner/Director'
      RETURNING id, name, permissions
    `);

    if (roleResult.rowCount > 0) {
      console.log('   ✅ Permissions updated for Partner/Director');
    }

    // 2. Get firm_id
    const firmResult = await client.query(`SELECT id FROM firms LIMIT 1`);
    const firmId = firmResult.rows[0].id;

    // 3. Get admin user
    const userResult = await client.query(`
      SELECT u.id, u.email FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE r.name = 'Partner/Director'
      LIMIT 1
    `);
    const userId = userResult.rows[0]?.id;

    if (!userId) {
      console.log('   ⚠️  No Partner/Director user found - skipping data creation');
      await client.query('COMMIT');
      return;
    }

    console.log(`   📧 Using user: ${userResult.rows[0].email}\n`);

    // 4. Get or create test clients
    console.log('2️⃣  Creating test clients...');
    const clients = [];

    const clientData = [
      { name: 'Acme Legal Services Ltd', type: 'company' },
      { name: 'TechStart Innovations', type: 'company' },
      { name: 'Green Energy Solutions', type: 'company' },
      { name: 'John Smith', type: 'individual' },
      { name: 'Sarah Johnson', type: 'individual' }
    ];

    for (const clientInfo of clientData) {
      const result = await client.query(`
        INSERT INTO companies (firm_id, name, client_type)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
        RETURNING id, name
      `, [firmId, clientInfo.name, clientInfo.type]);

      if (result.rows.length > 0) {
        clients.push(result.rows[0]);
        console.log(`   ✅ Created client: ${result.rows[0].name}`);
      }
    }

    // Use existing clients if none were created
    if (clients.length === 0) {
      const existingClients = await client.query(`
        SELECT id, name FROM companies WHERE firm_id = $1 LIMIT 5
      `, [firmId]);
      clients.push(...existingClients.rows);
      console.log(`   ℹ️  Using ${clients.length} existing clients`);
    }

    // 5. Get departments
    console.log('\n3️⃣  Getting departments...');
    const deptResult = await client.query(`
      SELECT id, name FROM departments WHERE firm_id = $1
    `, [firmId]);
    const departments = deptResult.rows;
    console.log(`   ✅ Found ${departments.length} departments`);

    // 6. Get Lightning Path stages
    console.log('\n4️⃣  Getting Lightning Path stages...');
    const stagesResult = await client.query(`
      SELECT id, name, stage_order FROM lightning_stages
      WHERE firm_id = $1
      ORDER BY stage_order
    `, [firmId]);
    const stages = stagesResult.rows;
    console.log(`   ✅ Found ${stages.length} stages`);

    // 7. Create test matters
    console.log('\n5️⃣  Creating test matters...');
    const matterTypes = [
      'Litigation - Contract Dispute',
      'Corporate - M&A Transaction',
      'Conveyancing - Property Transfer',
      'Labour - Employment Dispute',
      'Tax - Estate Planning',
      'Family - Divorce Proceedings',
      'IP - Trademark Registration'
    ];

    let matterId = 1000;
    const matters = [];

    for (let i = 0; i < 15; i++) {
      const company = clients[i % clients.length];
      const dept = departments[i % departments.length];
      const stage = stages[i % Math.min(5, stages.length)]; // Distribute across first 5 stages
      const matterType = matterTypes[i % matterTypes.length];

      const budgetHours = 10 + Math.floor(Math.random() * 90); // 10-100 hours
      const budgetAmount = budgetHours * 1500; // R1500/hour
      const actualHours = Math.random() * budgetHours * 0.8; // 0-80% consumed
      const actualAmount = actualHours * 1500;
      const value = 50000 + Math.floor(Math.random() * 950000); // R50k - R1M

      const result = await client.query(`
        INSERT INTO deals (
          firm_id, company_id, title, pipeline_type, lightning_stage_id,
          matter_number, matter_type, department_id, lead_director_id,
          budget_hours, budget_amount, actual_hours, actual_amount,
          value, matter_status, opened_date
        ) VALUES ($1, $2, $3, 'legal', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'active', CURRENT_DATE - INTERVAL '${Math.floor(Math.random() * 90)} days')
        RETURNING id, matter_number, title
      `, [
        firmId,
        company.id,
        `${matterType} - ${company.name}`,
        stage.id,
        `M-2026-${String(matterId++).padStart(4, '0')}`,
        matterType,
        dept.id,
        userId,
        budgetHours,
        budgetAmount,
        actualHours,
        actualAmount,
        value
      ]);

      matters.push(result.rows[0]);
      console.log(`   ✅ Created: ${result.rows[0].matter_number} - ${result.rows[0].title.substring(0, 50)}...`);
    }

    // 8. Create matter assignments
    console.log('\n6️⃣  Creating matter assignments...');
    for (const matter of matters.slice(0, 10)) {
      await client.query(`
        INSERT INTO matter_assignments (matter_id, user_id, role)
        VALUES ($1, $2, 'Lead Director')
        ON CONFLICT DO NOTHING
      `, [matter.id, userId]);
    }
    console.log(`   ✅ Created assignments for ${Math.min(10, matters.length)} matters`);

    // 9. Create some stage transitions
    console.log('\n7️⃣  Creating stage transitions...');
    let transitionCount = 0;
    for (const matter of matters.slice(0, 8)) {
      // Create 1-2 transitions per matter
      const numTransitions = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < numTransitions && i < stages.length - 1; i++) {
        await client.query(`
          INSERT INTO stage_transitions (matter_id, from_stage_id, to_stage_id, transitioned_by, notes)
          VALUES ($1, $2, $3, $4, $5)
        `, [matter.id, stages[i].id, stages[i + 1].id, userId, 'Progressed to next stage']);
        transitionCount++;
      }
    }
    console.log(`   ✅ Created ${transitionCount} stage transitions`);

    await client.query('COMMIT');

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ PHASE 4 SETUP COMPLETE!                                ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\n📊 Summary:');
    console.log(`   • Permissions: Updated Partner/Director role`);
    console.log(`   • Clients: ${clients.length} available`);
    console.log(`   • Departments: ${departments.length} available`);
    console.log(`   • Stages: ${stages.length} available`);
    console.log(`   • Matters: ${matters.length} created`);
    console.log(`   • Assignments: ${Math.min(10, matters.length)} created`);
    console.log(`   • Transitions: ${transitionCount} created`);
    console.log('\n✨ Ready to test Lightning Path and Matters pages!\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Setup failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

setupPhase4();
