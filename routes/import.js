const express = require('express');
const router = express.Router();
const { insert } = require('../database');

router.post('/', (req, res) => {
  const { categories, uncategorizedItems } = req.body;
  const results = { categoriesAdded: 0, itemsAdded: 0, errors: [] };

  console.log('Import received:', JSON.stringify(req.body).substring(0, 200));

  try {
    // Handle categories
    if (Array.isArray(categories)) {
      console.log('Processing categories:', categories.length);
      for (const cat of categories) {
        try {
          console.log('Inserting category:', cat.name_en || cat.name_ar);
          const newCat = insert('categories', {
            name_ar: cat.name_ar || '',
            name_en: cat.name_en || '',
            icon: cat.icon || '',
            order_index: cat.order_index || 0
          });
          results.categoriesAdded++;
          console.log('Category inserted, ID:', newCat.id);

          if (Array.isArray(cat.items)) {
            console.log('Processing items:', cat.items.length);
            for (const item of cat.items) {
              try {
                console.log('Inserting item:', item.name_en || item.name_ar);
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
                console.error('Item insert error:', err.message);
                results.errors.push(`Item error: ${err.message}`);
              }
            }
          }
        } catch (err) {
          console.error('Category insert error:', err.message);
          results.errors.push(`Category error: ${err.message}`);
        }
      }
    } else {
      console.log('Categories is not an array:', typeof categories);
    }

    // Handle uncategorized items
    if (Array.isArray(uncategorizedItems)) {
      console.log('Processing uncategorized items:', uncategorizedItems.length);
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
          console.error('Uncategorized item error:', err.message);
          results.errors.push(`Uncategorized item error: ${err.message}`);
        }
      }
    }

    console.log('Import complete:', results);
    res.json(results);
  } catch (err) {
    console.error('Import error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;