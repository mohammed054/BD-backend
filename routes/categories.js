const express = require('express');
const router = express.Router();
const { query, insert, update, remove } = require('../database');

router.get('/', (req, res) => {
  try {
    console.log('GET /api/categories');
    const rows = query('categories');
    console.log('Categories found:', rows.length);
    res.json(rows);
  } catch (err) {
    console.error('Error in GET /api/categories:', err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

router.post('/', (req, res) => {
  try {
    console.log('POST /api/categories:', req.body);
    const { name_ar, name_en, icon, order_index } = req.body;
    const result = insert('categories', {
      name_ar: name_ar || '',
      name_en: name_en || '',
      icon: icon || '',
      order_index: order_index || 0
    });
    console.log('Category added:', result);
    res.json(result);
  } catch (err) {
    console.error('Error in POST /api/categories:', err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

router.put('/:id', (req, res) => {
  try {
    console.log('PUT /api/categories/' + req.params.id, req.body);
    const { name_ar, name_en, icon, order_index } = req.body;
    const result = update('categories', req.params.id, {
      name_ar: name_ar || '',
      name_en: name_en || '',
      icon: icon || '',
      order_index: order_index || 0
    });
    if (result) {
      console.log('Category updated:', result);
      res.json(result);
    } else res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('Error in PUT /api/categories:', err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    console.log('DELETE /api/categories/' + req.params.id);
    const items = query('items', r => r.category_id === parseInt(req.params.id));
    items.forEach(item => remove('items', item.id));
    remove('categories', req.params.id);
    console.log('Category deleted');
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error in DELETE /api/categories:', err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

module.exports = router;
