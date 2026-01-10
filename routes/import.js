const express = require('express');
const router = express.Router();
const db = require('../database');

router.post('/', async (req, res) => {
  const { categories, uncategorizedItems } = req.body;
  const results = { categoriesAdded: 0, itemsAdded: 0, errors: [] };

  const client = await db.connect();
  
  try {
    await client.query('BEGIN');

    if (categories) {
      if (!Array.isArray(categories)) {
        return res.status(400).json({ error: 'Categories must be an array' });
      }

      for (const cat of categories) {
        try {
          const catResult = await client.query(
            'INSERT INTO categories (name_ar, name_en, icon, order_index) VALUES ($1, $2, $3, $4) RETURNING id',
            [cat.name_ar || '', cat.name_en || '', cat.icon || '', cat.order_index || 0]
          );
          results.categoriesAdded++;
          const categoryId = catResult.rows[0].id;

          if (Array.isArray(cat.items)) {
            for (const item of cat.items) {
              try {
                await client.query(
                  'INSERT INTO items (category_id, name_ar, name_en, price) VALUES ($1, $2, $3, $4)',
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
          await client.query(
            'INSERT INTO items (category_id, name_ar, name_en, price, claimed, claimed_by) VALUES (NULL, $1, $2, $3, false, NULL)',
            [item.name_ar || '', item.name_en || '', item.price || 0]
          );
          results.itemsAdded++;
        } catch (err) {
          results.errors.push(`Uncategorized item: ${err.message}`);
        }
      }
    }

    await client.query('COMMIT');
    res.json(results);

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
