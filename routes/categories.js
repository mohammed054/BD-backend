const express = require('express');
const router = express.Router();
const { query, run } = require('../database');

router.get('/', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM categories ORDER BY order_index');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { name_ar, name_en, icon, order_index } = req.body;
  try {
    const result = await run(
      'INSERT INTO categories (name_ar, name_en, icon, order_index) VALUES (?, ?, ?, ?)',
      [name_ar || '', name_en || '', icon || '', order_index || 0]
    );
    res.json({ id: result.id, name_ar, name_en, icon, order_index });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { name_ar, name_en, icon, order_index } = req.body;
  try {
    await run(
      'UPDATE categories SET name_ar = ?, name_en = ?, icon = ?, order_index = ? WHERE id = ?',
      [name_ar || '', name_en || '', icon || '', order_index || 0, req.params.id]
    );
    res.json({ id: req.params.id, name_ar, name_en, icon, order_index });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM items WHERE category_id = ?', [req.params.id]);
    await run('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
