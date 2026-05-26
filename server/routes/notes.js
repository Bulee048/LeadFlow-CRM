const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const auth = require('../middleware/auth');

// POST /api/notes
router.post('/', auth, async (req, res) => {
  const { lead_id, content, created_by } = req.body;

  if (!lead_id || !content || !created_by) {
    return res.status(400).json({ error: 'Missing required fields: lead_id, content, created_by' });
  }

  try {
    // For created_by we just insert the string for now to match the frontend mock.
    // In production, we would use the User ID (req.user.id) and a join query.
    // For now we will assume created_by is a string name or ID. We altered the schema to expect an INT User ID.
    // To avoid breaking the UI which passes a name, we'll assign it to a default user (1) if it's not a number.
    const createdById = isNaN(created_by) ? 1 : created_by;

    const [result] = await pool.execute(`
      INSERT INTO notes (lead_id, content, created_by)
      VALUES (?, ?, ?)
    `, [lead_id, content, createdById]);

    const [rows] = await pool.execute('SELECT * FROM notes WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM notes WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
