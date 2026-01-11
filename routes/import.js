const express = require('express');
const router = express.Router();
const { run } = require('../database');

router.post('/', async (req, res) => {
  const { categories, uncategorizedItems } = req.body;
  const results = { categoriesAdded: 0, itemsAdded: 0, errors: [] };

  try {
    await run('BEGIN TRANSACTION');

    if (categories) {
      if (!Array.isArray(categories)) {
        throw new Error('Categories must be an array');
      }

      for (const cat of categories) {
        try {
          const catResult = await run(
            'INSERT INTO categories (name_ar, name_en, icon, order_index) VALUES (?, ?, ?, ?)',
            [cat.name_ar || '', cat.name_en || '', cat.icon || '', cat.order_index || 0]
          );
          results.categoriesAdded++;
          const categoryId = catResult.id;

          if (Array.isArray(cat.items)) {
            for (const item of cat.items) {
              try {
                await run(
                  'INSERT INTO items (category_id, name_ar, name_en, price) VALUES (?, ?, ?, ?)',
                  [categoryId, item.name_ar || '', item.name_en || '', item.price || 0]
                );
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
          await run(
            'INSERT INTO items (category_id, name_ar, name_en, price, claimed, claimed_by) VALUES (NULL, ?, ?, ?, 0, NULL)',
            [item.name_ar || '', item.name_en || '', item.price || 0]
          );
          results.itemsAdded++;
        } catch (err) {
          results.errors.push(`Uncategorized item: ${err.message}`);
        }
      }
    }

    await run('COMMIT');
    res.json(results);

  } catch (err) {
    await run('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
