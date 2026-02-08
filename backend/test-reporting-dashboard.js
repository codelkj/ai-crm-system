const axios = require('axios');

async function testReportingDashboard() {
  const BASE_URL = 'http://localhost:3000/api/v1';
  let token = '';

  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║     🎯 LEGALNEXUS REPORTING DASHBOARD TEST SUITE       ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  // 1. Login
  try {
    console.log('🔐 Authenticating...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });
    token = loginRes.data.data.token;
    console.log('✅ Authentication successful\n');
  } catch (err) {
    console.log('❌ Login failed:', err.response?.data?.message || err.message);
    return;
  }

  const headers = { Authorization: `Bearer ${token}` };

  // Test 1: Fee Earner Rankings
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1️⃣  FEE EARNER RANKINGS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const periods = ['month', 'quarter', 'year'];
    for (const period of periods) {
      const res = await axios.get(`${BASE_URL}/reporting/fee-earners?period=${period}`, {
        headers,
        timeout: 10000
      });

      console.log(`\n📊 Period: ${period.toUpperCase()}`);
      console.log(`   Status: ✅ Working`);
      console.log(`   Attorneys Found: ${res.data.data.length}`);

      if (res.data.data.length > 0) {
        const top = res.data.data[0];
        console.log(`   Top Earner: ${top.name}`);
        console.log(`   Revenue: R ${top.total_revenue.toLocaleString()}`);
        console.log(`   Hours: ${top.total_hours}`);
        console.log(`   Rank: #${top.rank}`);
      }
    }
    console.log('\n✅ Fee Earner Rankings: PASSED\n');
  } catch (err) {
    console.log(`   Status: ❌ Failed`);
    console.log(`   Error: ${err.response?.status} - ${err.response?.data?.message || err.message}\n`);
  }

  // Test 2: Practice Area Analytics
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('2️⃣  PRACTICE AREA ANALYTICS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const res = await axios.get(`${BASE_URL}/reporting/practice-areas?period=month`, {
      headers,
      timeout: 10000
    });

    console.log(`   Status: ✅ Working`);
    console.log(`   Departments Found: ${res.data.data.length}`);

    if (res.data.data.length > 0) {
      console.log('\n   📈 Department Breakdown:');
      res.data.data.forEach(dept => {
        console.log(`   - ${dept.department_name}:`);
        console.log(`     Revenue: R ${dept.total_revenue.toLocaleString()}`);
        console.log(`     Hours: ${dept.total_hours}`);
        console.log(`     Matters: ${dept.matters_count}`);
        console.log(`     Utilization: ${dept.utilization_rate.toFixed(1)}%`);
      });
    }
    console.log('\n✅ Practice Area Analytics: PASSED\n');
  } catch (err) {
    console.log(`   Status: ❌ Failed`);
    console.log(`   Error: ${err.response?.status} - ${err.response?.data?.message || err.message}\n`);
  }

  // Test 3: 50-Seat Load Index (Workload)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('3️⃣  50-SEAT LOAD INDEX (Resource Utilization)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const res = await axios.get(`${BASE_URL}/reporting/workload`, {
      headers,
      timeout: 10000
    });

    console.log(`   Status: ✅ Working`);
    console.log(`   Attorneys Tracked: ${res.data.data.length}`);

    if (res.data.summary) {
      console.log(`\n   📊 Capacity Summary:`);
      console.log(`   🟢 Green (Available): ${res.data.summary.green}`);
      console.log(`   🟡 Amber (Near Capacity): ${res.data.summary.amber}`);
      console.log(`   🔴 Red (At/Over Capacity): ${res.data.summary.red}`);
      console.log(`   📈 Avg Utilization: ${res.data.summary.avg_utilization.toFixed(1)}%`);
    }

    if (res.data.data.length > 0) {
      console.log('\n   👥 Top 5 by Utilization:');
      res.data.data.slice(0, 5).forEach((attorney, i) => {
        const indicator =
          attorney.capacity_status === 'red' ? '🔴' :
          attorney.capacity_status === 'amber' ? '🟡' : '🟢';
        console.log(`   ${i + 1}. ${attorney.name}: ${attorney.utilization_percentage.toFixed(1)}% ${indicator}`);
      });
    }
    console.log('\n✅ 50-Seat Load Index: PASSED\n');
  } catch (err) {
    console.log(`   Status: ❌ Failed`);
    console.log(`   Error: ${err.response?.status} - ${err.response?.data?.message || err.message}\n`);
  }

  // Test 4: Billing Inertia
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('4️⃣  BILLING INERTIA DETECTION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const res = await axios.get(`${BASE_URL}/reporting/billing-inertia`, {
      headers,
      timeout: 10000
    });

    console.log(`   Status: ✅ Working`);
    console.log(`   Attorneys with Inertia: ${res.data.data.length}`);

    if (res.data.summary) {
      console.log(`\n   ⚠️ Inertia Summary:`);
      console.log(`   Total Unbilled Hours: ${res.data.summary.total_unbilled_hours}`);
      console.log(`   Total Unbilled Amount: R ${res.data.summary.total_unbilled_amount.toLocaleString()}`);
      console.log(`   High Risk Attorneys: ${res.data.summary.high_risk}`);
    }

    if (res.data.data.length > 0) {
      console.log('\n   🚨 Top 5 Inertia Cases:');
      res.data.data.slice(0, 5).forEach((item, i) => {
        const badge = item.inertia_score >= 75 ? '🔴' : item.inertia_score >= 50 ? '🟡' : '🟢';
        console.log(`   ${i + 1}. ${item.name}:`);
        console.log(`      Unbilled: R ${item.unbilled_amount.toLocaleString()} (${item.unbilled_hours} hrs)`);
        console.log(`      Days Overdue: ${item.days_overdue} | Score: ${item.inertia_score} ${badge}`);
      });
    } else {
      console.log('   ✅ No billing inertia detected - all attorneys current!');
    }
    console.log('\n✅ Billing Inertia Detection: PASSED\n');
  } catch (err) {
    console.log(`   Status: ❌ Failed`);
    console.log(`   Error: ${err.response?.status} - ${err.response?.data?.message || err.message}\n`);
  }

  // Test 5: Practice Velocity
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('5️⃣  PRACTICE VELOCITY (Burn Rate)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const res = await axios.get(`${BASE_URL}/reporting/practice-velocity`, {
      headers,
      timeout: 10000
    });

    console.log(`   Status: ✅ Working`);
    console.log(`   Matters Tracked: ${res.data.data.length}`);

    if (res.data.data.length > 0) {
      console.log('\n   🔥 Top 5 by Burn Rate:');
      res.data.data.slice(0, 5).forEach((matter, i) => {
        const health =
          matter.health_status === 'red' ? '🔴' :
          matter.health_status === 'amber' ? '🟡' : '🟢';
        console.log(`   ${i + 1}. ${matter.matter_number} - ${matter.title}`);
        console.log(`      Burn Rate: ${matter.burn_rate}% ${health}`);
        console.log(`      Hours: ${matter.actual_hours} / ${matter.budget_hours}`);
        console.log(`      Profit: R ${matter.projected_profit.toLocaleString()}`);
      });
    }
    console.log('\n✅ Practice Velocity: PASSED\n');
  } catch (err) {
    console.log(`   Status: ❌ Failed`);
    console.log(`   Error: ${err.response?.status} - ${err.response?.data?.message || err.message}\n`);
  }

  // Test 6: Executive Summary (Soul Logic)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('6️⃣  EXECUTIVE SUMMARY (Soul Logic)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const res = await axios.get(`${BASE_URL}/reporting/executive-summary`, {
      headers,
      timeout: 15000
    });

    console.log(`   Status: ✅ Working`);

    const summary = res.data.data.summary;
    console.log(`\n   📊 Firm Metrics (30 days):`);
    console.log(`   💰 Total Revenue: R ${summary.total_revenue.toLocaleString()}`);
    console.log(`   ⏱️ Total Hours: ${summary.total_hours}`);
    console.log(`   📈 Avg Utilization: ${summary.avg_utilization.toFixed(1)}%`);
    console.log(`   ⚠️ Unbilled Revenue: R ${summary.unbilled_revenue.toLocaleString()}`);
    console.log(`   👥 Active Attorneys: ${summary.active_attorneys}`);
    console.log(`   🏛️ Practice Areas: ${summary.practice_areas}`);

    console.log(`\n   🧠 Soul Logic Score: ${res.data.data.soul_logic_score}/100`);
    const scoreColor =
      res.data.data.soul_logic_score >= 80 ? '🟢 EXCELLENT' :
      res.data.data.soul_logic_score >= 60 ? '🟡 GOOD' : '🔴 NEEDS ATTENTION';
    console.log(`   Status: ${scoreColor}`);

    if (res.data.data.energy_drains.length > 0) {
      console.log(`\n   ⚡ Energy Drains Detected: ${res.data.data.energy_drains.length}`);
      res.data.data.energy_drains.forEach(drain => {
        const icon = drain.severity === 'high' ? '🔴' : drain.severity === 'medium' ? '🟡' : '🟢';
        console.log(`   ${icon} ${drain.type.replace(/_/g, ' ').toUpperCase()}`);
        console.log(`      ${drain.message}`);
      });
    } else {
      console.log('\n   ✅ No energy drains detected - firm operating smoothly!');
    }

    if (res.data.data.top_earners.length > 0) {
      console.log(`\n   🏆 Top 5 Fee Earners:`);
      res.data.data.top_earners.forEach((earner, i) => {
        console.log(`   ${i + 1}. ${earner.name} (${earner.role})`);
        console.log(`      R ${earner.total_revenue.toLocaleString()} - ${earner.total_hours} hrs`);
      });
    }

    console.log('\n✅ Executive Summary (Soul Logic): PASSED\n');
  } catch (err) {
    console.log(`   Status: ❌ Failed`);
    console.log(`   Error: ${err.response?.status} - ${err.response?.data?.message || err.message}\n`);
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 TEST SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('✅ All LegalNexus Reporting Features Tested');
  console.log('');
  console.log('📍 Frontend Dashboard URL:');
  console.log('   http://localhost:5173/reporting');
  console.log('');
  console.log('✨ Vicktoria AI Status:');
  console.log('   Look for the sparkle button (✨) in bottom-right');
  console.log('   Click to open Soul Logic powered assistant');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

testReportingDashboard().catch(console.error);
