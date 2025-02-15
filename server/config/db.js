const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'parking_system',
  password: 'parth26nath',
  port: 5432,
});

const connectDB = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Connected to PostgreSQL');
    
    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS parking_slots (
        id SERIAL PRIMARY KEY,
        slot_number VARCHAR(10) UNIQUE NOT NULL,
        is_occupied BOOLEAN DEFAULT FALSE,
        qr_code TEXT
      );
    `);
    
    console.log('Tables created successfully');
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };