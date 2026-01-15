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
  const timestamp = Date.now();
  
  console.log(`\n========== ${new Date().toISOString()} ===========`);
  console.log(`[${timestamp}] [ITEMS] ===== CLAIM REQUEST =====`);
  console.log(`[${timestamp}] [ITEMS] Item ID:`, itemId);
  console.log(`[${timestamp}] [ITEMS] Request body:`, { claimed, claimed_by });
  console.log(`[${timestamp}] [ITEMS] Query params id:`, req.params.id);
  console.log(`[${timestamp}] [ITEMS] Current items in DB:`, req.app.locals.dbData?.items?.length || 'unknown');
  console.log(`[${timestamp}] [ITEMS] Current items array:`, JSON.stringify(req.app.locals.dbData?.items || []));
  
  try {
    console.log(`[${timestamp}] [ITEMS] Calling update function...`);
    const result = update('items', itemId, {
      claimed: !!claimed,
      claimed_by: claimed && claimed_by ? claimed_by : null
    });
    
    console.log(`[${timestamp}] [ITEMS] Update result:`, result);
    console.log(`[${timestamp}] [ITEMS] Items in DB after update:`, req.app.locals.dbData?.items?.length || 'unknown');
    
    if (result) {
      console.log(`[${timestamp}] [ITEMS] Claim successful! Responding with:`, result);
      res.json(result);
    } else {
      console.log(`[${timestamp}] [ITEMS] Item not found with ID:`, itemId);
      res.status(404).json({ error: 'Not found', id: itemId });
    }
  } catch (err) {
    console.log(`[${timestamp}] [ITEMS] Error stack:`, err.stack);
    console.error(`[${timestamp}] [ITEMS] Claim error:`, err.message);
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

module.exports = router;
