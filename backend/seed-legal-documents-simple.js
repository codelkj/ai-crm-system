/**
 * Seed Legal Documents - Simple Version
 * Run this with: cd backend && npx ts-node seed-legal-documents-simple.ts
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function seedDocuments() {
  console.log('🌱 Seeding legal documents via API...\n');

  try {
    // Login
    const login = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123',
    });
    const token = login.data.data.token;
    console.log('✅ Logged in\n');

    // Get companies
    const companies = await axios.get(`${BASE_URL}/crm/companies`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (companies.data.data.length === 0) {
      console.error('❌ No companies found');
      return;
    }

    console.log(`📊 Found ${companies.data.data.length} companies\n`);

    const documents = [
      {
        title: `Master Services Agreement - ${companies.data.data[0].name}`,
        document_type: 'contract',
        company_id: companies.data.data[0].id,
        status: 'active',
        summary: 'Comprehensive Master Services Agreement covering software development and consulting services, including payment terms, IP rights, and service level commitments.',
        key_terms: ['Payment Terms: Net 30', 'Service Level: 99.9% uptime', 'IP Rights: Client ownership'],
        parties: [companies.data.data[0].name, 'Service Provider Inc.'],
        effective_date: '2024-01-15',
        expiry_date: '2025-01-15',
        risk_score: 25,
        compliance_status: 'compliant',
        popia_compliant: true,
        fica_compliant: true,
      },
      {
        title: `Non-Disclosure Agreement - ${companies.data.data[1]?.name || 'Client'}`,
        document_type: 'nda',
        company_id: companies.data.data[1]?.id || companies.data.data[0].id,
        status: 'active',
        summary: 'Mutual Non-Disclosure Agreement protecting confidential information shared during business discussions and negotiations.',
        key_terms: ['Term: 2 years', 'Mutual obligations', 'Return of materials upon termination'],
        parties: [companies.data.data[1]?.name || 'Client', 'Our Company'],
        effective_date: '2024-02-01',
        expiry_date: '2026-02-01',
        risk_score: 15,
        compliance_status: 'compliant',
        popia_compliant: true,
        fica_compliant: false,
      },
      {
        title: 'Employment Contract - Senior Developer',
        document_type: 'employment',
        company_id: companies.data.data[0].id,
        status: 'active',
        summary: 'Employment agreement for senior software developer position including salary, benefits, non-compete clause, and termination terms.',
        key_terms: ['Salary: R850,000 per annum', 'Notice Period: 30 days', 'Non-compete: 6 months'],
        parties: ['John Smith', companies.data.data[0].name],
        effective_date: '2024-03-01',
        expiry_date: null,
        risk_score: 35,
        compliance_status: 'review_required',
        popia_compliant: true,
        fica_compliant: true,
      },
      {
        title: 'Lease Agreement - Office Space Cape Town',
        document_type: 'lease',
        company_id: companies.data.data[2]?.id || companies.data.data[0].id,
        status: 'active',
        summary: 'Commercial lease agreement for 500 sqm office space in Cape Town CBD. Includes rental escalation clause, maintenance obligations, and renewal options.',
        key_terms: ['Monthly Rent: R125,000', 'Escalation: 7% annual', 'Term: 3 years with 2-year renewal option'],
        parties: [companies.data.data[2]?.name || 'Tenant', 'Property Holdings Ltd'],
        effective_date: '2024-01-01',
        expiry_date: '2027-01-01',
        risk_score: 45,
        compliance_status: 'review_required',
        popia_compliant: false,
        fica_compliant: false,
      },
      {
        title: 'Software License Agreement - Enterprise Plan',
        document_type: 'license',
        company_id: companies.data.data[3]?.id || companies.data.data[0].id,
        status: 'active',
        summary: 'Enterprise software license for CRM platform with unlimited users, premium support, and custom integration capabilities.',
        key_terms: ['Annual Fee: $50,000', 'Unlimited Users', 'Premium Support 24/7'],
        parties: [companies.data.data[3]?.name || 'Licensee', 'Software Vendor Inc.'],
        effective_date: '2024-04-01',
        expiry_date: '2025-04-01',
        risk_score: 20,
        compliance_status: 'compliant',
        popia_compliant: true,
        fica_compliant: false,
      },
    ];

    let inserted = 0;
    for (const doc of documents) {
      try {
        await axios.post(`${BASE_URL}/legal/documents`, doc, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(`✅ Created: ${doc.title}`);
        inserted++;
      } catch (error) {
        console.error(`❌ Failed: ${doc.title} - ${error.response?.data?.message || error.message}`);
      }
    }

    console.log(`\n✨ Successfully seeded ${inserted}/${documents.length} legal documents!`);

    // Verify
    const allDocs = await axios.get(`${BASE_URL}/legal/documents`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`\n📄 Total documents in database: ${allDocs.data.data.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

seedDocuments();
