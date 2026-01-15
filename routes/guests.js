const express = require('express');
const router = express.Router();
<<<<<<< HEAD

const HARDCODED_GUESTS = [
  { id: 1, name: 'Guest 1' },
  { id: 2, name: 'Guest 2' },
  { id: 3, name: 'Guest 3' }
];
=======
const { query, get, insert, remove } = require('../database');
>>>>>>> bb37438b7eb09788cbec8d0734b48112188083c4

router.get('/', (req, res) => {
  try {
<<<<<<< HEAD
    res.json(HARDCODED_GUESTS);
=======
    const rows = query('guests');
    res.json(rows);
>>>>>>> bb37438b7eb09788cbec8d0734b48112188083c4
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
    const grandTotal = allItems.reduce((sum, item) => sum + (item.price || 0), 0);
    const numGuests = query('guests').length || 1;
    const splitTotal = grandTotal / numGuests;
    res.json({ total: splitTotal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
