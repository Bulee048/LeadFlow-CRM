const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const auth = require('../middleware/auth');

// GET /api/dashboard
router.get('/', auth, async (req, res) => {
  try {
    const [
      total, newL, qualified, won, lost, contacted, proposal, totalVal, wonVal
    ] = await Promise.all([
      db.prepare('SELECT COUNT(*) as count FROM leads').get(),
      db.prepare("SELECT COUNT(*) as count FROM leads WHERE status = 'New'").get(),
      db.prepare("SELECT COUNT(*) as count FROM leads WHERE status = 'Qualified'").get(),
      db.prepare("SELECT COUNT(*) as count FROM leads WHERE status = 'Won'").get(),
      db.prepare("SELECT COUNT(*) as count FROM leads WHERE status = 'Lost'").get(),
      db.prepare("SELECT COUNT(*) as count FROM leads WHERE status = 'Contacted'").get(),
      db.prepare("SELECT COUNT(*) as count FROM leads WHERE status = 'Proposal Sent'").get(),
      db.prepare('SELECT SUM(deal_value) as sum FROM leads').get(),
      db.prepare("SELECT SUM(deal_value) as sum FROM leads WHERE status = 'Won'").get()
    ]);

    res.json({
      total_leads: total?.count || 0,
      new_leads: newL?.count || 0,
      qualified_leads: qualified?.count || 0,
      won_leads: won?.count || 0,
      lost_leads: lost?.count || 0,
      contacted_leads: contacted?.count || 0,
      proposal_sent_leads: proposal?.count || 0,
      total_deal_value: totalVal?.sum || 0,
      won_deal_value: wonVal?.sum || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
