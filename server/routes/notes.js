const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const auth = require('../middleware/auth');

// POST /api/notes
router.post('/', auth, async (req, res) => {
  const { lead_id, content, created_by } = req.body;

  if (!lead_id || !content || !created_by) {
    return res.status(400).json({ error: 'Missing required fields: lead_id, content, created_by' });
  }

  try {
    const info = await db.prepare(`
      INSERT INTO notes (lead_id, content, created_by)
      VALUES (?, ?, ?)
    `).run(lead_id, content, created_by);

    const newNote = await db.prepare('SELECT * FROM notes WHERE id = ?').get(info.lastID || info.lastInsertRowid);
    res.status(201).json(newNote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
