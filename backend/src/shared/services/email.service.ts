/**
 * Email Service using Nodemailer
 * Handles all email sending functionality
 */

import nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  cc?: string | string[];
  bcc?: string | string[];
}

class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Check if email is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      console.warn('⚠️  Email not configured. Set SMTP_* environment variables to enable email alerts.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      console.log('✅ Email service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
    }
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.warn('Email service not configured. Skipping email:', options.subject);
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'LegalNexus'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
        subject: options.subject,
        html: options.html,
      });

      console.log('✅ Email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send Billing Inertia Alert
   */
  async sendBillingInertiaAlert(
    recipientEmail: string,
    firmName: string,
    inertiaData: {
      totalAtRisk: number;
      totalAttorneys: number;
      criticalCases: Array<{
        name: string;
        unbilledAmount: number;
        daysOverdue: number;
        inertiaScore: number;
      }>;
    }
  ): Promise<boolean> {
    const subject = `⚠️ Billing Inertia Alert: R${inertiaData.totalAtRisk.toLocaleString()} at Risk`;

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
              <span class="stat-value">R ${inertiaData.totalAtRisk.toLocaleString()}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Attorneys Affected:</span>
              <span class="stat-value">${inertiaData.totalAttorneys}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Critical Cases:</span>
              <span class="stat-value">${inertiaData.criticalCases.length}</span>
            </div>
          </div>

          <div class="critical-cases">
            <h3 style="color: #2c3e50;">Critical Cases Requiring Immediate Action:</h3>
            ${inertiaData.criticalCases.map(c => `
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
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/reporting" class="cta-button">
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

    return this.sendEmail({
      to: recipientEmail,
      subject,
      html,
    });
  }
}

export default new EmailService();
