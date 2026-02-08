/**
 * Send Test Email Alert
 * Manually triggers a billing inertia email to test SMTP configuration
 */

require('dotenv').config();

async function sendTestEmail() {
  console.log('📧 Sending Test Email Alert\n');
  console.log('=' .repeat(60));

  try {
    // Import services after dotenv is loaded
    const emailService = require('./dist/shared/services/email.service').default;

    console.log('✅ Email service loaded');
    console.log('📧 SMTP Configuration:');
    console.log(`   Host: ${process.env.SMTP_HOST}`);
    console.log(`   Port: ${process.env.SMTP_PORT}`);
    console.log(`   User: ${process.env.SMTP_USER}`);
    console.log(`   From: ${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>\n`);

    // Sample billing inertia data
    const testData = {
      totalAtRisk: 1100531.67,
      totalAttorneys: 8,
      criticalCases: [
        { name: 'Michael Chen', unbilledAmount: 200620, daysOverdue: 351, inertiaScore: 100 },
        { name: 'Sarah Mitchell', unbilledAmount: 149250, daysOverdue: 347, inertiaScore: 100 },
        { name: 'David Thompson', unbilledAmount: 142706.67, daysOverdue: 346, inertiaScore: 100 },
        { name: 'Amanda Parker', unbilledAmount: 141028.33, daysOverdue: 329, inertiaScore: 100 },
        { name: 'James Anderson', unbilledAmount: 126400, daysOverdue: 347, inertiaScore: 100 },
      ],
    };

    console.log('📊 Test Alert Data:');
    console.log(`   Revenue at Risk: R ${testData.totalAtRisk.toLocaleString()}`);
    console.log(`   Attorneys Affected: ${testData.totalAttorneys}`);
    console.log(`   Critical Cases: ${testData.criticalCases.length}\n`);

    console.log('📤 Sending email to:', process.env.SMTP_USER);
    console.log('   Subject: ⚠️ Billing Inertia Alert: R1,100,531.67 at Risk\n');

    // Send the email
    const result = await emailService.sendBillingInertiaAlert(
      process.env.SMTP_USER, // Send to your own email for testing
      'Demo Law Firm',
      testData
    );

    if (result) {
      console.log('=' .repeat(60));
      console.log('✅ EMAIL SENT SUCCESSFULLY!\n');
      console.log('📬 Check your inbox:', process.env.SMTP_USER);
      console.log('📧 Subject: ⚠️ Billing Inertia Alert: R1,100,531.67 at Risk');
      console.log('📁 Check spam folder if not in inbox\n');
      console.log('Email includes:');
      console.log('   - LegalNexus header with branding');
      console.log('   - Revenue at risk summary');
      console.log('   - Critical cases list');
      console.log('   - Direct link to reporting dashboard');
      console.log('   - Vicktoria AI footer');
      console.log('=' .repeat(60));
    } else {
      console.log('❌ Email sending failed');
      console.log('   Check SMTP configuration in .env');
      console.log('   Verify Gmail App Password is correct');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Verify SMTP_USER is correct');
    console.error('   2. Verify SMTP_PASS is the App Password (not regular password)');
    console.error('   3. Check that 2FA is enabled on Gmail');
    console.error('   4. Ensure backend server is running');
    console.error('   5. Check backend logs for detailed errors');
  }
}

sendTestEmail();
