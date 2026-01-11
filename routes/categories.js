const express = require('express');
const router = express.Router();
const { query, insert, update, remove } = require('../database');

router.get('/', (req, res) => {
  try {
    const rows = query('categories');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  const { name_ar, name_en, icon, order_index } = req.body;
  try {
    const result = insert('categories', {
      name_ar: name_ar || '',
      name_en: name_en || '',
      icon: icon || '',
      order_index: order_index || 0
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  const { name_ar, name_en, icon, order_index } = req.body;
  try {
    const result = update('categories', req.params.id, {
      name_ar: name_ar || '',
      name_en: name_en || '',
      icon: icon || '',
      order_index: order_index || 0
    });
    if (result) res.json(result);
    else res.status(404).json({ error: 'Not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const items = query('items', r => r.category_id === parseInt(req.params.id));
    items.forEach(item => remove('items', item.id));
    remove('categories', req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
