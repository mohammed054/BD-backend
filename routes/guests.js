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

router.get('/:name/total', (req, res) => {
  try {
    const allItems = query('items');
    const guestName = req.params.name;
    const personalTotal = allItems
      .filter(item => item.claimed && item.claimed_by === guestName)
      .reduce((sum, item) => sum + (item.price || 0), 0);
    const grandTotal = allItems.reduce((sum, item) => sum + (item.price || 0), 0);
    const numGuests = 7;
    const splitTotal = grandTotal / numGuests;
    res.json({ 
      personalTotal,
      splitTotal,
      grandTotal,
      numGuests
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
