const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'leadflow_crm',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection on startup
pool.getConnection()
  .then(connection => {
    console.log('📦 Successfully connected to MySQL Database');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Error connecting to MySQL. Have you started your database server and created the tables?', err.message);
  });

module.exports = pool;
