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
    const items = query('items', r => r.claimed && r.claimed_by === req.params.name);
    const total = items.reduce((sum, item) => sum + (item.price || 0), 0);
    res.json({ personalTotal: total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/claim-all', (req, res) => {
  const { category_id } = req.body;
  console.log(`[GUESTS] Claim all request for category ${category_id}`);
  
  try {
    const { query } = require('../database');
    const items = query('items', r => r.category_id === parseInt(category_id));
    console.log(`[GUESTS] Found ${items.length} items in category ${category_id}`);
    
    let updatedCount = 0;
    for (const item of items) {
      if (!item.claimed || item.claimed_by === null) {
        query('items', r => r.id === item.id)[0] = {
          claimed: true,
          claimed_by: req.app.locals.userName
        };
        updatedCount++;
      }
    }
    
    console.log(`[GUESTS] Updated ${updatedCount} items to claimed`);
    
    const { saveData } = require('../database');
    saveData();
    
    console.log(`[GUESTS] Claim all complete, returning ${updatedCount} updated`);
    res.json({ updatedCount });
  } catch (err) {
    console.error('[GUESTS] Claim all error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/split-total', (req, res) => {
  try {
    const items = query('items');
    const totalAmount = items.reduce((sum, item) => sum + (item.price || 0), 0);
    const splitTotal = totalAmount / 7;
    res.json({ splitTotal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
