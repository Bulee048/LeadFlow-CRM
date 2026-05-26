import express from 'express';
import db from '../db/database.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/leads
router.get('/', verifyToken, (req, res) => {
  const { status, lead_source, assigned_to, search } = req.query;
  
  let sql = 'SELECT * FROM leads WHERE 1=1';
  const params: any[] = [];

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (lead_source) {
    sql += ' AND lead_source = ?';
    params.push(lead_source);
  }
  if (assigned_to) {
    sql += ' AND assigned_to = ?';
    params.push(assigned_to);
  }
  if (search) {
    sql += ' AND (lead_name LIKE ? OR company_name LIKE ? OR email LIKE ?)';
    const searchVal = `%${search}%`;
    params.push(searchVal, searchVal, searchVal);
  }

  sql += ' ORDER BY updated_at DESC';

  try {
    const leads = db.prepare(sql).all(...params);
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leads' });
  }
});

// GET /api/leads/:id
router.get('/:id', verifyToken, (req, res) => {
  const { id } = req.params;

  try {
    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id) as any;
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const notes = db.prepare('SELECT * FROM notes WHERE lead_id = ? ORDER BY created_at ASC').all(id);
    lead.notes = notes;

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lead details' });
  }
});

// POST /api/leads
router.post('/', verifyToken, (req, res) => {
  const { lead_name, company_name, email, phone, lead_source, assigned_to, status, deal_value } = req.body;

  if (!lead_name || !company_name || !email) {
    return res.status(400).json({ message: 'Lead name, company, and email are required' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO leads (lead_name, company_name, email, phone, lead_source, assigned_to, status, deal_value)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(lead_name, company_name, email, phone, lead_source, assigned_to, status || 'New', deal_value || 0);

    const newLead = db.prepare('SELECT * FROM leads WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newLead);
  } catch (error) {
    res.status(500).json({ message: 'Error creating lead' });
  }
});

// PUT /api/leads/:id
router.put('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { lead_name, company_name, email, phone, lead_source, assigned_to, status, deal_value } = req.body;

  try {
    const existing = db.prepare('SELECT id FROM leads WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ message: 'Lead not found' });

    db.prepare(`
      UPDATE leads 
      SET lead_name = ?, company_name = ?, email = ?, phone = ?, lead_source = ?, assigned_to = ?, status = ?, deal_value = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(lead_name, company_name, email, phone, lead_source, assigned_to, status, deal_value, id);

    const updatedLead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    res.json(updatedLead);
  } catch (error) {
    res.status(500).json({ message: 'Error updating lead' });
  }
});

// PATCH /api/leads/:id/status
router.patch('/:id/status', verifyToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    db.prepare('UPDATE leads SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
    const updatedLead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    res.json(updatedLead);
  } catch (error) {
    res.status(500).json({ message: 'Error updating lead status' });
  }
});

// DELETE /api/leads/:id
router.delete('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM leads WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting lead' });
  }
});

export default router;
