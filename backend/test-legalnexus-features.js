/**
 * LegalNexus Features Comprehensive Test
 * Tests all newly implemented reporting endpoints and Vicktoria AI
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';
const TEST_EMAIL = 'admin@example.com';
const TEST_PASSWORD = 'password123';

let authToken = '';

// ANSI color codes for beautiful console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`),
  section: (msg) => console.log(`${colors.bright}${colors.blue}📊 ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}  ✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}  ❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}  ⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}  ℹ️  ${msg}${colors.reset}`),
  data: (label, value) => console.log(`${colors.magenta}     ${label}:${colors.reset} ${value}`),
};

async function login() {
  log.header();
  log.section('Authenticating...');

  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    authToken = response.data.data.token;
    log.success(`Logged in as ${TEST_EMAIL}`);
    log.data('Token', authToken.substring(0, 20) + '...');
    return true;
  } catch (error) {
    log.error(`Login failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testFeeEarnerRankings() {
  log.header();
  log.section('Testing Fee Earner Rankings');

  try {
    const response = await axios.get(`${BASE_URL}/reporting/fee-earners?period=month`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const data = response.data.data;
    const meta = response.data.meta;

    log.success('Fee Earner Rankings endpoint working');
    log.data('Total Attorneys', meta.total_attorneys);
    log.data('Period', meta.period);

    if (data && data.length > 0) {
      const totalRevenue = data.reduce((sum, e) => sum + parseFloat(e.total_revenue || 0), 0);
      const totalHours = data.reduce((sum, e) => sum + parseFloat(e.total_hours || 0), 0);

      log.data('Total Revenue', `R ${totalRevenue.toLocaleString()}`);
      log.data('Total Hours', totalHours.toFixed(2));

      log.info('Top 3 Earners:');
      data.slice(0, 3).forEach((earner, idx) => {
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
        log.data(
          `  ${medal} #${earner.rank} ${earner.name}`,
          `R ${parseFloat(earner.total_revenue).toLocaleString()} (${parseFloat(earner.total_hours).toFixed(2)}h)`
        );
      });
    } else {
      log.warning('No fee earner data found (need sample time entries)');
    }

    return true;
  } catch (error) {
    log.error(`Fee Earner Rankings failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testPracticeAreaAnalytics() {
  log.header();
  log.section('Testing Practice Area Analytics');

  try {
    const response = await axios.get(`${BASE_URL}/reporting/practice-areas?period=month`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const data = response.data.data;
    const meta = response.data.meta;

    log.success('Practice Area Analytics endpoint working');
    log.data('Total Departments', meta.total_departments || data.length);
    log.data('Period', meta.period);

    if (data && data.length > 0) {
      const totalRevenue = data.reduce((sum, e) => sum + parseFloat(e.total_revenue || 0), 0);

      log.data('Total Revenue', `R ${totalRevenue.toLocaleString()}`);
      log.info('Department Breakdown:');

      data.forEach((dept) => {
        log.data(
          `  ${dept.department}`,
          `R ${parseFloat(dept.total_revenue).toLocaleString()} | ${parseFloat(dept.total_hours).toFixed(2)}h | ${dept.matters_count} matters`
        );
      });
    } else {
      log.warning('No practice area data found');
    }

    return true;
  } catch (error) {
    log.error(`Practice Area Analytics failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testWorkloadMetrics() {
  log.header();
  log.section('Testing 50-Seat Load Index (Workload Metrics)');

  try {
    const response = await axios.get(`${BASE_URL}/reporting/workload`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const data = response.data.data;
    const meta = response.data.meta;

    log.success('50-Seat Load Index endpoint working');
    log.data('Total Users', meta.total_users || data.length);

    if (data && data.length > 0) {
      const avgUtil = data.reduce((sum, u) => sum + parseFloat(u.utilization_percentage || 0), 0) / data.length;
      const green = data.filter(u => u.capacity_status === 'green').length;
      const amber = data.filter(u => u.capacity_status === 'amber').length;
      const red = data.filter(u => u.capacity_status === 'red').length;

      log.data('Avg Utilization', `${avgUtil.toFixed(2)}%`);
      log.data('Capacity Status', `🟢 ${green} | 🟡 ${amber} | 🔴 ${red}`);

      log.info('Capacity Breakdown:');
      data.slice(0, 5).forEach((user) => {
        const statusIcon = user.capacity_status === 'green' ? '🟢' : user.capacity_status === 'amber' ? '🟡' : '🔴';
        log.data(
          `  ${statusIcon} ${user.name}`,
          `${parseFloat(user.utilization_percentage).toFixed(2)}% (${parseFloat(user.total_hours_logged || 0).toFixed(2)}/${user.available_hours}h) | ${user.matters_count} matters`
        );
      });
    } else {
      log.warning('No workload data found');
    }

    return true;
  } catch (error) {
    log.error(`Workload Metrics failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testBillingInertia() {
  log.header();
  log.section('Testing Billing Inertia Detection');

  try {
    const response = await axios.get(`${BASE_URL}/reporting/billing-inertia`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const data = response.data.data;
    const meta = response.data.meta;

    log.success('Billing Inertia endpoint working');
    log.data('Attorneys with Inertia', meta.total_attorneys || data.length);

    if (data && data.length > 0) {
      const totalUnbilled = data.reduce((sum, a) => sum + parseFloat(a.unbilled_amount || 0), 0);
      const totalHours = data.reduce((sum, a) => sum + parseFloat(a.unbilled_hours || 0), 0);

      log.data('Total Unbilled Revenue', `R ${totalUnbilled.toLocaleString()}`);
      log.data('Total Unbilled Hours', totalHours.toFixed(2));

      log.info('Inertia Breakdown:');
      data.slice(0, 5).forEach((attorney) => {
        const severity = parseInt(attorney.inertia_score) >= 75 ? '🔴' : parseInt(attorney.inertia_score) >= 50 ? '🟡' : '🟢';
        log.data(
          `  ${severity} ${attorney.name}`,
          `Score: ${attorney.inertia_score} | R ${parseFloat(attorney.unbilled_amount).toLocaleString()} | ${attorney.days_overdue} days overdue`
        );
      });
    } else {
      log.success('No billing inertia detected! All attorneys are current 🎉');
    }

    return true;
  } catch (error) {
    log.error(`Billing Inertia failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testPracticeVelocity() {
  log.header();
  log.section('Testing Practice Velocity (Burn Rate)');

  try {
    const response = await axios.get(`${BASE_URL}/reporting/practice-velocity`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const data = response.data.data;
    const meta = response.data.meta;

    log.success('Practice Velocity endpoint working');
    log.data('Total Matters', meta.total_matters || data.length);

    if (data && data.length > 0) {
      const totalRevenue = data.reduce((sum, m) => sum + parseFloat(m.billable_revenue || 0), 0);
      const avgBurn = data.reduce((sum, m) => sum + parseFloat(m.burn_rate || 0), 0) / data.length;

      log.data('Total Revenue', `R ${totalRevenue.toLocaleString()}`);
      log.data('Avg Burn Rate', `${avgBurn.toFixed(2)}%`);

      log.info('Matter Burn Rates (Top 5):');
      data.slice(0, 5).forEach((matter) => {
        const health = matter.health_status === 'healthy' ? '🟢' : matter.health_status === 'warning' ? '🟡' : '🔴';
        log.data(
          `  ${health} ${matter.matter_number}`,
          `${parseFloat(matter.burn_rate).toFixed(2)}% burn | R ${parseFloat(matter.billable_revenue || 0).toLocaleString()} revenue | R ${parseFloat(matter.total_cost || 0).toLocaleString()} cost`
        );
      });
    } else {
      log.warning('No practice velocity data found');
    }

    return true;
  } catch (error) {
    log.error(`Practice Velocity failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testExecutiveSummary() {
  log.header();
  log.section('Testing Executive Summary (Soul Logic)');

  try {
    const response = await axios.get(`${BASE_URL}/reporting/executive-summary`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const data = response.data.data;

    log.success('Executive Summary endpoint working');

    // Handle different possible response structures
    if (data.soulLogicScore !== undefined) {
      log.data('🧠 Soul Logic Score', `${data.soulLogicScore}/100`);
    }

    if (data.metrics) {
      log.data('Total Revenue (30 days)', `R ${parseFloat(data.metrics.totalRevenue || 0).toLocaleString()}`);
      log.data('Billable Hours', data.metrics.billableHours || 0);
      log.data('Average Utilization', `${data.metrics.averageUtilization || 0}%`);
      log.data('Unbilled Revenue at Risk', `R ${parseFloat(data.metrics.unbilledRevenueAtRisk || 0).toLocaleString()}`);
    } else {
      // Fallback if metrics is in a different structure
      log.data('Response structure', JSON.stringify(data, null, 2).substring(0, 200) + '...');
    }

    if (data.energyDrains && data.energyDrains.length > 0) {
      log.warning('Energy Drains Detected:');
      data.energyDrains.forEach((drain) => {
        const severityIcon = drain.severity === 'high' ? '🔴' : drain.severity === 'medium' ? '🟡' : '🟢';
        log.data(`  ${severityIcon} ${drain.type}`, drain.description);
      });
    } else {
      log.success('No energy drains! Firm operating optimally 🎉');
    }

    return true;
  } catch (error) {
    log.error(`Executive Summary failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testVicktoriaAI() {
  log.header();
  log.section('Testing Vicktoria AI Assistant');

  try {
    const response = await axios.post(
      `${BASE_URL}/ai-assistant/chat`,
      {
        message: 'What is LegalNexus and what features do you provide?',
        context: 'general',
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    const { response: aiResponse, suggestions } = response.data.data;

    log.success('Vicktoria AI endpoint working');
    log.data('AI Response Length', `${aiResponse.length} characters`);
    log.data('Response Preview', aiResponse.substring(0, 150) + '...');

    if (suggestions && suggestions.length > 0) {
      log.info('AI Suggestions:');
      suggestions.slice(0, 3).forEach((suggestion, idx) => {
        log.data(`  ${idx + 1}`, suggestion);
      });
    }

    return true;
  } catch (error) {
    log.error(`Vicktoria AI failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log(`\n${colors.bright}${colors.magenta}╔${'═'.repeat(58)}╗${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta}║  🎉 LegalNexus Features Comprehensive Test Suite      ║${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta}╚${'═'.repeat(58)}╝${colors.reset}`);
  console.log(`${colors.cyan}Testing all newly implemented LegalNexus reporting features${colors.reset}`);

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  // Login first
  const loginSuccess = await login();
  if (!loginSuccess) {
    log.error('Cannot proceed without authentication');
    process.exit(1);
  }

  // Run all feature tests
  const tests = [
    { name: 'Fee Earner Rankings', fn: testFeeEarnerRankings },
    { name: 'Practice Area Analytics', fn: testPracticeAreaAnalytics },
    { name: '50-Seat Load Index', fn: testWorkloadMetrics },
    { name: 'Billing Inertia Detection', fn: testBillingInertia },
    { name: 'Practice Velocity', fn: testPracticeVelocity },
    { name: 'Executive Summary (Soul Logic)', fn: testExecutiveSummary },
    { name: 'Vicktoria AI Assistant', fn: testVicktoriaAI },
  ];

  for (const test of tests) {
    results.total++;
    const success = await test.fn();
    if (success) {
      results.passed++;
    } else {
      results.failed++;
    }
  }

  // Final Summary
  log.header();
  console.log(`\n${colors.bright}${colors.magenta}╔${'═'.repeat(58)}╗${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta}║  📊 TEST RESULTS SUMMARY                               ║${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta}╚${'═'.repeat(58)}╝${colors.reset}\n`);

  log.data('Total Tests', results.total);
  log.data('Passed', `${colors.green}${results.passed}${colors.reset}`);
  log.data('Failed', results.failed > 0 ? `${colors.red}${results.failed}${colors.reset}` : '0');
  log.data('Success Rate', `${Math.round((results.passed / results.total) * 100)}%`);

  if (results.failed === 0) {
    console.log(`\n${colors.bright}${colors.green}✨ ALL LEGALNEXUS FEATURES WORKING! ✨${colors.reset}\n`);
  } else {
    console.log(`\n${colors.bright}${colors.yellow}⚠️  Some features need attention${colors.reset}\n`);
  }

  console.log(`${colors.cyan}Frontend Dashboard: ${colors.bright}http://localhost:5173/reporting${colors.reset}\n`);

  process.exit(results.failed === 0 ? 0 : 1);
}

// Run tests
runAllTests().catch((error) => {
  log.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
