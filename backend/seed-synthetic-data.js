/**
 * Seed Database with Synthetic Data
 * Populates CRM, Sales, and Financial modules with realistic test data
 */

const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Synthetic data generators
const companies = [
  { name: 'TechCorp Solutions', industry: 'Technology', website: 'techcorp.com', revenue: 2500000 },
  { name: 'Global Manufacturing Inc', industry: 'Manufacturing', website: 'globalmanuf.com', revenue: 5000000 },
  { name: 'Retail Giants Ltd', industry: 'Retail', website: 'retailgiants.com', revenue: 3200000 },
  { name: 'Healthcare Innovations', industry: 'Healthcare', website: 'healthinnov.com', revenue: 1800000 },
  { name: 'Financial Services Group', industry: 'Finance', website: 'finservices.com', revenue: 4500000 },
  { name: 'EduTech Academy', industry: 'Education', website: 'edutech.com', revenue: 1200000 },
  { name: 'Green Energy Co', industry: 'Energy', website: 'greenenergy.com', revenue: 3800000 },
  { name: 'Logistics Pro', industry: 'Logistics', website: 'logisticspro.com', revenue: 2100000 },
  { name: 'Marketing Genius', industry: 'Marketing', website: 'marketgenius.com', revenue: 950000 },
  { name: 'Real Estate Partners', industry: 'Real Estate', website: 'realstatepartners.com', revenue: 6200000 },
  { name: 'Cloud Computing Corp', industry: 'Technology', website: 'cloudcomp.com', revenue: 3500000 },
  { name: 'Food & Beverage Enterprises', industry: 'Food & Beverage', website: 'foodbev.com', revenue: 2800000 },
];

const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jennifer', 'Robert', 'Lisa', 'William', 'Amanda', 'James', 'Jessica', 'Daniel', 'Ashley', 'Christopher'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas'];
const positions = ['CEO', 'CTO', 'CFO', 'VP Sales', 'VP Marketing', 'Director', 'Manager', 'Senior Manager', 'VP Operations'];

const dealTitles = [
  'Enterprise Software License',
  'Annual Service Contract',
  'Consulting Engagement',
  'Cloud Migration Project',
  'Digital Transformation Initiative',
  'Marketing Campaign Package',
  'IT Infrastructure Upgrade',
  'Product Integration',
  'Strategic Partnership',
  'Training & Development Program',
];

const transactionDescriptions = {
  income: [
    'Client Payment - Invoice #',
    'Subscription Revenue',
    'Consulting Fees',
    'Product Sales',
    'Service Revenue',
    'License Renewal',
  ],
  expense: [
    'Office Rent',
    'Payroll - ',
    'AWS Cloud Services',
    'Google Workspace',
    'Salesforce Subscription',
    'Office Supplies',
    'Marketing - Facebook Ads',
    'Marketing - Google Ads',
    'Professional Services',
    'Travel Expenses',
    'Insurance Premium',
    'Utilities - Electric',
  ],
};

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function seedData() {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting synthetic data seeding...\n');

    // Get user ID for created_by fields
    const userResult = await client.query('SELECT id FROM users LIMIT 1');
    const userId = userResult.rows[0]?.id || uuidv4();

    // 1. Seed Companies
    console.log('📊 Seeding companies...');
    const companyIds = [];
    for (const company of companies) {
      const id = uuidv4();
      await client.query(
        `INSERT INTO companies (id, name, industry, website, phone, address, city, state, country)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          id,
          company.name,
          company.industry,
          company.website,
          `+1-${randomInt(200, 999)}-${randomInt(200, 999)}-${randomInt(1000, 9999)}`,
          `${randomInt(100, 9999)} Business Ave`,
          randomItem(['New York', 'San Francisco', 'Austin', 'Chicago', 'Boston', 'Seattle']),
          randomItem(['NY', 'CA', 'TX', 'IL', 'MA', 'WA']),
          'USA',
        ]
      );
      companyIds.push({ id, name: company.name, revenue: company.revenue });
    }
    console.log(`✓ Created ${companyIds.length} companies\n`);

    // 2. Seed Contacts (2-3 per company)
    console.log('👥 Seeding contacts...');
    const contactIds = [];
    for (const company of companyIds) {
      const numContacts = randomInt(2, 3);
      for (let i = 0; i < numContacts; i++) {
        const id = uuidv4();
        const firstName = randomItem(firstNames);
        const lastName = randomItem(lastNames);
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`;

        await client.query(
          `INSERT INTO contacts (id, company_id, first_name, last_name, email, phone, position, is_primary)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            id,
            company.id,
            firstName,
            lastName,
            email,
            `+1-${randomInt(200, 999)}-${randomInt(200, 999)}-${randomInt(1000, 9999)}`,
            randomItem(positions),
            i === 0,
          ]
        );
        contactIds.push({ id, companyId: company.id, name: `${firstName} ${lastName}` });
      }
    }
    console.log(`✓ Created ${contactIds.length} contacts\n`);

    // 3. Get Pipeline Stages
    const stagesResult = await client.query('SELECT id, name FROM pipeline_stages ORDER BY "order"');
    const stages = stagesResult.rows;

    // 4. Seed Deals (distribute across pipeline stages)
    console.log('💰 Seeding deals...');
    let dealCount = 0;
    for (const company of companyIds) {
      const numDeals = randomInt(1, 2);
      const companyContacts = contactIds.filter(c => c.companyId === company.id);

      for (let i = 0; i < numDeals; i++) {
        const stage = randomItem(stages);
        const value = Math.round((company.revenue / 10) * (0.5 + Math.random()));
        const probability = stage.name === 'Won' ? 100 : stage.name === 'Lost' ? 0 : randomInt(20, 80);
        const daysOffset = randomInt(-90, 30);
        const expectedCloseDate = new Date();
        expectedCloseDate.setDate(expectedCloseDate.getDate() + daysOffset);

        await client.query(
          `INSERT INTO deals (id, company_id, contact_id, stage_id, title, value, probability, expected_close_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            uuidv4(),
            company.id,
            companyContacts.length > 0 ? randomItem(companyContacts).id : null,
            stage.id,
            `${randomItem(dealTitles)} - ${company.name}`,
            value,
            probability,
            expectedCloseDate.toISOString().split('T')[0],
          ]
        );
        dealCount++;
      }
    }
    console.log(`✓ Created ${dealCount} deals\n`);

    // 5. Seed Bank Accounts
    console.log('🏦 Seeding bank accounts...');
    const bankAccounts = [
      { name: 'Operating Account', bank: 'Chase Bank', type: 'checking' },
      { name: 'Savings Account', bank: 'Bank of America', type: 'savings' },
      { name: 'Payroll Account', bank: 'Wells Fargo', type: 'checking' },
    ];

    const accountIds = [];
    for (const account of bankAccounts) {
      const id = uuidv4();
      await client.query(
        `INSERT INTO bank_accounts (id, account_name, account_number, bank_name, account_type, currency)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          id,
          account.name,
          `****${randomInt(1000, 9999)}`,
          account.bank,
          account.type,
          'USD',
        ]
      );
      accountIds.push(id);
    }
    console.log(`✓ Created ${accountIds.length} bank accounts\n`);

    // 6. Get Categories
    const categoriesResult = await client.query('SELECT id, name, type FROM categories');
    const categories = categoriesResult.rows;
    const incomeCategories = categories.filter(c => c.type === 'income');
    const expenseCategories = categories.filter(c => c.type === 'expense');

    // 7. Seed Transactions (last 90 days)
    console.log('💳 Seeding transactions...');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);
    const endDate = new Date();

    let transactionCount = 0;

    // Generate 100-150 transactions
    const numTransactions = randomInt(100, 150);
    for (let i = 0; i < numTransactions; i++) {
      const isIncome = Math.random() > 0.4; // 60% expenses, 40% income
      const category = isIncome ? randomItem(incomeCategories) : randomItem(expenseCategories);
      const amount = isIncome
        ? randomInt(5000, 50000)
        : randomInt(500, 15000);

      const transactionDate = randomDate(startDate, endDate);
      const type = isIncome ? 'credit' : 'debit';

      const descPrefix = isIncome
        ? randomItem(transactionDescriptions.income)
        : randomItem(transactionDescriptions.expense);

      const description = descPrefix + (Math.random() > 0.5 ? randomInt(1000, 9999) : '');

      await client.query(
        `INSERT INTO transactions (id, account_id, category_id, date, description, amount, type, ai_confidence, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          uuidv4(),
          randomItem(accountIds),
          category.id,
          transactionDate.toISOString().split('T')[0],
          description,
          amount,
          type,
          randomInt(85, 98) / 100,
          `Reference: REF${randomInt(100000, 999999)}`,
        ]
      );
      transactionCount++;
    }
    console.log(`✓ Created ${transactionCount} transactions\n`);

    // 8. Seed Activities
    console.log('📝 Seeding activities...');
    const activityTypes = ['call', 'email', 'meeting', 'note', 'task'];
    const activityDescriptions = {
      call: 'Follow-up call regarding',
      email: 'Sent proposal email for',
      meeting: 'Discovery meeting with',
      note: 'Discussion notes about',
      task: 'Action item:',
    };

    let activityCount = 0;
    for (const contact of contactIds.slice(0, 15)) {
      const numActivities = randomInt(2, 5);
      for (let i = 0; i < numActivities; i++) {
        const activityType = randomItem(activityTypes);
        const daysAgo = randomInt(0, 60);
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() - daysAgo);

        await client.query(
          `INSERT INTO activities (id, company_id, contact_id, type, subject, description, due_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            uuidv4(),
            contact.companyId,
            contact.id,
            activityType,
            `${activityType.charAt(0).toUpperCase() + activityType.slice(1)} with ${contact.name}`,
            `${activityDescriptions[activityType]} ongoing opportunities and next steps.`,
            dueDate.toISOString(),
          ]
        );
        activityCount++;
      }
    }
    console.log(`✓ Created ${activityCount} activities\n`);

    console.log('✅ Synthetic data seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Companies: ${companyIds.length}`);
    console.log(`   - Contacts: ${contactIds.length}`);
    console.log(`   - Deals: ${dealCount}`);
    console.log(`   - Bank Accounts: ${accountIds.length}`);
    console.log(`   - Transactions: ${transactionCount}`);
    console.log(`   - Activities: ${activityCount}`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seeder
seedData()
  .then(() => {
    console.log('\n🎉 All done! Your CRM is now populated with synthetic data.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed data:', error);
    process.exit(1);
  });
