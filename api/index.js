const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:3000', 
    'https://kontenflow.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_HZN4Q0SdiUbM@ep-still-art-a134rndc-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'KontenFlow API is running'
  });
});

// SweetSpot Routes
app.get('/api/sweetspot/entries', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sweet_spot_entries ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sweet spot entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/sweetspot/entries', async (req, res) => {
  try {
    const { niche, account, keywords, audience, revenue_stream, pricing } = req.body;
    
    const result = await pool.query(
      'INSERT INTO sweet_spot_entries (niche, account, keywords, audience, revenue_stream, pricing) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [niche, account, keywords, audience || 0, revenue_stream, pricing]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating sweet spot entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/sweetspot/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sweet_spot_settings LIMIT 1');
    
    if (result.rows.length === 0) {
      // Create default settings
      const defaultResult = await pool.query(
        'INSERT INTO sweet_spot_settings (target_revenue_per_month) VALUES ($1) RETURNING *',
        ['10000000']
      );
      res.json(defaultResult.rows[0]);
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/sweetspot/settings', async (req, res) => {
  try {
    const { target_revenue_per_month } = req.body;
    
    const result = await pool.query(
      'UPDATE sweet_spot_settings SET target_revenue_per_month = $1, updated_at = NOW() RETURNING *',
      [target_revenue_per_month]
    );
    
    if (result.rows.length === 0) {
      // Create if not exists
      const createResult = await pool.query(
        'INSERT INTO sweet_spot_settings (target_revenue_per_month) VALUES ($1) RETURNING *',
        [target_revenue_per_month]
      );
      res.json(createResult.rows[0]);
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export for Vercel
module.exports = app;
