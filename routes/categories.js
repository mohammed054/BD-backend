const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categories ORDER BY order_index');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { name_ar, name_en, icon, order_index } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO categories (name_ar, name_en, icon, order_index) VALUES ($1, $2, $3, $4) RETURNING *',
      [name_ar, name_en, icon, order_index || 0]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { name_ar, name_en, icon, order_index } = req.body;
  try {
    const result = await db.query(
      'UPDATE categories SET name_ar = $1, name_en = $2, icon = $3, order_index = $4 WHERE id = $5 RETURNING *',
      [name_ar, name_en, icon, order_index, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM items WHERE category_id = $1', [req.params.id]);
    await db.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
