const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = process.env.NODE_ENV === 'production' ? '/tmp' : __dirname;
const dbPath = path.join(dbDir, 'database.sqlite');

try {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  const db = new Database(dbPath);
  console.log('Connected to SQLite database at:', dbPath);
  
  db.exec(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_ar TEXT,
    name_en TEXT,
    icon TEXT,
    order_index INTEGER DEFAULT 0
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    name_ar TEXT,
    name_en TEXT,
    price REAL DEFAULT 0,
    claimed INTEGER DEFAULT 0,
    claimed_by INTEGER,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS guests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  console.log('Database tables initialized successfully');

  function query(sql, params = []) {
    const stmt = db.prepare(sql);
    return stmt.all(params);
  }

  function get(sql, params = []) {
    const stmt = db.prepare(sql);
    return stmt.get(params);
  }

  function run(sql, params = []) {
    const stmt = db.prepare(sql);
    const info = stmt.run(params);
    return { id: info.lastInsertRowid, changes: info.changes };
  }

  module.exports = { query, get, run };
} catch (err) {
  console.error('Database initialization error:', err);
  throw err;
}
