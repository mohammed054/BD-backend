const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

function initDatabase() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_ar TEXT,
      name_en TEXT,
      icon TEXT,
      order_index INTEGER DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      name_ar TEXT,
      name_en TEXT,
      price REAL DEFAULT 0,
      claimed INTEGER DEFAULT 0,
      claimed_by INTEGER,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS guests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error initializing database:', err.message);
      } else {
        console.log('Database tables initialized');
      }
    });
  });
}

initDatabase();

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

module.exports = { query, get, run };
