const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bd_backend'
});

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name_ar TEXT,
        name_en TEXT,
        icon TEXT,
        order_index INTEGER DEFAULT 0
      );
      
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        category_id INTEGER,
        name_ar TEXT,
        name_en TEXT,
        price DECIMAL(10, 2) DEFAULT 0,
        claimed BOOLEAN DEFAULT false,
        claimed_by TEXT
      );
      
      CREATE TABLE IF NOT EXISTS guests (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE,
        joined_at TEXT
      );
    `);
    console.log('Database tables initialized');
  } catch (err) {
    console.error('Error initializing DB:', err);
  } finally {
    client.release();
  }
}

initDB();

function query(table, where = null) {
  return pool.query(`SELECT * FROM ${table}`).then(res => {
    let rows = res.rows;
    if (where) rows = rows.filter(where);
    return rows;
  });
}

async function get(table, id) {
  const res = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
  return res.rows[0];
}

async function insert(table, row) {
  const keys = Object.keys(row);
  const values = Object.values(row);
  const cols = keys.join(', ');
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  
  const res = await pool.query(
    `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) RETURNING *`,
    values
  );
  return res.rows[0];
}

async function update(table, id, updates) {
  const keys = Object.keys(updates);
  const values = Object.values(updates);
  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
  
  const res = await pool.query(
    `UPDATE ${table} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
    [...values, id]
  );
  return res.rows[0];
}

async function remove(table, id) {
  const res = await pool.query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id]);
  return res.rows[0];
}

module.exports = { query, get, insert, update, remove, pool };
