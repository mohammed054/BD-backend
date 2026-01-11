const express = require('express');
const router = express.Router();
const { query, run, get } = require('../database');

router.get('/', (req, res) => {
  try {
    const rows = query('SELECT * FROM guests ORDER BY joined_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  const { name } = req.body;
  try {
    const result = run('INSERT INTO guests (name) VALUES (?)', [name]);
    res.json({ id: result.id, name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    run('DELETE FROM guests WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/total', (req, res) => {
  try {
    const row = get(
      'SELECT COALESCE(SUM(price), 0) as total FROM items WHERE claimed = 1 AND claimed_by = ?',
      [req.params.id]
    );
    res.json({ total: row ? parseFloat(row.total) || 0 : 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
