const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_HZN4Q0SdiUbM@ep-still-art-a134rndc-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url, method } = req;
  console.log('🔥 API Request:', { url, method, body: req.body });
  
  try {
    // Health check
    if (url === '/api/health' || url === '/health') {
      return res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        message: 'KontenFlow API is running on Vercel Functions',
        database: process.env.DATABASE_URL ? 'Connected' : 'Not configured'
      });
    }
    
    // SweetSpot Entries
    if (url === '/api/sweetspot/entries' || url === '/sweetspot/entries') {
      if (method === 'GET') {
        const result = await pool.query('SELECT * FROM sweet_spot_entries WHERE user_id = $1 ORDER BY created_at DESC', ['default-user']);
        return res.status(200).json(result.rows);
      }
      
      if (method === 'POST') {
        const { niche, account, keywords, audience, revenue_stream, pricing } = req.body;
        
        const result = await pool.query(
          'INSERT INTO sweet_spot_entries (user_id, niche, account, keywords, audience, revenue_stream, pricing) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          ['default-user', niche, account, keywords, audience || 0, revenue_stream, pricing]
        );
        
        console.log('✅ Sweet spot entry created:', result.rows[0].id);
        return res.status(201).json(result.rows[0]);
      }
    }
    
    // SweetSpot Entry by ID
    if (url.startsWith('/api/sweetspot/entries/') || url.startsWith('/sweetspot/entries/')) {
      const id = url.split('/').pop();
      
      if (method === 'GET') {
        const result = await pool.query('SELECT * FROM sweet_spot_entries WHERE id = $1 AND user_id = $2', [id, 'default-user']);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Sweet spot entry not found' });
        }
        
        return res.status(200).json(result.rows[0]);
      }
      
      if (method === 'PUT') {
        const { niche, account, keywords, audience, revenue_stream, pricing } = req.body;
        
        const result = await pool.query(
          'UPDATE sweet_spot_entries SET niche = $1, account = $2, keywords = $3, audience = $4, revenue_stream = $5, pricing = $6, updated_at = NOW() WHERE id = $7 AND user_id = $8 RETURNING *',
          [niche, account, keywords, audience || 0, revenue_stream, pricing, id, 'default-user']
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Sweet spot entry not found' });
        }
        
        return res.status(200).json(result.rows[0]);
      }
      
      if (method === 'DELETE') {
        const result = await pool.query('DELETE FROM sweet_spot_entries WHERE id = $1 AND user_id = $2 RETURNING *', [id, 'default-user']);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Sweet spot entry not found' });
        }
        
        console.log('✅ Sweet spot entry deleted:', id);
        return res.status(200).json({ message: 'Sweet spot entry deleted successfully' });
      }
    }
    
    // SweetSpot Settings
    if (url === '/api/sweetspot/settings' || url === '/sweetspot/settings') {
      if (method === 'GET') {
        const result = await pool.query('SELECT * FROM sweet_spot_settings WHERE user_id = $1 LIMIT 1', ['default-user']);
        
        if (result.rows.length === 0) {
          // Create default settings
          const defaultResult = await pool.query(
            'INSERT INTO sweet_spot_settings (user_id, target_revenue_per_month) VALUES ($1, $2) RETURNING *',
            ['default-user', '10000000']
          );
          return res.status(200).json(defaultResult.rows[0]);
        } else {
          return res.status(200).json(result.rows[0]);
        }
      }
      
      if (method === 'PUT') {
        const { target_revenue_per_month } = req.body;
        
        const result = await pool.query(
          'UPDATE sweet_spot_settings SET target_revenue_per_month = $1, updated_at = NOW() WHERE user_id = $2 RETURNING *',
          [target_revenue_per_month, 'default-user']
        );
        
        if (result.rows.length === 0) {
          // Create if not exists
          const createResult = await pool.query(
            'INSERT INTO sweet_spot_settings (user_id, target_revenue_per_month) VALUES ($1, $2) RETURNING *',
            ['default-user', target_revenue_per_month]
          );
          return res.status(200).json(createResult.rows[0]);
        } else {
          return res.status(200).json(result.rows[0]);
        }
      }
    }
    
    // Default response
    console.log('❌ API endpoint not found:', { url, method });
    res.status(404).json({ error: 'API endpoint not found', url, method });
    
  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      url,
      method
    });
  }
};
