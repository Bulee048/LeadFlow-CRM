const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const auth = require('../middleware/auth');

// GET /api/leads - Filtered list
router.get('/', auth, async (req, res) => {
  const { status, lead_source, assigned_to, search } = req.query;
  
  let query = 'SELECT * FROM leads WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (lead_source) {
    query += ' AND lead_source = ?';
    params.push(lead_source);
  }
  if (assigned_to) {
    query += ' AND assigned_to = ?';
    params.push(assigned_to);
  }
  if (search) {
    query += ' AND (lead_name LIKE ? OR company_name LIKE ? OR email LIKE ?)';
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  query += ' ORDER BY updated_at DESC';

  try {
    const leads = await db.prepare(query).all(...params);
    res.json(leads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/leads/:id - Single lead with notes
router.get('/:id', auth, async (req, res) => {
  try {
    const lead = await db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const notes = await db.prepare('SELECT * FROM notes WHERE lead_id = ? ORDER BY created_at ASC').all(req.params.id);
    lead.notes = notes;

    res.json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/leads - Create lead
router.post('/', auth, async (req, res) => {
  const { lead_name, company_name, email, phone, lead_source, assigned_to, status, deal_value } = req.body;

  if (!lead_name || !company_name || !email) {
    return res.status(400).json({ error: 'Missing required fields: lead_name, company_name, email' });
  }

  try {
    const info = await db.prepare(`
      INSERT INTO leads (lead_name, company_name, email, phone, lead_source, assigned_to, status, deal_value)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(lead_name, company_name, email, phone || '', lead_source || 'Other', assigned_to || '', status || 'New', deal_value || 0);

    const newLead = await db.prepare('SELECT * FROM leads WHERE id = ?').get(info.lastID || info.lastInsertRowid);
    res.status(201).json(newLead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/leads/:id - Update lead
router.put('/:id', auth, async (req, res) => {
  const fields = req.body;
  const id = req.params.id;

  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ error: 'No fields provided for update' });
  }

  // Build dynamic update query
  const columns = Object.keys(fields).filter(key => key !== 'id' && key !== 'created_at' && key !== 'notes');
  const setClause = columns.map(col => `${col} = ?`).join(', ');
  const values = columns.map(col => fields[col]);
  
  // Add updated_at
  const finalQuery = `UPDATE leads SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  values.push(id);

  try {
    const result = await db.prepare(finalQuery).run(...values);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    const updatedLead = await db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    res.json(updatedLead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/leads/:id/status - Quick status update
router.patch('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];

  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    await db.prepare('UPDATE leads SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);
    const updatedLead = await db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
    res.json(updatedLead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/leads/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
