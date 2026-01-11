const express = require('express');
const router = express.Router();
const { query, run } = require('../database');

router.get('/category/:categoryId', (req, res) => {
  try {
    const rows = query('SELECT * FROM items WHERE category_id = ?', [req.params.categoryId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  const { category_id, name_ar, name_en, price } = req.body;
  try {
    const result = run(
      'INSERT INTO items (category_id, name_ar, name_en, price, claimed, claimed_by) VALUES (?, ?, ?, ?, 0, NULL)',
      [category_id || null, name_ar, name_en, price || 0]
    );
    res.json({ id: result.id, category_id, name_ar, name_en, price: price || 0, claimed: 0, claimed_by: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/uncategorized', (req, res) => {
  try {
    const rows = query('SELECT * FROM items WHERE category_id IS NULL ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/claim', (req, res) => {
  const { claimed, claimed_by } = req.body;
  try {
    run(
      'UPDATE items SET claimed = ?, claimed_by = ? WHERE id = ?',
      [claimed ? 1 : 0, claimed_by || null, req.params.id]
    );
    res.json({ id: req.params.id, claimed: claimed ? 1 : 0, claimed_by: claimed_by || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    run('DELETE FROM items WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
