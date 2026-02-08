/**
 * Seed Connected Test Data
 * Creates interconnected data across all tables for testing
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'crm_ai_db',
  user: 'crm_user',
  password: 'crm_password'
});

async function seedConnectedData() {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting connected data seed...\n');

    // Get the default firm and admin user
    const firmResult = await client.query('SELECT id FROM firms LIMIT 1');
    const firmId = firmResult.rows[0].id;
    console.log('✓ Using firm:', firmId);

    const adminResult = await client.query('SELECT id FROM users WHERE email = $1', ['admin@example.com']);
    const adminId = adminResult.rows[0]?.id;

    if (!adminId) {
      throw new Error('Admin user not found. Please run migrations first.');
    }
    console.log('✓ Using admin:', adminId);

    // Get existing attorneys
    const attorneysResult = await client.query(
      'SELECT id, first_name, last_name FROM users WHERE firm_id = $1 AND is_attorney = true LIMIT 5',
      [firmId]
    );
    const attorneys = attorneysResult.rows;
    console.log(`✓ Found ${attorneys.length} attorneys\n`);

    // 1. CREATE COMPANIES
    console.log('Creating companies...');
    const companies = [
      { name: 'TechCorp Solutions', industry: 'Technology', website: 'https://techcorp.com', phone: '+27 11 123 4567', city: 'Johannesburg', country: 'South Africa' },
      { name: 'Global Finance Ltd', industry: 'Finance', website: 'https://globalfinance.co.za', phone: '+27 21 987 6543', city: 'Cape Town', country: 'South Africa' },
      { name: 'Industrial Mining Co', industry: 'Mining', website: 'https://industrialmining.com', phone: '+27 12 555 1234', city: 'Pretoria', country: 'South Africa' },
      { name: 'Retail Empire SA', industry: 'Retail', website: 'https://retailempire.co.za', phone: '+27 31 444 5555', city: 'Durban', country: 'South Africa' },
      { name: 'Healthcare Partners', industry: 'Healthcare', website: 'https://healthcarepartners.co.za', phone: '+27 11 222 3333', city: 'Johannesburg', country: 'South Africa' }
    ];

    const companyIds = [];
    for (const company of companies) {
      const result = await client.query(
        `INSERT INTO companies (firm_id, name, industry, website, phone, city, country, primary_director_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         RETURNING id`,
        [firmId, company.name, company.industry, company.website, company.phone, company.city, company.country, adminId]
      );
      companyIds.push(result.rows[0].id);
      console.log(`  ✓ Created: ${company.name}`);
    }

    // 2. CREATE CONTACTS (2-3 per company)
    console.log('\nCreating contacts...');
    const contactFirstNames = ['Sarah', 'Michael', 'Jennifer', 'David', 'Lisa', 'James', 'Emily', 'Robert', 'Amanda', 'John'];
    const contactLastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Moore', 'Taylor'];
    const contactPositions = ['CEO', 'CFO', 'COO', 'Legal Counsel', 'VP Operations', 'Managing Director', 'General Manager'];

    const contactIds = [];
    const timestamp = Date.now();
    let contactCounter = 1;
    for (let i = 0; i < companyIds.length; i++) {
      const companyId = companyIds[i];
      const numContacts = 2 + Math.floor(Math.random() * 2); // 2-3 contacts per company

      for (let j = 0; j < numContacts; j++) {
        const firstName = contactFirstNames[Math.floor(Math.random() * contactFirstNames.length)];
        const lastName = contactLastNames[Math.floor(Math.random() * contactLastNames.length)];
        const position = contactPositions[Math.floor(Math.random() * contactPositions.length)];
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${timestamp}.${contactCounter}@company${i + 1}.com`;
        const phone = `+27 ${10 + i}${j} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`;
        contactCounter++;

        const result = await client.query(
          `INSERT INTO contacts (firm_id, company_id, first_name, last_name, email, phone, position, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
           RETURNING id`,
          [firmId, companyId, firstName, lastName, email, phone, position]
        );
        contactIds.push(result.rows[0].id);
        console.log(`  ✓ Created: ${firstName} ${lastName} at Company ${i + 1}`);
      }
    }

    // 3. CREATE MATTERS (1-2 per company)
    console.log('\nCreating matters...');
    const matterTypes = ['Corporate', 'Litigation', 'Labour Law', 'Mergers & Acquisitions', 'Contract Review', 'Compliance'];
    const matterIds = [];
    let matterCounter = 1001;

    for (let i = 0; i < companyIds.length; i++) {
      const companyId = companyIds[i];
      const numMatters = 1 + Math.floor(Math.random() * 2); // 1-2 matters per company

      for (let j = 0; j < numMatters; j++) {
        const matterType = matterTypes[Math.floor(Math.random() * matterTypes.length)];
        const leadDirector = attorneys[Math.floor(Math.random() * attorneys.length)];
        const budgetHours = 50 + Math.floor(Math.random() * 150); // 50-200 hours
        const budgetAmount = budgetHours * 2000; // R2000/hour average
        const value = budgetAmount * (0.9 + Math.random() * 0.3); // 90-120% of budget

        const result = await client.query(
          `INSERT INTO deals (
            firm_id, company_id, title, matter_number, matter_type, matter_status,
            value, probability, budget_hours, budget_amount,
            lead_director_id, opened_date, created_at
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW() - INTERVAL '30 days', NOW())
           RETURNING id`,
          [
            firmId, companyId,
            `${matterType} Matter for Company ${i + 1}`,
            `MTR-${matterCounter++}`,
            matterType,
            'active',
            Math.round(value),
            75,
            budgetHours,
            budgetAmount,
            leadDirector.id
          ]
        );
        matterIds.push(result.rows[0].id);
        console.log(`  ✓ Created: MTR-${matterCounter - 1} (${matterType})`);
      }
    }

    // 4. ASSIGN ATTORNEYS TO MATTERS
    console.log('\nAssigning attorneys to matters...');
    for (const matterId of matterIds) {
      // Assign 1-3 attorneys per matter
      const numAssignments = 1 + Math.floor(Math.random() * 3);
      const assignedAttorneys = new Set();

      for (let i = 0; i < numAssignments; i++) {
        const attorney = attorneys[Math.floor(Math.random() * attorneys.length)];
        if (!assignedAttorneys.has(attorney.id)) {
          const roles = ['Lead Counsel', 'Associate', 'Junior Attorney', 'Paralegal'];
          const role = roles[i] || 'Associate';

          await client.query(
            `INSERT INTO matter_assignments (matter_id, user_id, role, assigned_date)
             VALUES ($1, $2, $3, NOW() - INTERVAL '20 days')`,
            [matterId, attorney.id, role]
          );
          assignedAttorneys.add(attorney.id);
          console.log(`  ✓ Assigned ${attorney.first_name} ${attorney.last_name} to matter as ${role}`);
        }
      }
    }

    // 5. CREATE DOCUMENTS (2-4 per matter)
    console.log('\nCreating documents...');
    const docTypes = ['Contract', 'Memo', 'Brief', 'Agreement', 'Correspondence', 'Evidence', 'Motion'];
    const docStatuses = ['draft', 'review', 'final', 'filed'];

    for (let i = 0; i < matterIds.length; i++) {
      const matterId = matterIds[i];
      const numDocs = 2 + Math.floor(Math.random() * 3); // 2-4 docs per matter

      for (let j = 0; j < numDocs; j++) {
        const docType = docTypes[Math.floor(Math.random() * docTypes.length)];
        const status = docStatuses[Math.floor(Math.random() * docStatuses.length)];

        await client.query(
          `INSERT INTO legal_documents (
            firm_id, matter_id, title, document_type, processing_status, file_path,
            file_size, mime_type, created_at
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() - INTERVAL '${j * 5} days')`,
          [
            firmId, matterId,
            `${docType} - Matter ${i + 1} Doc ${j + 1}`,
            docType.toLowerCase(),
            status,
            `/uploads/documents/sample-doc-${i}-${j}.pdf`,
            Math.floor(Math.random() * 500000 + 50000), // 50KB - 550KB
            'application/pdf'
          ]
        );
        console.log(`  ✓ Created document for Matter ${i + 1}: ${docType}`);
      }
    }

    // 6. UPDATE MATTER METRICS (actual_hours, actual_amount calculated by triggers)
    console.log('\nUpdating matter metrics...');
    // Time entries were already created by seed-reporting-data.js, so actual_hours and actual_amount should be populated
    // Update health_status based on burn_rate
    await client.query(`
      UPDATE deals
      SET health_status = CASE
        WHEN burn_rate >= 95 THEN 'critical'
        WHEN burn_rate >= 80 THEN 'warning'
        ELSE 'healthy'
      END
      WHERE matter_status = 'active'
    `);
    console.log('  ✓ Updated matter health statuses');

    console.log('\n✅ Connected data seed completed successfully!\n');
    console.log('Summary:');
    console.log(`  - Companies: ${companyIds.length}`);
    console.log(`  - Contacts: ${contactIds.length}`);
    console.log(`  - Matters: ${matterIds.length}`);
    console.log(`  - Documents: ${matterIds.length * 3} (avg)`);
    console.log(`  - Matter Assignments: ${matterIds.length * 2} (avg)`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seed
seedConnectedData().catch(console.error);
