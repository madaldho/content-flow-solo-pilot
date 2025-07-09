const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:8082',
    'https://kontenflow.vercel.app',
    'https://kontenflow.vercel.app/',
    /^https:\/\/kontenflow-.*\.vercel\.app$/
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.VITE_DATABASE_URL,
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

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'KontenFlow API Server', 
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      content: '/api/content',
      stats: '/api/content/stats'
    }
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 KontenFlow API Server running on port ${PORT}`);
  console.log(`📊 API endpoints available at ${process.env.NODE_ENV === 'production' ? 'https://your-api-domain.com' : `http://localhost:${PORT}`}/api`);
  console.log(`🔍 Health check: ${process.env.NODE_ENV === 'production' ? 'https://your-api-domain.com' : `http://localhost:${PORT}`}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
