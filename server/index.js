require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db/database');

// Route imports
const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const noteRoutes = require('./routes/notes');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database
initDb();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
