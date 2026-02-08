/**
 * Preview Email Alert HTML
 * Generates a sample email alert for preview
 */

const fs = require('fs');
const path = require('path');

// Sample billing inertia data
const sampleData = {
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

const firmName = 'Demo Law Firm';

const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); color: white; padding: 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 5px 0 0 0; opacity: 0.9; }
    .alert-box { background: #fff3cd; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; }
    .alert-box h2 { margin: 0 0 10px 0; color: #856404; font-size: 18px; }
    .stats { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .stat-item { margin: 10px 0; }
    .stat-label { font-weight: bold; color: #2c3e50; }
    .stat-value { color: #f39c12; font-size: 18px; font-weight: bold; }
    .critical-cases { margin: 20px 0; }
    .case-card { background: white; border: 1px solid #dee2e6; border-radius: 6px; padding: 12px; margin: 10px 0; }
    .case-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .case-name { font-weight: bold; color: #2c3e50; }
    .case-score { background: #dc3545; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
    .case-details { font-size: 14px; color: #6c757d; }
    .footer { text-align: center; color: #6c757d; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; }
    .cta-button { display: inline-block; background: #f39c12; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚡ LegalNexus Alert</h1>
      <p>Billing Inertia Detection System</p>
    </div>

    <div class="alert-box">
      <h2>⚠️ Immediate Action Required</h2>
      <p>Billing inertia has been detected at <strong>${firmName}</strong>. Revenue is at risk and requires immediate attention.</p>
    </div>

    <div class="stats">
      <div class="stat-item">
        <span class="stat-label">Total Revenue at Risk:</span>
        <span class="stat-value">R ${sampleData.totalAtRisk.toLocaleString()}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Attorneys Affected:</span>
        <span class="stat-value">${sampleData.totalAttorneys}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Critical Cases:</span>
        <span class="stat-value">${sampleData.criticalCases.length}</span>
      </div>
    </div>

    <div class="critical-cases">
      <h3 style="color: #2c3e50;">Critical Cases Requiring Immediate Action:</h3>
      ${sampleData.criticalCases.map(c => `
        <div class="case-card">
          <div class="case-header">
            <span class="case-name">${c.name}</span>
            <span class="case-score">Inertia Score: ${c.inertiaScore}</span>
          </div>
          <div class="case-details">
            💰 Unbilled: R ${c.unbilledAmount.toLocaleString()} |
            ⏰ ${c.daysOverdue} days overdue
          </div>
        </div>
      `).join('')}
    </div>

    <div style="text-align: center;">
      <a href="http://localhost:5173/reporting" class="cta-button">
        View Full Report
      </a>
    </div>

    <div class="footer">
      <p>This is an automated alert from <strong>Vicktoria AI</strong></p>
      <p>LegalNexus Enterprise | Soul Logic Powered</p>
      <p style="margin-top: 10px;">
        To configure alert thresholds, visit your LegalNexus settings.
      </p>
    </div>
  </div>
</body>
</html>
`;

// Save to file
const outputPath = path.join(__dirname, 'email-alert-preview.html');
fs.writeFileSync(outputPath, html);

console.log('📧 Email Alert Preview Generated!\n');
console.log('=' .repeat(60));
console.log('📁 File saved to:', outputPath);
console.log('🌐 Open in browser to preview the email\n');
console.log('Email Details:');
console.log(`   Subject: ⚠️ Billing Inertia Alert: R${sampleData.totalAtRisk.toLocaleString()} at Risk`);
console.log(`   To: Partners, Directors, Managing Partners`);
console.log(`   From: LegalNexus <noreply@legalnexus.com>`);
console.log('=' .repeat(60));

// Open in browser
const { exec } = require('child_process');
exec(`start ${outputPath}`, (error) => {
  if (error) {
    console.log('\n✅ Preview generated. Open manually:', outputPath);
  } else {
    console.log('\n✅ Preview opened in your default browser');
  }
});
