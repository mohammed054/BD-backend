const express = require('express');
const router = express.Router();
const { run } = require('../database');

router.post('/', (req, res) => {
  const { categories, uncategorizedItems } = req.body;
  const results = { categoriesAdded: 0, itemsAdded: 0, errors: [] };

  try {
    const db = require('../database');
    const Database = require('better-sqlite3');
    const path = require('path');
    const dbDir = process.env.NODE_ENV === 'production' ? '/tmp' : __dirname;
    const dbPath = path.join(dbDir, 'database.sqlite');
    const connection = new Database(dbPath);

    connection.exec('BEGIN TRANSACTION');

    if (categories) {
      if (!Array.isArray(categories)) {
        return res.status(400).json({ error: 'Categories must be an array' });
      }

      for (const cat of categories) {
        try {
          const info = connection.prepare(
            'INSERT INTO categories (name_ar, name_en, icon, order_index) VALUES (?, ?, ?, ?)'
          ).run([cat.name_ar || '', cat.name_en || '', cat.icon || '', cat.order_index || 0]);
          results.categoriesAdded++;
          const categoryId = info.lastInsertRowid;

          if (Array.isArray(cat.items)) {
            for (const item of cat.items) {
              try {
                connection.prepare(
                  'INSERT INTO items (category_id, name_ar, name_en, price) VALUES (?, ?, ?, ?)'
                ).run([categoryId, item.name_ar || '', item.name_en || '', item.price || 0]);
                results.itemsAdded++;
              } catch (err) {
                results.errors.push(`Item in category ${cat.name_en}: ${err.message}`);
              }
            }
          }
        } catch (err) {
          results.errors.push(`Category ${cat.name_en}: ${err.message}`);
        }
      }
    }

    if (Array.isArray(uncategorizedItems)) {
      for (const item of uncategorizedItems) {
        try {
          connection.prepare(
            'INSERT INTO items (category_id, name_ar, name_en, price, claimed, claimed_by) VALUES (NULL, ?, ?, ?, 0, NULL)'
          ).run([item.name_ar || '', item.name_en || '', item.price || 0]);
          results.itemsAdded++;
        } catch (err) {
          results.errors.push(`Uncategorized item: ${err.message}`);
        }
      }
    }

    connection.exec('COMMIT');
    connection.close();
    res.json(results);

  } catch (err) {
    try {
      const connection = new Database(dbPath);
      connection.exec('ROLLBACK');
      connection.close();
    } catch (e) {}
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
