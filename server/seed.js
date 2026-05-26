const pool = require('./db/db');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // 1. Insert default admin user if not exists
    const adminEmail = 'admin@gmail.com';
    const [existingAdmin] = await pool.execute('SELECT * FROM users WHERE email = ?', [adminEmail]);
    
    let adminId;
    if (existingAdmin.length === 0) {
      const hashedPassword = bcrypt.hashSync('password', 10);
      const [userResult] = await pool.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin User', adminEmail, hashedPassword, 'Admin']
      );
      adminId = userResult.insertId;
      console.log('✅ Created default admin user');
    } else {
      adminId = existingAdmin[0].id;
    }

    // 2. Clear existing dummy data (optional, but good for fresh start)
    await pool.execute('DELETE FROM leads');
    await pool.execute('DELETE FROM companies');
    
    // 3. Insert Dummy Companies
    const companies = [
      ['CloudScale Solutions', 'www.cloudscale.io', 'Technology'],
      ['Apex Manufacturing', 'www.apex-mfg.com', 'Manufacturing'],
      ['Global Logistics Network', 'www.globallogistics.net', 'Transportation'],
      ['Skyline Architects', 'www.skyline-arch.com', 'Real Estate'],
      ['EcoTech Systems', 'www.ecotech.biz', 'Renewable Energy']
    ];
    
    const companyIds = [];
    for (const [name, website, industry] of companies) {
      const [res] = await pool.execute(
        'INSERT INTO companies (name, website, industry) VALUES (?, ?, ?)',
        [name, website, industry]
      );
      companyIds.push(res.insertId);
    }
    console.log('✅ Inserted dummy companies');

    // 4. Insert Dummy Leads
    const leadsData = [
      ['John Doe', 'john.doe@example.com', '+94 77 123 4567', 'LinkedIn', 'New', 450000, companyIds[0]],
      ['Jane Smith', 'jane.smith@example.com', '+94 11 234 5678', 'Referral', 'Qualified', 1250000, companyIds[1]],
      ['Alice Johnson', 'alice@example.com', '+94 71 987 6543', 'Website', 'Won', 850000, companyIds[2]],
      ['Bob Brown', 'bob@example.com', '+94 72 444 5555', 'Event', 'Proposal Sent', 620000, companyIds[3]],
      ['Charlie Davis', 'charlie@example.com', '+94 76 111 2222', 'Cold Email', 'Qualified', 310000, companyIds[4]],
      ['Eve White', 'eve@example.com', '+94 77 555 1234', 'LinkedIn', 'Contacted', 150000, companyIds[0]],
      ['Frank Miller', 'frank@example.com', '+94 11 888 9999', 'Website', 'Lost', 50000, companyIds[1]],
      ['Grace Wilson', 'grace@example.com', '+94 71 222 3333', 'Referral', 'New', 900000, companyIds[2]],
      ['Henry Taylor', 'henry@example.com', '+94 72 777 8888', 'Event', 'Won', 2000000, companyIds[3]],
      ['Ivy Moore', 'ivy@example.com', '+94 76 444 5555', 'Cold Email', 'Proposal Sent', 420000, companyIds[4]],
    ];

    for (const lead of leadsData) {
      await pool.execute(
        'INSERT INTO leads (lead_name, email, phone, lead_source, status, deal_value, company_id, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [...lead, adminId] // Append assigned_to (adminId)
      );
    }
    console.log('✅ Inserted dummy leads');

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
};

seedDatabase();
