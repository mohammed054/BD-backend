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
  console.log(`[${timestamp}] [ITEMS] Item ID: ${itemId}`);
  console.log(`[${timestamp}] [ITEMS] Request body:`, { claimed, claimed_by });
  console.log(`[${timestamp}] [ITEMS] Category ID from URL: ${req.params.id}`);
  console.log(`[${timestamp}] [ITEMS] Items in DB before update:`, req.app.locals.dbData?.items?.length || 'unknown');
  console.log(`[${timestamp}] [ITEMS] Looking for item ${itemId} in items array...`);
  
  try {
    const { query } = require('../database');
    const items = query('items');
    console.log(`[${timestamp}] [ITEMS] Total items in DB:`, items.length);
    
    const item = items.find(r => r.id === parseInt(itemId));
    if (!item) {
      console.log(`[${timestamp}] [ITEMS] ERROR - Item with ID ${itemId} NOT FOUND in items array!`);
      console.log(`[${timestamp}] [ITEMS] Available item IDs:`, items.map(i => i.id));
      return res.status(404).json({ error: 'Item not found', id: itemId, availableIds: items.map(i => i.id) });
    }
    
    console.log(`[${timestamp}] [ITEMS] Found item to update:`, item);
    
    if (item.claimed === !!claimed && item.claimed_by === (claimed ? claimed_by : null)) {
      console.log(`[${timestamp}] [ITEMS] No change needed - item already in correct state`);
      return res.json(item);
    }
    
    console.log(`[${timestamp}] [ITEMS] Calling update function...`);
    const result = require('../database').update('items', itemId, {
      claimed: !!claimed,
      claimed_by: claimed && claimed_by ? claimed_by : null
    });
    
    console.log(`[${timestamp}] [ITEMS] Update result:`, result);
    console.log(`[${timestamp}] [ITEMS] Verifying item was updated...`);
    
    const updatedItems = query('items');
    const updatedItem = updatedItems.find(r => r.id === parseInt(itemId));
    console.log(`[${timestamp}] [ITEMS] Updated item from DB:`, updatedItem);
    
    if (!updatedItem) {
      console.log(`[${timestamp}] [ITEMS] ERROR - Item ${itemId} disappeared after update!`);
      return res.status(500).json({ error: 'Item disappeared after update' });
    }
    
    if (updatedItem.claimed !== !!claimed || updatedItem.claimed_by !== (claimed ? claimed_by : null)) {
      console.log(`[${timestamp}] [ITEMS] ERROR - Update failed to apply changes!`);
      console.log(`[${timestamp}] [ITEMS] Expected claimed=${!!claimed}, claimed_by=${claimed ? claimed_by : null}`);
      console.log(`[${timestamp}] [ITEMS] Actual claimed=${updatedItem.claimed}, claimed_by=${updatedItem.claimed_by}`);
      return res.status(500).json({ error: 'Update failed', expected: { claimed: !!claimed, claimed_by: claimed ? claimed_by : null }, actual: updatedItem });
    }
    
    console.log(`[${timestamp}] [ITEMS] Claim successful! Responding with item:`, updatedItem);
    res.json(updatedItem);
  } catch (err) {
    console.error(`[${timestamp}] [ITEMS] Claim error:`, err.message);
    console.error(`[${timestamp}] [ITEMS] Error stack:`, err.stack);
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
