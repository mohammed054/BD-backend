const express = require('express');
const router = express.Router();
const { insert } = require('../database');

router.post('/', (req, res) => {
  const { categories, uncategorizedItems } = req.body;
  const results = { categoriesAdded: 0, itemsAdded: 0, errors: [] };

  try {
    if (categories) {
      if (!Array.isArray(categories)) {
        return res.status(400).json({ error: 'Categories must be an array' });
      }

      for (const cat of categories) {
        try {
          const newCat = insert('categories', {
            name_ar: cat.name_ar || '',
            name_en: cat.name_en || '',
            icon: cat.icon || '',
            order_index: cat.order_index || 0
          });
          results.categoriesAdded++;

          if (Array.isArray(cat.items)) {
            for (const item of cat.items) {
              try {
                insert('items', {
                  category_id: newCat.id,
                  name_ar: item.name_ar || '',
                  name_en: item.name_en || '',
                  price: item.price || 0,
                  claimed: false,
                  claimed_by: null
                });
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
          insert('items', {
            category_id: null,
            name_ar: item.name_ar || '',
            name_en: item.name_en || '',
            price: item.price || 0,
            claimed: false,
            claimed_by: null
          });
          results.itemsAdded++;
        } catch (err) {
          results.errors.push(`Uncategorized item: ${err.message}`);
        }
      }
    }

    res.json(results);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
