/**
 * Test PDF Export Functionality
 * Tests all PDF export endpoints
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testPDFExport() {
  console.log('🧪 Testing PDF Export Functionality\n');

  try {
    // Login first
    console.log('1️⃣ Logging in...');
    const login = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123',
    });
    const token = login.data.data.token;
    console.log('✅ Logged in successfully\n');

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // Create downloads directory
    const downloadsDir = path.join(__dirname, 'pdf-exports');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir);
    }

    // Test 1: Fee Earner Rankings PDF
    console.log('2️⃣ Testing Fee Earner Rankings PDF export...');
    try {
      const response1 = await axios.get(
        `${BASE_URL}/reporting/fee-earners/export-pdf?period=month`,
        {
          headers,
          responseType: 'arraybuffer',
        }
      );

      const filename1 = path.join(downloadsDir, `fee-earners-${Date.now()}.pdf`);
      fs.writeFileSync(filename1, response1.data);
      console.log(`✅ Fee Earner Rankings PDF created: ${filename1}`);
      console.log(`   Size: ${(response1.data.length / 1024).toFixed(2)} KB\n`);
    } catch (error) {
      console.log(`❌ Fee Earner Rankings PDF failed: ${error.response?.status} - ${error.message}\n`);
    }

    // Test 2: Practice Area Analytics PDF
    console.log('3️⃣ Testing Practice Area Analytics PDF export...');
    try {
      const response2 = await axios.get(
        `${BASE_URL}/reporting/practice-areas/export-pdf?period=month`,
        {
          headers,
          responseType: 'arraybuffer',
        }
      );

      const filename2 = path.join(downloadsDir, `practice-areas-${Date.now()}.pdf`);
      fs.writeFileSync(filename2, response2.data);
      console.log(`✅ Practice Area Analytics PDF created: ${filename2}`);
      console.log(`   Size: ${(response2.data.length / 1024).toFixed(2)} KB\n`);
    } catch (error) {
      console.log(`❌ Practice Area Analytics PDF failed: ${error.response?.status} - ${error.message}\n`);
    }

    // Test 3: Billing Inertia PDF
    console.log('4️⃣ Testing Billing Inertia PDF export...');
    try {
      const response3 = await axios.get(
        `${BASE_URL}/reporting/billing-inertia/export-pdf`,
        {
          headers,
          responseType: 'arraybuffer',
        }
      );

      const filename3 = path.join(downloadsDir, `billing-inertia-${Date.now()}.pdf`);
      fs.writeFileSync(filename3, response3.data);
      console.log(`✅ Billing Inertia PDF created: ${filename3}`);
      console.log(`   Size: ${(response3.data.length / 1024).toFixed(2)} KB\n`);
    } catch (error) {
      console.log(`❌ Billing Inertia PDF failed: ${error.response?.status} - ${error.message}\n`);
    }

    // Test 4: Executive Summary PDF
    console.log('5️⃣ Testing Executive Summary PDF export...');
    try {
      const response4 = await axios.get(
        `${BASE_URL}/reporting/executive-summary/export-pdf?period=month`,
        {
          headers,
          responseType: 'arraybuffer',
        }
      );

      const filename4 = path.join(downloadsDir, `executive-summary-${Date.now()}.pdf`);
      fs.writeFileSync(filename4, response4.data);
      console.log(`✅ Executive Summary PDF created: ${filename4}`);
      console.log(`   Size: ${(response4.data.length / 1024).toFixed(2)} KB\n`);
    } catch (error) {
      console.log(`❌ Executive Summary PDF failed: ${error.response?.status} - ${error.message}\n`);
    }

    // Summary
    console.log('=' .repeat(60));
    console.log('📊 PDF Export Test Summary');
    console.log('=' .repeat(60));
    console.log(`📁 All PDFs saved to: ${downloadsDir}`);
    console.log('✨ Open the PDFs to verify:');
    console.log('   - LegalNexus branding and headers');
    console.log('   - Data tables and visualizations');
    console.log('   - Color-coded elements');
    console.log('   - Professional formatting');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPDFExport();
