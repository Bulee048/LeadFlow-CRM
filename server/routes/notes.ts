import express from 'express';
import db from '../db/database.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/notes
router.post('/', verifyToken, (req, res) => {
  const { lead_id, content, created_by } = req.body;

  if (!lead_id || !content || !created_by) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const result = db.prepare('INSERT INTO notes (lead_id, content, created_by) VALUES (?, ?, ?)')
      .run(lead_id, content, created_by);
    
    const newNote = db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid);

    // Update lead updated_at timestamp
    db.prepare('UPDATE leads SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(lead_id);

    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ message: 'Error creating note' });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM notes WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting note' });
  }
});

export default router;
