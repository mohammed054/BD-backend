const express = require('express');
const router = express.Router();
const { query, run, get } = require('../database');

router.get('/', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM guests ORDER BY joined_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { name } = req.body;
  try {
    const result = await run('INSERT INTO guests (name) VALUES (?)', [name]);
    res.json({ id: result.id, name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM guests WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/total', async (req, res) => {
  try {
    const row = await get(
      'SELECT COALESCE(SUM(price), 0) as total FROM items WHERE claimed = 1 AND claimed_by = ?',
      [req.params.id]
    );
    res.json({ total: row ? parseFloat(row.total) || 0 : 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
