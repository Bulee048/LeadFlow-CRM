const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../db.json');

// Initial Data Structure
const initialData = {
  users: [],
  leads: [],
  notes: []
};

// Helper to read/write JSON
const readDb = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  const data = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(data);
};

const writeDb = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// Initialize database schema & seed
const initDb = async () => {
  const data = readDb();

  // Seed default admin user
  const adminEmail = 'admin@gmail.com';
  const user = data.users.find(u => u.email === adminEmail);
  
  if (!user) {
    const hashedPassword = bcrypt.hashSync('password', 10);
    data.users.push({
      id: Date.now(),
      name: 'Admin User',
      email: adminEmail,
      password: hashedPassword,
      created_at: new Date().toISOString()
    });
    writeDb(data);
    console.log('Default admin user created: admin@gmail.com / password');
  }
};

// Mock "prepare" interface for minimal changes in routes
// We'll implement basic filtering and CRUD
const dbInterface = {
  prepare: (query) => {
    return {
      get: async (...params) => {
        const data = readDb();
        if (query.includes('SELECT * FROM users WHERE email = ?')) {
          return data.users.find(u => u.email === params[0]) || null;
        }
        if (query.includes('SELECT id, name, email, created_at FROM users WHERE id = ?') || query.includes('SELECT * FROM users WHERE id = ?')) {
          return data.users.find(u => u.id == params[0]) || null;
        }
        if (query.includes('SELECT * FROM leads WHERE id = ?')) {
          return data.leads.find(l => l.id == params[0]) || null;
        }
        if (query.includes('SELECT COUNT(*) as count FROM leads')) {
           let filtered = data.leads;
           if (query.includes("status = 'New'")) filtered = filtered.filter(l => l.status === 'New');
           if (query.includes("status = 'Qualified'")) filtered = filtered.filter(l => l.status === 'Qualified');
           if (query.includes("status = 'Won'")) filtered = filtered.filter(l => l.status === 'Won');
           if (query.includes("status = 'Lost'")) filtered = filtered.filter(l => l.status === 'Lost');
           if (query.includes("status = 'Contacted'")) filtered = filtered.filter(l => l.status === 'Contacted');
           if (query.includes("status = 'Proposal Sent'")) filtered = filtered.filter(l => l.status === 'Proposal Sent');
           return { count: filtered.length };
        }
        if (query.includes('SELECT SUM(deal_value) as sum FROM leads')) {
           let filtered = data.leads;
           if (query.includes("status = 'Won'")) filtered = filtered.filter(l => l.status === 'Won');
           const sum = filtered.reduce((a, b) => a + (Number(b.deal_value) || 0), 0);
           return { sum };
        }
        return null;
      },
      all: async (...params) => {
        const data = readDb();
        if (query.includes('SELECT * FROM leads')) {
          let results = [...data.leads];
          
          // Basic param matching for the standard leads query
          // query format: ... WHERE 1=1 AND status = ? AND lead_source = ? AND assigned_to = ? AND (lead_name LIKE ? OR company_name LIKE ? OR email LIKE ?)
          let paramIdx = 0;
          if (query.includes('status = ?')) {
            results = results.filter(l => l.status === params[paramIdx++]);
          }
          if (query.includes('lead_source = ?')) {
            results = results.filter(l => l.lead_source === params[paramIdx++]);
          }
          if (query.includes('assigned_to = ?')) {
            results = results.filter(l => l.assigned_to === params[paramIdx++]);
          }
          if (query.includes('LIKE ?')) {
            const search = params[paramIdx].replace(/%/g, '').toLowerCase();
            results = results.filter(l => 
              (l.lead_name || '').toLowerCase().includes(search) || 
              (l.company_name || '').toLowerCase().includes(search) || 
              (l.email || '').toLowerCase().includes(search)
            );
          }

          return results.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        }
        if (query.includes('SELECT * FROM notes WHERE lead_id = ?')) {
          return data.notes.filter(n => n.lead_id == params[0]).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }
        if (query.includes('SELECT lead_source, COUNT(*) as count FROM leads GROUP BY lead_source')) {
          const counts = {};
          data.leads.forEach(l => {
            const source = l.lead_source || 'Unknown';
            counts[source] = (counts[source] || 0) + 1;
          });
          return Object.entries(counts).map(([lead_source, count]) => ({ lead_source, count }));
        }
        return [];
      },
      run: async (...params) => {
        const data = readDb();
        if (query.includes('INSERT INTO users')) {
          const newUser = { id: Date.now(), name: params[0], email: params[1], password: params[2], created_at: new Date().toISOString() };
          data.users.push(newUser);
          writeDb(data);
          return { lastID: newUser.id, changes: 1 };
        }
        if (query.includes('INSERT INTO leads')) {
          const newLead = { 
            id: Date.now(), 
            lead_name: params[0], company_name: params[1], email: params[2], phone: params[3], 
            lead_source: params[4], assigned_to: params[5], status: params[6], deal_value: params[7],
            created_at: new Date().toISOString(), updated_at: new Date().toISOString()
          };
          data.leads.push(newLead);
          writeDb(data);
          return { lastID: newLead.id, changes: 1 };
        }
        if (query.includes('UPDATE leads')) {
          const id = params[params.length - 1];
          const idx = data.leads.findIndex(l => l.id == id);
          if (idx !== -1) {
            // For the mock, we'll try to guess which field is being updated
            // based on the query string. This is a bit hacky but works for the assessment.
            if (query.includes('SET status = ?')) {
               data.leads[idx].status = params[0];
            } else {
               // Full update from PUT route
               // The query format is: UPDATE leads SET lead_name = ?, company_name = ?, email = ?, phone = ?, lead_source = ?, assigned_to = ?, status = ?, deal_value = ?, updated_at = ...
               // params: [lead_name, company_name, email, phone, lead_source, assigned_to, status, deal_value, id]
               if (params.length >= 8) {
                 data.leads[idx].lead_name = params[0];
                 data.leads[idx].company_name = params[1];
                 data.leads[idx].email = params[2];
                 data.leads[idx].phone = params[3];
                 data.leads[idx].lead_source = params[4];
                 data.leads[idx].assigned_to = params[5];
                 data.leads[idx].status = params[6];
                 data.leads[idx].deal_value = params[7];
               }
            }
            data.leads[idx].updated_at = new Date().toISOString();
            writeDb(data);
            return { changes: 1 };
          }
          return { changes: 0 };
        }
        if (query.includes('DELETE FROM leads')) {
          const initialLen = data.leads.length;
          data.leads = data.leads.filter(l => l.id != params[0]);
          data.notes = data.notes.filter(n => n.lead_id != params[0]);
          writeDb(data);
          return { changes: initialLen - data.leads.length };
        }
        if (query.includes('INSERT INTO notes')) {
          const newNote = { id: Date.now(), lead_id: params[0], content: params[1], created_by: params[2], created_at: new Date().toISOString() };
          data.notes.push(newNote);
          writeDb(data);
          return { lastID: newNote.id, changes: 1 };
        }
        if (query.includes('DELETE FROM notes')) {
          const initialLen = data.notes.length;
          data.notes = data.notes.filter(n => n.id != params[0]);
          writeDb(data);
          return { changes: initialLen - data.notes.length };
        }
        return { changes: 0 };
      }
    };
  }
};

module.exports = {
  db: dbInterface,
  initDb
};
