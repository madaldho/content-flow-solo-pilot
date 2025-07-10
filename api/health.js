const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test database connection
    await pool.query('SELECT 1');
    
    return res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      message: 'KontenFlow API is running on Vercel Functions',
      database: 'Connected'
    });
  } catch (error) {
    console.error('❌ Database Error:', error);
    return res.status(500).json({ 
      status: 'ERROR',
      message: 'Database connection failed',
      error: error.message
    });
  }
};
