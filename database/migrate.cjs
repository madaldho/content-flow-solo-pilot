const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_HZN4Q0SdiUbM@ep-still-art-a134rndc-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

async function runMigration() {
  try {
    console.log('🔗 Testing database connection...');
    
    // Test connection
    const testResult = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connected successfully:', testResult.rows[0].current_time);

    console.log('📋 Reading schema file...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('🚀 Executing schema migration...');
    await pool.query(schema);

    console.log('✅ Schema migration completed successfully!');
    console.log('📊 Verifying tables...');

    // Verify tables were created
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('📋 Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    await pool.end();
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
}

// Run the migration
runMigration();
