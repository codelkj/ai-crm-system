/**
 * Seed Historical Time Entries
 * Creates time entries spanning the last 12 months for proper reporting
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'crm_ai_db',
  user: 'crm_user',
  password: 'crm_password'
});

async function seedHistoricalTimeEntries() {
  const client = await pool.connect();

  try {
    console.log('🌱 Creating historical time entries...\n');

    // Get firm and attorneys
    const firmResult = await client.query('SELECT id FROM firms LIMIT 1');
    const firmId = firmResult.rows[0].id;

    const attorneysResult = await client.query(
      'SELECT id, first_name, last_name, hourly_rate FROM users WHERE firm_id = $1 AND is_attorney = true',
      [firmId]
    );
    const attorneys = attorneysResult.rows;

    // Get active matters
    const mattersResult = await client.query(
      'SELECT id, matter_number FROM deals WHERE firm_id = $1 AND matter_status = $2 LIMIT 10',
      [firmId, 'active']
    );
    const matters = mattersResult.rows;

    console.log(`Found ${attorneys.length} attorneys and ${matters.length} matters\n`);

    let totalEntries = 0;

    // Create time entries for the last 12 months
    for (let monthsAgo = 0; monthsAgo < 12; monthsAgo++) {
      const entriesThisMonth = 15 + Math.floor(Math.random() * 10); // 15-25 entries per month

      for (let i = 0; i < entriesThisMonth; i++) {
        const attorney = attorneys[Math.floor(Math.random() * attorneys.length)];
        const matter = matters[Math.floor(Math.random() * matters.length)];

        // Random day within the month
        const daysAgo = monthsAgo * 30 + Math.floor(Math.random() * 30);
        const hoursWorked = 0.5 + Math.random() * 7.5; // 0.5 to 8 hours
        const durationMinutes = Math.round(hoursWorked * 60);
        const billable = Math.random() > 0.1; // 90% billable
        const billed = billable && Math.random() > 0.3; // 70% of billable is already billed

        const activities = [
          'Client consultation',
          'Document review',
          'Legal research',
          'Court preparation',
          'Email correspondence',
          'Contract drafting',
          'Case analysis',
          'Client meeting',
          'Negotiation',
          'Filing preparation'
        ];
        const activity = activities[Math.floor(Math.random() * activities.length)];

        await client.query(
          `INSERT INTO time_entries (
            firm_id, user_id, matter_id, entry_date, duration_minutes,
            hourly_rate, description, billable, billed, created_at
           )
           VALUES ($1, $2, $3, NOW() - INTERVAL '${daysAgo} days', $4, $5, $6, $7, $8, NOW() - INTERVAL '${daysAgo} days')`,
          [
            firmId,
            attorney.id,
            matter.id,
            durationMinutes,
            attorney.hourly_rate || 2000, // Default to R2000 if not set
            `${activity} for ${matter.matter_number}`,
            billable,
            billed
          ]
        );

        totalEntries++;
      }

      console.log(`✓ Created ${entriesThisMonth} entries for month ${monthsAgo + 1} (${monthsAgo * 30} days ago)`);
    }

    // Update matter metrics (actual_hours, actual_amount will be recalculated by triggers)
    await client.query(`
      UPDATE deals
      SET health_status = CASE
        WHEN burn_rate >= 95 THEN 'critical'
        WHEN burn_rate >= 80 THEN 'warning'
        ELSE 'healthy'
      END
      WHERE matter_status = 'active'
    `);

    console.log(`\n✅ Created ${totalEntries} historical time entries across 12 months\n`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedHistoricalTimeEntries().catch(console.error);
