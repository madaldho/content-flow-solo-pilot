const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.VITE_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkTables() {
  try {
    console.log('🔍 Checking database tables...');
    
    // Check all tables
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.log('📋 Tables:', result.rows.map(row => row.table_name));
    
    // Check if sweet_spot_entries table exists
    const sweetSpotResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'sweet_spot_entries'
      ORDER BY ordinal_position;
    `);
    console.log('🍯 Sweet Spot Entries columns:', sweetSpotResult.rows);
    
    // Check if sweet_spot_settings table exists
    const settingsResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'sweet_spot_settings'
      ORDER BY ordinal_position;
    `);
    console.log('⚙️  Sweet Spot Settings columns:', settingsResult.rows);
    
    console.log('✅ Database check completed!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
  await pool.end();
}

checkTables();
