require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDatabase() {
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name_ar TEXT,
          name_en TEXT,
          icon TEXT,
          order_index INTEGER DEFAULT 0
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS items (
          id SERIAL PRIMARY KEY,
          category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
          name_ar TEXT,
          name_en TEXT,
          price NUMERIC DEFAULT 0,
          claimed BOOLEAN DEFAULT false,
          claimed_by INTEGER,
          CONSTRAINT items_check CHECK (category_id IS NOT NULL OR claimed = false)
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS guests (
          id SERIAL PRIMARY KEY,
          name TEXT,
          joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('Database tables initialized');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error initializing database:', err.message);
    throw err;
  }
}

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

initDatabase().catch(console.error);

module.exports = pool;
