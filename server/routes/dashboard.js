const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const auth = require('../middleware/auth');

// GET /api/dashboard
router.get('/', auth, async (req, res) => {
  try {
    const [
      [totalResult], [newResult], [qualifiedResult], [wonResult], [lostResult],
      [contactedResult], [proposalResult], [totalValResult], [wonValResult], sources
    ] = await Promise.all([
      pool.execute('SELECT COUNT(*) as count FROM leads'),
      pool.execute("SELECT COUNT(*) as count FROM leads WHERE status = 'New'"),
      pool.execute("SELECT COUNT(*) as count FROM leads WHERE status = 'Qualified'"),
      pool.execute("SELECT COUNT(*) as count FROM leads WHERE status = 'Won'"),
      pool.execute("SELECT COUNT(*) as count FROM leads WHERE status = 'Lost'"),
      pool.execute("SELECT COUNT(*) as count FROM leads WHERE status = 'Contacted'"),
      pool.execute("SELECT COUNT(*) as count FROM leads WHERE status = 'Proposal Sent'"),
      pool.execute('SELECT SUM(deal_value) as sum FROM leads'),
      pool.execute("SELECT SUM(deal_value) as sum FROM leads WHERE status = 'Won'"),
      pool.execute("SELECT lead_source, COUNT(*) as count FROM leads GROUP BY lead_source")
    ]);

    res.json({
      total_leads: totalResult[0]?.count || 0,
      new_leads: newResult[0]?.count || 0,
      qualified_leads: qualifiedResult[0]?.count || 0,
      won_leads: wonResult[0]?.count || 0,
      lost_leads: lostResult[0]?.count || 0,
      contacted_leads: contactedResult[0]?.count || 0,
      proposal_sent_leads: proposalResult[0]?.count || 0,
      total_deal_value: totalValResult[0]?.sum || 0,
      won_deal_value: wonValResult[0]?.sum || 0,
      sources: sources[0] || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
