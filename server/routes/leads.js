const express = require('express');
const router = express.Router();
const pool = require('../db/db');
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
    // Note: frontend might be passing a name instead of an ID.
    // If it passes an ID, we could use it directly, but for now we fallback:
    query += ' AND assigned_to = ?';
    // Just a fallback check if it passes an ID
    const assignedId = isNaN(assigned_to) ? 1 : assigned_to;
    params.push(assignedId);
  }
  if (search) {
    query += ' AND (lead_name LIKE ? OR email LIKE ?)';
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam);
  }

  query += ' ORDER BY updated_at DESC';

  try {
    const [leads] = await pool.execute(query, params);
    res.json(leads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/leads/:id - Single lead with notes
router.get('/:id', auth, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    const lead = rows[0];
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const [notes] = await pool.execute('SELECT * FROM notes WHERE lead_id = ? ORDER BY created_at ASC', [req.params.id]);
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

  if (!lead_name || !email) {
    return res.status(400).json({ error: 'Missing required fields: lead_name, email' });
  }

  try {
    const assignedId = isNaN(assigned_to) ? 1 : assigned_to; // Mock handling assigned_to ID

    const [result] = await pool.execute(`
      INSERT INTO leads (lead_name, email, phone, lead_source, assigned_to, status, deal_value)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [lead_name, email, phone || '', lead_source || 'Other', assignedId, status || 'New', deal_value || 0]);

    const [rows] = await pool.execute('SELECT * FROM leads WHERE id = ?', [result.insertId]);
    const newLead = rows[0];
    
    // Emit to all connected clients
    if(req.io) req.io.emit('leadCreated', newLead);
    
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
  const columns = Object.keys(fields).filter(key => key !== 'id' && key !== 'created_at' && key !== 'notes' && key !== 'company_name');
  if (columns.length === 0) return res.status(400).json({ error: 'No valid fields provided' });
  
  const setClause = columns.map(col => `${col} = ?`).join(', ');
  const values = columns.map(col => {
    if (col === 'assigned_to' && isNaN(fields[col])) return 1;
    return fields[col];
  });
  
  const finalQuery = `UPDATE leads SET ${setClause} WHERE id = ?`;
  values.push(id);

  try {
    const [result] = await pool.execute(finalQuery, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    const [rows] = await pool.execute('SELECT * FROM leads WHERE id = ?', [id]);
    res.json(rows[0]);
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
    await pool.execute('UPDATE leads SET status = ? WHERE id = ?', [status, req.params.id]);
    const [rows] = await pool.execute('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    const updatedLead = rows[0];
    
    // Broadcast the update instantly
    if(req.io) req.io.emit('leadUpdated', updatedLead);
    
    res.json(updatedLead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/leads/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM leads WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    if(req.io) req.io.emit('leadDeleted', req.params.id);
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
