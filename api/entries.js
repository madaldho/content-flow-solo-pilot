const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const result = await pool.query('SELECT * FROM sweet_spot_entries WHERE user_id = $1 ORDER BY created_at DESC', ['default-user']);
      return res.status(200).json(result.rows);
    }
    
    if (req.method === 'POST') {
      const { niche, account, keywords, audience, revenue_stream, pricing } = req.body;
      
      const result = await pool.query(
        'INSERT INTO sweet_spot_entries (user_id, niche, account, keywords, audience, revenue_stream, pricing) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        ['default-user', niche, account, keywords, audience || 0, revenue_stream, pricing]
      );
      
      console.log('✅ Sweet spot entry created:', result.rows[0].id);
      return res.status(201).json(result.rows[0]);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message
    });
  }
};
