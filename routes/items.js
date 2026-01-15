const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/category/:categoryId', (req, res) => {
  try {
    const rows = db.query('items', r => r.category_id === parseInt(req.params.categoryId));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  const { category_id, name_ar, name_en, price } = req.body;
  try {
    const result = db.insert('items', {
      category_id: category_id || null,
      name_ar,
      name_en,
      price: price || 0,
      claimed: false,
      claimed_by: null
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/uncategorized', (req, res) => {
  try {
    const rows = db.query('items', r => r.category_id === null);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/claim', (req, res) => {
  const { claimed, claimed_by } = req.body;
  const itemId = parseInt(req.params.id);
  
  try {
    const items = db.query('items');
    const item = items.find(r => r.id === itemId);
    
    if (!item) {
      console.log('Item not found:', itemId);
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const updated = db.update('items', itemId, {
      claimed: !!claimed,
      claimed_by: claimed && claimed_by ? claimed_by : null
    });
    
    console.log('Claim updated:', updated);
    res.json(updated);
  } catch (err) {
    console.error('Claim error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/duplicate', (req, res) => {
  try {
    const originalItem = db.get('items', req.params.id);
    if (!originalItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const result = db.insert('items', {
      category_id: originalItem.category_id,
      name_ar: originalItem.name_ar,
      name_en: originalItem.name_en,
      price: originalItem.price,
      claimed: false,
      claimed_by: null
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.remove('items', req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/price', (req, res) => {
  const { price } = req.body;
  try {
    const currentItem = db.get('items', req.params.id);
    if (!currentItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (parseFloat(currentItem.price) > 0) {
      return res.status(400).json({ error: 'Price cannot be changed once set' });
    }

    const result = db.update('items', req.params.id, { price: price || 0 });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
