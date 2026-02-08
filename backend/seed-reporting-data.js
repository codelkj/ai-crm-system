/**
 * Seed Test Data for LegalNexus Reporting Dashboard
 * Adds attorneys, time entries, and updates matter metrics
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: 'postgresql://crm_user:crm_password@localhost:5432/crm_ai_db'
});

async function seedReportingData() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🌱 Starting LegalNexus Reporting Data Seed...\n');

    // Get the first firm_id
    const firmResult = await client.query('SELECT id FROM firms LIMIT 1');
    if (firmResult.rows.length === 0) {
      throw new Error('No firms found. Please create a firm first.');
    }
    const firmId = firmResult.rows[0].id;
    console.log(`✅ Using firm: ${firmId}\n`);

    // 1. CREATE ATTORNEYS
    console.log('👥 Creating Attorneys...');
    const passwordHash = await bcrypt.hash('password123', 10);

    const attorneys = [
      { first_name: 'Sarah', last_name: 'Mitchell', email: 'sarah.mitchell@legalnexus.com', job_title: 'Corporate Law', hourly_rate: 2500 },
      { first_name: 'David', last_name: 'Thompson', email: 'david.thompson@legalnexus.com', job_title: 'Labour Law', hourly_rate: 2200 },
      { first_name: 'Emily', last_name: 'Robertson', email: 'emily.robertson@legalnexus.com', job_title: 'Conveyancing', hourly_rate: 1800 },
      { first_name: 'Michael', last_name: 'Chen', email: 'michael.chen@legalnexus.com', job_title: 'Litigation', hourly_rate: 2800 },
      { first_name: 'Jessica', last_name: 'Williams', email: 'jessica.williams@legalnexus.com', job_title: 'Family Law', hourly_rate: 2000 },
      { first_name: 'Robert', last_name: 'Davis', email: 'robert.davis@legalnexus.com', job_title: 'Tax Law', hourly_rate: 2600 },
      { first_name: 'Amanda', last_name: 'Parker', email: 'amanda.parker@legalnexus.com', job_title: 'Corporate Law', hourly_rate: 2300 },
      { first_name: 'James', last_name: 'Anderson', email: 'james.anderson@legalnexus.com', job_title: 'Litigation', hourly_rate: 2400 }
    ];

    const attorneyIds = [];
    for (const attorney of attorneys) {
      const result = await client.query(`
        INSERT INTO users (
          firm_id, first_name, last_name, email, password_hash,
          role, job_title, hourly_rate, is_attorney, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (email) DO UPDATE SET
          is_attorney = true,
          hourly_rate = EXCLUDED.hourly_rate,
          job_title = EXCLUDED.job_title
        RETURNING id
      `, [
        firmId, attorney.first_name, attorney.last_name, attorney.email,
        passwordHash, 'attorney', attorney.job_title, attorney.hourly_rate,
        true, true
      ]);
      attorneyIds.push(result.rows[0].id);
      console.log(`   ✅ ${attorney.first_name} ${attorney.last_name} - ${attorney.job_title} (R${attorney.hourly_rate}/hr)`);
    }

    // 2. GET EXISTING MATTERS
    console.log('\n📋 Fetching Existing Matters...');
    const mattersResult = await client.query(`
      SELECT id, matter_number, title, budget_hours, budget_amount
      FROM deals
      WHERE firm_id = $1
      AND matter_number IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 20
    `, [firmId]);

    const matters = mattersResult.rows;
    console.log(`   ✅ Found ${matters.length} matters\n`);

    if (matters.length === 0) {
      console.log('⚠️  No matters found. Creating some matters first...');
      // Create a few matters
      for (let i = 0; i < 5; i++) {
        const matterResult = await client.query(`
          INSERT INTO deals (
            firm_id, title, matter_number, matter_type,
            budget_hours, budget_amount, value, matter_status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id
        `, [
          firmId,
          `Test Matter ${i + 1}`,
          `M-2026-TEST-${i + 1}`,
          ['Corporate', 'Litigation', 'Conveyancing', 'Labour', 'Family'][i % 5],
          Math.floor(Math.random() * 100) + 20,
          Math.floor(Math.random() * 500000) + 100000,
          Math.floor(Math.random() * 500000) + 100000,
          'active'
        ]);
        matters.push({ id: matterResult.rows[0].id });
      }
    }

    // 3. CREATE TIME ENTRIES
    console.log('⏱️  Creating Time Entries...');
    let totalEntries = 0;
    const today = new Date();

    // Create time entries for the last 90 days
    for (let daysAgo = 0; daysAgo < 90; daysAgo++) {
      const entryDate = new Date(today);
      entryDate.setDate(entryDate.getDate() - daysAgo);

      // Random number of entries per day (0-5)
      const entriesPerDay = Math.floor(Math.random() * 6);

      for (let i = 0; i < entriesPerDay; i++) {
        const attorney = attorneyIds[Math.floor(Math.random() * attorneyIds.length)];
        const matter = matters[Math.floor(Math.random() * matters.length)];
        const durationMinutes = [30, 60, 90, 120, 180, 240, 300][Math.floor(Math.random() * 7)];
        const billable = Math.random() > 0.1; // 90% billable
        const billed = billable && Math.random() > 0.3; // 70% of billable entries are billed

        // Get attorney hourly rate
        const rateResult = await client.query('SELECT hourly_rate FROM users WHERE id = $1', [attorney]);
        const hourlyRate = rateResult.rows[0].hourly_rate;

        await client.query(`
          INSERT INTO time_entries (
            firm_id, matter_id, user_id, entry_date,
            duration_minutes, hourly_rate,
            description, billable, billed
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          firmId, matter.id, attorney, entryDate.toISOString().split('T')[0],
          durationMinutes, hourlyRate,
          `Time entry for ${entryDate.toISOString().split('T')[0]}`,
          billable, billed
        ]);

        totalEntries++;
      }
    }

    console.log(`   ✅ Created ${totalEntries} time entries (last 90 days)\n`);

    // 4. UPDATE MATTER METRICS (actual_hours, actual_amount, burn_rate)
    console.log('📊 Calculating Matter Metrics...');

    const updateResult = await client.query(`
      UPDATE deals d
      SET
        actual_hours = COALESCE(time_data.total_hours, 0),
        actual_amount = COALESCE(time_data.total_amount, 0),
        health_status = CASE
          WHEN COALESCE(time_data.total_hours, 0) / NULLIF(d.budget_hours, 0) >= 0.95 THEN 'red'
          WHEN COALESCE(time_data.total_hours, 0) / NULLIF(d.budget_hours, 0) >= 0.80 THEN 'amber'
          ELSE 'green'
        END
      FROM (
        SELECT
          matter_id,
          SUM(duration_minutes) / 60.0 as total_hours,
          SUM(amount) as total_amount
        FROM time_entries
        WHERE firm_id = $1
        GROUP BY matter_id
      ) time_data
      WHERE d.id = time_data.matter_id
      AND d.firm_id = $1
    `, [firmId]);

    console.log(`   ✅ Updated ${updateResult.rowCount} matters with actual metrics\n`);

    // 5. CREATE SOME OVERDUE UNBILLED TIME (for Billing Inertia)
    console.log('⚠️  Creating Overdue Unbilled Time...');

    const oldDate = new Date(today);
    oldDate.setDate(oldDate.getDate() - 45); // 45 days ago

    for (let i = 0; i < 15; i++) {
      const attorney = attorneyIds[Math.floor(Math.random() * attorneyIds.length)];
      const matter = matters[Math.floor(Math.random() * matters.length)];
      const durationMinutes = [120, 180, 240][Math.floor(Math.random() * 3)];

      const rateResult = await client.query('SELECT hourly_rate FROM users WHERE id = $1', [attorney]);
      const hourlyRate = rateResult.rows[0].hourly_rate;

      await client.query(`
        INSERT INTO time_entries (
          firm_id, matter_id, user_id, entry_date,
          duration_minutes, hourly_rate,
          description, billable, billed
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        firmId, matter.id, attorney, oldDate.toISOString().split('T')[0],
        durationMinutes, hourlyRate,
        'Overdue unbilled work',
        true, false // Billable but not billed
      ]);
    }

    console.log(`   ✅ Created 15 overdue unbilled entries (45 days old)\n`);

    // 6. SUMMARY
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 REPORTING DATA SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const stats = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE firm_id = $1 AND is_attorney = true) as attorneys,
        (SELECT COUNT(*) FROM time_entries WHERE firm_id = $1) as time_entries,
        (SELECT COUNT(*) FROM time_entries WHERE firm_id = $1 AND billable = true AND billed = false) as unbilled_entries,
        (SELECT COUNT(*) FROM deals WHERE firm_id = $1 AND actual_hours > 0) as matters_with_time,
        (SELECT SUM(duration_minutes) / 60.0 FROM time_entries WHERE firm_id = $1) as total_hours,
        (SELECT SUM(amount) FROM time_entries WHERE firm_id = $1) as total_revenue
    `, [firmId]);

    const s = stats.rows[0];
    console.log(`👥 Attorneys: ${s.attorneys}`);
    console.log(`⏱️  Time Entries: ${s.time_entries}`);
    console.log(`⚠️  Unbilled Entries: ${s.unbilled_entries}`);
    console.log(`📋 Matters with Time: ${s.matters_with_time}`);
    console.log(`🕐 Total Hours: ${parseFloat(s.total_hours || 0).toFixed(1)}`);
    console.log(`💰 Total Revenue: R ${parseFloat(s.total_revenue || 0).toLocaleString()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await client.query('COMMIT');
    console.log('✅ Reporting data seeded successfully!\n');
    console.log('🎯 Test the dashboard at: http://localhost:5173/reporting\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding data:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedReportingData().catch(console.error);
