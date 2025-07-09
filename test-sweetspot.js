const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.VITE_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testSweetSpotTables() {
  try {
    console.log('🔍 Testing SweetSpot tables...');
    
    // Test tabel sweet_spot_entries
    const entriesResult = await pool.query('SELECT * FROM sweet_spot_entries LIMIT 1');
    console.log('✅ sweet_spot_entries table exists');
    
    // Test tabel sweet_spot_settings
    const settingsResult = await pool.query('SELECT * FROM sweet_spot_settings LIMIT 1');
    console.log('✅ sweet_spot_settings table exists');
    
    // Test insert data sample
    const insertResult = await pool.query(`
      INSERT INTO sweet_spot_entries (niche, account, keywords, audience, revenue_stream, pricing)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, ['TEST NICHE', 'Test Account', 'test keywords', 1000, 'Course', 'Rp100,000']);
    
    console.log('✅ Insert test berhasil:', insertResult.rows[0]);
    
    // Test API endpoint menggunakan curl
    console.log('🔍 Testing API endpoint...');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testSweetSpotTables();
