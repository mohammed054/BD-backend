const express = require('express');
const router = express.Router();
const { query, get, insert, update, remove } = require('../database');

router.get('/category/:categoryId', (req, res) => {
  try {
    const rows = query('items', r => r.category_id === parseInt(req.params.categoryId));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  const { category_id, name_ar, name_en, price } = req.body;
  try {
    const result = insert('items', {
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
    const rows = query('items', r => r.category_id === null);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/claim', (req, res) => {
  const { claimed, claimed_by } = req.body;
  const itemId = req.params.id;
  console.log(`[ITEMS] Claim request received: itemId=${itemId}, claimed=${claimed}, claimed_by=${claimed_by}`);
  console.log(`[ITEMS] URL params id=${req.params.id}, body=`, req.body);
  
  try {
    console.log(`[ITEMS] Calling update with id=${itemId}`);
    const result = update('items', itemId, {
      claimed: !!claimed,
      claimed_by: claimed && claimed_by ? claimed_by : null
    });
    console.log(`[ITEMS] Update result:`, result);
    
    if (result) {
      console.log(`[ITEMS] Claim successful, responding with:`, result);
      res.json(result);
    } else {
      console.log(`[ITEMS] Item not found with id=${itemId}`);
      res.status(404).json({ error: 'Not found', id: itemId });
    }
  } catch (err) {
    console.error(`[ITEMS] Claim error:`, err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/duplicate', (req, res) => {
  try {
    const originalItem = get('items', req.params.id);
    if (!originalItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const result = insert('items', {
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
    remove('items', req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/price', async (req, res) => {
  const { price } = req.body;
  try {
    const result = await db.query(
      'SELECT price FROM items WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const currentPrice = parseFloat(result.rows[0].price);

    if (currentPrice > 0) {
      return res.status(400).json({ error: 'Price cannot be changed once set' });
    }

    const updateResult = await db.query(
      'UPDATE items SET price = $1 WHERE id = $2 RETURNING *',
      [price || 0, req.params.id]
    );

    res.json(updateResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
