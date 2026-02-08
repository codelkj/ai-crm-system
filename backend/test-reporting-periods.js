const pool = require('./dist/config/database').default;

(async () => {
  try {
    const firmId = '00000000-0000-0000-0000-000000000001';

    const month = await pool.query(`
      SELECT ROUND(COALESCE(SUM((te.duration_minutes / 60.0) * te.hourly_rate), 0), 2) as revenue,
             ROUND(COALESCE(SUM(te.duration_minutes / 60.0), 0), 2) as hours
      FROM time_entries te
      WHERE te.firm_id = $1
        AND te.billable = true
        AND te.created_at >= NOW() - INTERVAL '30 days'`, [firmId]);

    const quarter = await pool.query(`
      SELECT ROUND(COALESCE(SUM((te.duration_minutes / 60.0) * te.hourly_rate), 0), 2) as revenue,
             ROUND(COALESCE(SUM(te.duration_minutes / 60.0), 0), 2) as hours
      FROM time_entries te
      WHERE te.firm_id = $1
        AND te.billable = true
        AND te.created_at >= NOW() - INTERVAL '90 days'`, [firmId]);

    const year = await pool.query(`
      SELECT ROUND(COALESCE(SUM((te.duration_minutes / 60.0) * te.hourly_rate), 0), 2) as revenue,
             ROUND(COALESCE(SUM(te.duration_minutes / 60.0), 0), 2) as hours
      FROM time_entries te
      WHERE te.firm_id = $1
        AND te.billable = true
        AND te.created_at >= NOW() - INTERVAL '365 days'`, [firmId]);

    console.log('\n✅ Reporting Period Test Results:\n');
    console.log('Month (30d):   R' + month.rows[0].revenue + ' revenue | ' + month.rows[0].hours + ' hrs');
    console.log('Quarter (90d): R' + quarter.rows[0].revenue + ' revenue | ' + quarter.rows[0].hours + ' hrs');
    console.log('Year (365d):   R' + year.rows[0].revenue + ' revenue | ' + year.rows[0].hours + ' hrs\n');

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
