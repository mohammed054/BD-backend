const express = require('express');
const router = express.Router();
const db = require('../database');

router.post('/', async (req, res) => {
  const { categories, uncategorizedItems } = req.body;
  const results = { categoriesAdded: 0, itemsAdded: 0, errors: [] };

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    if (categories) {
      if (!Array.isArray(categories)) {
        return res.status(400).json({ error: 'Categories must be an array' });
      }

      categories.forEach(cat => {
        db.run(
          'INSERT INTO categories (name_ar, name_en, icon, order_index) VALUES (?, ?, ?, ?)',
          [cat.name_ar || '', cat.name_en || '', cat.icon || '', cat.order_index || 0],
          function(err) {
            if (err) {
              results.errors.push(`Category ${cat.name_en}: ${err.message}`);
            } else {
              results.categoriesAdded++;
              const categoryId = this.lastID;

              if (Array.isArray(cat.items)) {
                cat.items.forEach(item => {
                  db.run(
                    'INSERT INTO items (category_id, name_ar, name_en, price) VALUES (?, ?, ?, ?)',
                    [categoryId, item.name_ar || '', item.name_en || '', item.price || 0],
                    function(err) {
                      if (err) {
                        results.errors.push(`Item in category ${cat.name_en}: ${err.message}`);
                      } else {
                        results.itemsAdded++;
                      }
                    }
                  );
                });
              }
            }
          }
        );
      });
    }

    if (Array.isArray(uncategorizedItems)) {
      uncategorizedItems.forEach(item => {
        db.run(
          'INSERT INTO items (category_id, name_ar, name_en, price, claimed, claimed_by) VALUES (NULL, ?, ?, ?, 0, NULL)',
          [item.name_ar || '', item.name_en || '', item.price || 0],
          function(err) {
            if (err) {
              results.errors.push(`Uncategorized item: ${err.message}`);
            } else {
              results.itemsAdded++;
            }
          }
        );
      });
    }

    db.run('COMMIT', (err) => {
      if (err) {
        db.run('ROLLBACK');
        res.status(500).json({ error: err.message });
      } else {
        res.json(results);
      }
    });
  });
});

module.exports = router;
