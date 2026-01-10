const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/category/:categoryId', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM items WHERE category_id = $1',
      [req.params.categoryId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { category_id, name_ar, name_en, price } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO items (category_id, name_ar, name_en, price, claimed, claimed_by) VALUES ($1, $2, $3, $4, false, NULL) RETURNING *',
      [category_id || null, name_ar, name_en, price || 0]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/uncategorized', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM items WHERE category_id IS NULL ORDER BY id'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/claim', async (req, res) => {
  const { claimed, claimed_by } = req.body;
  try {
    const result = await db.query(
      'UPDATE items SET claimed = $1, claimed_by = $2 WHERE id = $3 RETURNING *',
      [claimed, claimed_by || null, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM items WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
