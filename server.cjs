const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.VITE_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to database:', err);
  } else {
    console.log('✅ Database connected successfully');
    release();
  }
});

// Routes

// GET all content items
app.get('/api/content', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM content_items ORDER BY updated_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET content item by ID
app.get('/api/content/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM content_items WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching content by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create new content item
app.post('/api/content', async (req, res) => {
  try {
    const {
      id,
      title,
      platform,
      status,
      tags,
      published_at,
      content_link,
      platform_links,
      is_endorsement,
      is_collaboration,
      endorsement_name,
      collaboration_name,
      endorsement_price
    } = req.body;

    console.log('📝 Creating new content item:', { id, title, platform, status });

    const now = new Date().toISOString();

    const result = await pool.query(`
      INSERT INTO content_items (
        id, title, platform, status, tags, published_at, 
        content_link, platform_links, is_endorsement, is_collaboration,
        endorsement_name, collaboration_name, endorsement_price,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      id,
      title,
      platform,
      status,
      tags || [],
      published_at,
      content_link,
      platform_links ? JSON.stringify(platform_links) : null,
      is_endorsement || false,
      is_collaboration || false,
      endorsement_name,
      collaboration_name,
      endorsement_price,
      now,
      now
    ]);

    console.log('✅ Content created successfully:', result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creating content:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// PUT update content item
app.put('/api/content/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log('📝 Updating content item:', id, updates);
    
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    // Build dynamic update query
    Object.keys(updates).forEach(key => {
      if (key !== 'id') {
        updateFields.push(`${key} = $${paramIndex++}`);
        values.push(updates[key]);
      }
    });

    // Always update the updated_at timestamp
    updateFields.push(`updated_at = $${paramIndex++}`);
    values.push(new Date().toISOString());

    // Add the ID for WHERE clause
    values.push(id);

    const updateQuery = `
      UPDATE content_items 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }

    console.log('✅ Content updated successfully:', result.rows[0].id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error updating content:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// DELETE content item
app.delete('/api/content/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM content_items WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }

    console.log('✅ Content deleted successfully:', id);
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET content stats
app.get('/api/content/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM content_items 
      GROUP BY status
    `);

    const stats = {
      total: 0,
      draft: 0,
      scheduled: 0,
      published: 0,
      archived: 0
    };

    result.rows.forEach(row => {
      stats.total += parseInt(row.count);
      stats[row.status] = parseInt(row.count);
    });

    res.json(stats);
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

// ========== SWEET SPOT ENDPOINTS ==========

// GET all sweet spot entries
app.get('/api/sweetspot/entries', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sweet_spot_entries ORDER BY updated_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching sweet spot entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET sweet spot entry by ID
app.get('/api/sweetspot/entries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM sweet_spot_entries WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sweet spot entry not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error fetching sweet spot entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE new sweet spot entry
app.post('/api/sweetspot/entries', async (req, res) => {
  try {
    const { niche, account, keywords, audience, revenue_stream, pricing } = req.body;
    
    if (!niche || !account || !keywords || !revenue_stream || !pricing) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      'INSERT INTO sweet_spot_entries (niche, account, keywords, audience, revenue_stream, pricing) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [niche, account, keywords, audience || 0, revenue_stream, pricing]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creating sweet spot entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE sweet spot entry
app.put('/api/sweetspot/entries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { niche, account, keywords, audience, revenue_stream, pricing } = req.body;
    
    const result = await pool.query(
      'UPDATE sweet_spot_entries SET niche = $1, account = $2, keywords = $3, audience = $4, revenue_stream = $5, pricing = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
      [niche, account, keywords, audience || 0, revenue_stream, pricing, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sweet spot entry not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error updating sweet spot entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE sweet spot entry
app.delete('/api/sweetspot/entries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM sweet_spot_entries WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sweet spot entry not found' });
    }
    
    res.json({ message: 'Sweet spot entry deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting sweet spot entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET sweet spot settings
app.get('/api/sweetspot/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sweet_spot_settings WHERE user_id = $1', ['default-user']);
    
    if (result.rows.length === 0) {
      // Create default settings if none exist
      const defaultSettings = await pool.query(
        'INSERT INTO sweet_spot_settings (user_id, target_revenue_per_month) VALUES ($1, $2) RETURNING *',
        ['default-user', 10000000]
      );
      return res.json(defaultSettings.rows[0]);
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error fetching sweet spot settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE sweet spot settings
app.put('/api/sweetspot/settings', async (req, res) => {
  try {
    const { target_revenue_per_month } = req.body;
    
    if (!target_revenue_per_month) {
      return res.status(400).json({ error: 'target_revenue_per_month is required' });
    }
    
    const result = await pool.query(
      'UPDATE sweet_spot_settings SET target_revenue_per_month = $1, updated_at = NOW() WHERE user_id = $2 RETURNING *',
      [target_revenue_per_month, 'default-user']
    );
    
    if (result.rows.length === 0) {
      // Create if not exists
      const newSettings = await pool.query(
        'INSERT INTO sweet_spot_settings (user_id, target_revenue_per_month) VALUES ($1, $2) RETURNING *',
        ['default-user', target_revenue_per_month]
      );
      return res.json(newSettings.rows[0]);
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error updating sweet spot settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
});
