const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = process.env.NODE_ENV === 'production' ? '/tmp' : __dirname;
const dbPath = path.join(dbDir, 'database.sqlite');

let db;
let dbReady = false;
const dbReadyPromise = new Promise((resolve, reject) => {
  try {
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database at:', dbPath);
      
      db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name_ar TEXT,
          name_en TEXT,
          icon TEXT,
          order_index INTEGER DEFAULT 0
        )`, (err) => {
          if (err) console.error('Error creating categories table:', err.message);
        });

        db.run(`CREATE TABLE IF NOT EXISTS items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category_id INTEGER,
          name_ar TEXT,
          name_en TEXT,
          price REAL DEFAULT 0,
          claimed INTEGER DEFAULT 0,
          claimed_by INTEGER,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        )`, (err) => {
          if (err) console.error('Error creating items table:', err.message);
        });

        db.run(`CREATE TABLE IF NOT EXISTS guests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
          if (err) {
            console.error('Error creating guests table:', err.message);
            reject(err);
          } else {
            console.log('Database tables initialized successfully');
            dbReady = true;
            resolve();
          }
        });
      });
    });
  } catch (err) {
    console.error('Database initialization error:', err);
    reject(err);
  }
});

async function query(sql, params = []) {
  if (!dbReady) await dbReadyPromise;
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function get(sql, params = []) {
  if (!dbReady) await dbReadyPromise;
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function run(sql, params = []) {
  if (!dbReady) await dbReadyPromise;
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

module.exports = { query, get, run };
