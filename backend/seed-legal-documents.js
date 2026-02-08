/**
 * Seed Legal Documents
 * Populates the legal_documents table with sample data
 */

const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function seedLegalDocuments() {
  console.log('🌱 Seeding legal documents...\n');

  try {
    // Get first firm ID
    const firmResult = await pool.query('SELECT id FROM firms LIMIT 1');
    if (firmResult.rows.length === 0) {
      console.error('❌ No firms found. Please run firm seed first.');
      return;
    }
    const firmId = firmResult.rows[0].id;

    // Get some companies
    const companiesResult = await pool.query(
      'SELECT id, name FROM companies WHERE firm_id = $1 LIMIT 5',
      [firmId]
    );
    if (companiesResult.rows.length === 0) {
      console.error('❌ No companies found. Please run company seed first.');
      return;
    }

    // Get user who will be the uploader
    const userResult = await pool.query(
      'SELECT id, email FROM users WHERE firm_id = $1 LIMIT 1',
      [firmId]
    );
    const uploaderId = userResult.rows[0]?.id || null;

    console.log(`📊 Found ${companiesResult.rows.length} companies in firm ${firmId}`);
    console.log(`👤 Documents will be uploaded by user: ${userResult.rows[0]?.email || 'System'}\n`);

    const documents = [
      {
        title: 'Master Services Agreement - ' + companiesResult.rows[0].name,
        document_type: 'contract',
        company_id: companiesResult.rows[0].id,
        status: 'active',
        file_path: '/storage/legal/msa-2024-001.pdf',
        file_size: 245678,
        mime_type: 'application/pdf',
        summary: 'Comprehensive Master Services Agreement covering software development and consulting services, including payment terms, IP rights, and service level commitments.',
        key_terms: ['Payment Terms: Net 30', 'Service Level: 99.9% uptime', 'IP Rights: Client ownership'],
        parties: [companiesResult.rows[0].name, 'Service Provider Inc.'],
        effective_date: new Date('2024-01-15'),
        expiry_date: new Date('2025-01-15'),
        risk_score: 25,
        compliance_status: 'compliant',
        popia_compliant: true,
        fica_compliant: true,
      },
      {
        title: 'Non-Disclosure Agreement - ' + (companiesResult.rows[1]?.name || 'Client'),
        document_type: 'nda',
        company_id: companiesResult.rows[1]?.id || companiesResult.rows[0].id,
        status: 'active',
        file_path: '/storage/legal/nda-2024-002.pdf',
        file_size: 89456,
        mime_type: 'application/pdf',
        summary: 'Mutual Non-Disclosure Agreement protecting confidential information shared during business discussions and negotiations.',
        key_terms: ['Term: 2 years', 'Mutual obligations', 'Return of materials upon termination'],
        parties: [companiesResult.rows[1]?.name || 'Client', 'Our Company'],
        effective_date: new Date('2024-02-01'),
        expiry_date: new Date('2026-02-01'),
        risk_score: 15,
        compliance_status: 'compliant',
        popia_compliant: true,
        fica_compliant: false,
      },
      {
        title: 'Employment Contract - Senior Developer',
        document_type: 'employment',
        company_id: companiesResult.rows[0].id,
        status: 'active',
        file_path: '/storage/legal/employment-2024-003.pdf',
        file_size: 156789,
        mime_type: 'application/pdf',
        summary: 'Employment agreement for senior software developer position including salary, benefits, non-compete clause, and termination terms.',
        key_terms: ['Salary: R850,000 per annum', 'Notice Period: 30 days', 'Non-compete: 6 months'],
        parties: ['John Smith', companiesResult.rows[0].name],
        effective_date: new Date('2024-03-01'),
        expiry_date: null,
        risk_score: 35,
        compliance_status: 'review_required',
        popia_compliant: true,
        fica_compliant: true,
      },
      {
        title: 'Lease Agreement - Office Space Cape Town',
        document_type: 'lease',
        company_id: companiesResult.rows[2]?.id || companiesResult.rows[0].id,
        status: 'active',
        file_path: '/storage/legal/lease-2024-004.pdf',
        file_size: 312456,
        mime_type: 'application/pdf',
        summary: 'Commercial lease agreement for 500 sqm office space in Cape Town CBD. Includes rental escalation clause, maintenance obligations, and renewal options.',
        key_terms: ['Monthly Rent: R125,000', 'Escalation: 7% annual', 'Term: 3 years with 2-year renewal option'],
        parties: [companiesResult.rows[2]?.name || 'Tenant', 'Property Holdings Ltd'],
        effective_date: new Date('2024-01-01'),
        expiry_date: new Date('2027-01-01'),
        risk_score: 45,
        compliance_status: 'review_required',
        popia_compliant: false,
        fica_compliant: false,
      },
      {
        title: 'Software License Agreement - Enterprise Plan',
        document_type: 'license',
        company_id: companiesResult.rows[3]?.id || companiesResult.rows[0].id,
        status: 'active',
        file_path: '/storage/legal/license-2024-005.pdf',
        file_size: 198234,
        mime_type: 'application/pdf',
        summary: 'Enterprise software license for CRM platform with unlimited users, premium support, and custom integration capabilities.',
        key_terms: ['Annual Fee: $50,000', 'Unlimited Users', 'Premium Support 24/7'],
        parties: [companiesResult.rows[3]?.name || 'Licensee', 'Software Vendor Inc.'],
        effective_date: new Date('2024-04-01'),
        expiry_date: new Date('2025-04-01'),
        risk_score: 20,
        compliance_status: 'compliant',
        popia_compliant: true,
        fica_compliant: false,
      },
    ];

    let inserted = 0;
    for (const doc of documents) {
      try {
        const result = await pool.query(
          `INSERT INTO legal_documents (
            id, firm_id, title, document_type, company_id, status,
            file_path, file_size, mime_type, summary, key_terms, parties,
            effective_date, expiry_date, risk_score, compliance_status,
            popia_compliant, fica_compliant, uploaded_by, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), NOW())
          RETURNING id, title`,
          [
            uuidv4(),
            firmId,
            doc.title,
            doc.document_type,
            doc.company_id,
            doc.status,
            doc.file_path,
            doc.file_size,
            doc.mime_type,
            doc.summary,
            doc.key_terms,
            doc.parties,
            doc.effective_date,
            doc.expiry_date,
            doc.risk_score,
            doc.compliance_status,
            doc.popia_compliant,
            doc.fica_compliant,
            uploaderId,
          ]
        );

        console.log(`✅ Created: ${result.rows[0].title}`);
        inserted++;
      } catch (error) {
        console.error(`❌ Failed to create "${doc.title}":`, error.message);
      }
    }

    console.log(`\n✨ Successfully seeded ${inserted}/${documents.length} legal documents!`);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await pool.end();
  }
}

seedLegalDocuments();
