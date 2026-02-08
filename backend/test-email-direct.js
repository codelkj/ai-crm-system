/**
 * Direct Email Test (No TypeScript compilation needed)
 * Tests SMTP configuration by sending a test email
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendDirectEmail() {
  console.log('📧 Direct Email Test\n');
  console.log('=' .repeat(60));

  try {
    console.log('📋 SMTP Configuration:');
    console.log(`   Host: ${process.env.SMTP_HOST}`);
    console.log(`   Port: ${process.env.SMTP_PORT}`);
    console.log(`   User: ${process.env.SMTP_USER}`);
    console.log(`   Secure: ${process.env.SMTP_SECURE || 'false'}\n`);

    // Create transporter
    console.log('🔧 Creating SMTP transporter...');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log('✅ Transporter created\n');

    // Verify connection
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified!\n');

    // Prepare email
    const emailData = {
      from: `"${process.env.SMTP_FROM_NAME || 'LegalNexus'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: '⚠️ TEST: Billing Inertia Alert - R1,100,531.67 at Risk',
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .alert-box { background: #fff3cd; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; }
    .stats { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .stat-value { color: #f39c12; font-size: 20px; font-weight: bold; }
    .cta-button { display: inline-block; background: #f39c12; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #6c757d; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚡ LegalNexus Alert</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">Billing Inertia Detection System</p>
    </div>

    <div class="alert-box">
      <h2 style="margin: 0 0 10px 0; color: #856404;">⚠️ TEST EMAIL - Immediate Action Required</h2>
      <p>This is a <strong>test email</strong> from the LegalNexus billing inertia system.</p>
    </div>

    <div class="stats">
      <p><strong>Total Revenue at Risk:</strong> <span class="stat-value">R 1,100,531.67</span></p>
      <p><strong>Attorneys Affected:</strong> <span class="stat-value">8</span></p>
      <p><strong>Critical Cases:</strong> <span class="stat-value">5</span></p>
    </div>

    <div style="background: white; border: 1px solid #dee2e6; border-radius: 6px; padding: 12px; margin: 10px 0;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-weight: bold;">Michael Chen</span>
        <span style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Score: 100</span>
      </div>
      <div style="font-size: 14px; color: #6c757d;">
        💰 Unbilled: R 200,620 | ⏰ 351 days overdue
      </div>
    </div>

    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/reporting" class="cta-button">
        View Full Report
      </a>
    </div>

    <div class="footer">
      <p><strong>✅ EMAIL SYSTEM TEST SUCCESSFUL!</strong></p>
      <p>This is an automated alert from <strong>Vicktoria AI</strong></p>
      <p>LegalNexus Enterprise | Soul Logic Powered</p>
    </div>
  </div>
</body>
</html>
      `,
    };

    // Send email
    console.log('📤 Sending test email...');
    console.log(`   To: ${emailData.to}`);
    console.log(`   Subject: ${emailData.subject}\n`);

    const info = await transporter.sendMail(emailData);

    console.log('=' .repeat(60));
    console.log('✅ EMAIL SENT SUCCESSFULLY!\n');
    console.log('📬 Email Details:');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   To: ${emailData.to}`);
    console.log(`   From: ${emailData.from}`);
    console.log(`   Subject: ${emailData.subject}\n`);
    console.log('📧 Check your inbox:', process.env.SMTP_USER);
    console.log('   (Check spam folder if not in inbox)\n');
    console.log('Email includes:');
    console.log('   ✅ LegalNexus header with branding');
    console.log('   ✅ Alert banner');
    console.log('   ✅ Revenue statistics');
    console.log('   ✅ Sample critical case');
    console.log('   ✅ Link to dashboard');
    console.log('   ✅ Vicktoria AI footer');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Verify Gmail App Password is correct (16 chars, no spaces)');
    console.error('   2. Check that 2FA is enabled on Gmail account');
    console.error('   3. Ensure "Less secure app access" is not blocking (not needed with App Password)');
    console.error('   4. Try generating a new App Password');
    console.error('   5. Check firewall allows outbound SMTP on port 587');

    if (error.code) {
      console.error(`\n   Error Code: ${error.code}`);
    }
    if (error.command) {
      console.error(`   Failed Command: ${error.command}`);
    }
  }
}

sendDirectEmail();
