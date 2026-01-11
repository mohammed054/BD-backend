const express = require('express');
const router = express.Router();
const { query, get, insert, remove } = require('../database');

router.get('/', (req, res) => {
  try {
    const rows = query('guests');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  const { name } = req.body;
  try {
    const result = insert('guests', {
      name,
      joined_at: new Date().toISOString()
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    remove('guests', req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/total', (req, res) => {
  try {
    const items = query('items', r => r.claimed && r.claimed_by === parseInt(req.params.id));
    const total = items.reduce((sum, item) => sum + (item.price || 0), 0);
    res.json({ total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
