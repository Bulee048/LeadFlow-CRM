import express from 'express';
import db from '../db/database.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/dashboard
router.get('/', verifyToken, (req, res) => {
  try {
    const totalLeads = (db.prepare('SELECT COUNT(*) as count FROM leads').get() as any).count;
    const newLeads = (db.prepare("SELECT COUNT(*) as count FROM leads WHERE status = 'New'").get() as any).count;
    const contactedLeads = (db.prepare("SELECT COUNT(*) as count FROM leads WHERE status = 'Contacted'").get() as any).count;
    const qualifiedLeads = (db.prepare("SELECT COUNT(*) as count FROM leads WHERE status = 'Qualified'").get() as any).count;
    const proposalLeads = (db.prepare("SELECT COUNT(*) as count FROM leads WHERE status = 'Proposal Sent'").get() as any).count;
    const wonLeads = (db.prepare("SELECT COUNT(*) as count FROM leads WHERE status = 'Won'").get() as any).count;
    const lostLeads = (db.prepare("SELECT COUNT(*) as count FROM leads WHERE status = 'Lost'").get() as any).count;
    
    const totalValue = (db.prepare('SELECT SUM(deal_value) as sum FROM leads').get() as any).sum || 0;
    const wonValue = (db.prepare("SELECT SUM(deal_value) as sum FROM leads WHERE status = 'Won'").get() as any).sum || 0;

    res.json({
      total_leads: totalLeads,
      new_leads: newLeads,
      contacted_leads: contactedLeads,
      qualified_leads: qualifiedLeads,
      proposal_sent_leads: proposalLeads,
      won_leads: wonLeads,
      lost_leads: lostLeads,
      total_deal_value: totalValue,
      won_deal_value: wonValue
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

export default router;
