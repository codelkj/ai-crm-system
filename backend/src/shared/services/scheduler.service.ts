/**
 * Scheduler Service using node-cron
 * Handles scheduled tasks like billing inertia alerts
 */

import cron from 'node-cron';
import emailService from './email.service';
import reportingService from '../../modules/reporting/services/reporting.service';
import { database as pool } from '../../config';

class SchedulerService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  /**
   * Initialize all scheduled jobs
   */
  async initialize() {
    console.log('🕐 Initializing scheduled jobs...');

    // Daily Billing Inertia Check (9 AM every day)
    this.scheduleBillingInertiaCheck();

    console.log(`✅ ${this.jobs.size} scheduled job(s) initialized`);
  }

  /**
   * Schedule daily billing inertia check
   * Runs at 9:00 AM every day
   */
  private scheduleBillingInertiaCheck() {
    const job = cron.schedule('0 9 * * *', async () => {
      console.log('🔍 Running scheduled billing inertia check...');
      await this.checkBillingInertiaAllFirms();
    });

    this.jobs.set('billing-inertia-check', job);
    console.log('  📧 Billing Inertia Check: Daily at 9:00 AM');
  }

  /**
   * Check billing inertia for all firms and send alerts
   */
  private async checkBillingInertiaAllFirms() {
    try {
      // Get all active firms
      const firmsResult = await pool.query(
        'SELECT id, name FROM firms WHERE is_active = true'
      );

      for (const firm of firmsResult.rows) {
        await this.checkBillingInertiaForFirm(firm.id, firm.name);
      }
    } catch (error) {
      console.error('❌ Error checking billing inertia:', error);
    }
  }

  /**
   * Check billing inertia for a specific firm
   */
  private async checkBillingInertiaForFirm(firmId: string, firmName: string) {
    try {
      // Get billing inertia data
      const inertia = await reportingService.getBillingInertia(firmId);

      // Check if there's any inertia to report
      if (inertia.length === 0) {
        console.log(`  ✅ ${firmName}: No billing inertia detected`);
        return;
      }

      const totalAtRisk = inertia.reduce((sum, i) => sum + i.unbilled_amount, 0);
      const criticalCases = inertia
        .filter(i => i.inertia_score >= 75)
        .slice(0, 5)
        .map(i => ({
          name: i.name,
          unbilledAmount: i.unbilled_amount,
          daysOverdue: i.days_overdue,
          inertiaScore: i.inertia_score,
        }));

      console.log(`  ⚠️  ${firmName}: R${totalAtRisk.toLocaleString()} at risk, ${criticalCases.length} critical cases`);

      // Get Partners/Directors to send alerts to
      const recipientsResult = await pool.query(
        `SELECT DISTINCT u.email, u.first_name, u.last_name
         FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE u.firm_id = $1
           AND r.name IN ('Partner', 'Director', 'Managing Partner')
           AND u.is_active = true`,
        [firmId]
      );

      // Send alerts to all Partners/Directors
      for (const recipient of recipientsResult.rows) {
        await emailService.sendBillingInertiaAlert(
          recipient.email,
          firmName,
          {
            totalAtRisk,
            totalAttorneys: inertia.length,
            criticalCases,
          }
        );
      }

      console.log(`  📧 Sent ${recipientsResult.rows.length} alert(s) for ${firmName}`);
    } catch (error) {
      console.error(`❌ Error checking billing inertia for ${firmName}:`, error);
    }
  }

  /**
   * Manually trigger billing inertia check (for testing)
   */
  async triggerBillingInertiaCheck() {
    console.log('🔧 Manually triggering billing inertia check...');
    await this.checkBillingInertiaAllFirms();
  }

  /**
   * Stop all scheduled jobs
   */
  stopAll() {
    console.log('⏹️  Stopping all scheduled jobs...');
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`  Stopped: ${name}`);
    });
    this.jobs.clear();
  }
}

export default new SchedulerService();
