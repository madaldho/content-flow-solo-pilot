const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, query } = req;
  
  try {
    // GET all entries
    if (method === 'GET') {
      const result = await pool.query('SELECT * FROM sweet_spot_entries WHERE user_id = $1 ORDER BY created_at DESC', ['default-user']);
      return res.status(200).json(result.rows);
    }
    
    // POST new entry
    if (method === 'POST') {
      const { niche, account, keywords, audience, revenue_stream, pricing } = req.body;
      
      const result = await pool.query(
        'INSERT INTO sweet_spot_entries (user_id, niche, account, keywords, audience, revenue_stream, pricing) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        ['default-user', niche, account, keywords, audience || 0, revenue_stream, pricing]
      );
      
      console.log('Sweet spot entry created:', result.rows[0].id);
      return res.status(201).json(result.rows[0]);
    }
    
    // Handle individual entry operations (PUT, DELETE)
    if (query.id) {
      const { id } = query;
      
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
        
        return res.status(200).json({ message: 'Sweet spot entry deleted successfully' });
      }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message
    });
  }
};
