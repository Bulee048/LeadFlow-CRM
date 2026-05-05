import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'crm.db');
const db = new Database(dbPath);

export function initDb() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Leads table
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_name TEXT NOT NULL,
      company_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      lead_source TEXT,
      assigned_to TEXT,
      status TEXT DEFAULT 'New',
      deal_value REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Notes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE CASCADE
    )
  `);

  // Seed default admin user
  const adminEmail = 'admin@example.com';
  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);

  if (!existingAdmin) {
    const hashedPassword = bcrypt.hashSync('password123', 10);
    db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)')
      .run('Admin User', adminEmail, hashedPassword);
    console.log('Default admin user created: admin@example.com / password123');
  }
}

export default db;
