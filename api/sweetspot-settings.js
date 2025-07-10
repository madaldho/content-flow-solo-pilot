const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method } = req;
  
  try {
    // GET settings
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
    
    // PUT update settings
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
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message
    });
  }
};
