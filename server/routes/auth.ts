import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/database.js';
import { verifyToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this';

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)')
      .run(name, email, hashedPassword);

    const token = jwt.sign(
      { id: result.lastInsertRowid, email, name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: { id: result.lastInsertRowid, name, email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

export default router;
