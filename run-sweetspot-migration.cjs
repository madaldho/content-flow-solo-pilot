const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.VITE_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    console.log('🔗 Testing database connection...');
    await pool.query('SELECT 1');
    console.log('✅ Database connected successfully');
    
    console.log('📋 Reading migration file...');
    const migrationSQL = fs.readFileSync('database/sweetspot-migration.sql', 'utf8');
    
    console.log('🚀 Executing migration...');
    await pool.query(migrationSQL);
    
    console.log('📊 Verifying tables...');
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'sweet_spot_%';
    `);
    
    console.log('📋 Sweet Spot tables created:', result.rows.map(row => row.table_name));
    
    // Test insert default settings
    console.log('🔄 Testing default settings...');
    const settingsResult = await pool.query('SELECT * FROM sweet_spot_settings');
    console.log('⚙️  Default settings:', settingsResult.rows);
    
    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
  
  await pool.end();
}

runMigration();
