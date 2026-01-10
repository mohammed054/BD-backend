const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/category/:categoryId', (req, res) => {
  db.all(
    'SELECT * FROM items WHERE category_id = ?',
    [req.params.categoryId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

router.post('/', (req, res) => {
  const { category_id, name_ar, name_en, price } = req.body;
  db.run(
    'INSERT INTO items (category_id, name_ar, name_en, price, claimed, claimed_by) VALUES (?, ?, ?, ?, 0, NULL)',
    [category_id || null, name_ar, name_en, price || 0],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, category_id, name_ar, name_en, price: price || 0, claimed: false });
    }
  );
});

router.get('/uncategorized', (req, res) => {
  db.all(
    'SELECT * FROM items WHERE category_id IS NULL ORDER BY id',
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

router.put('/:id/claim', (req, res) => {
  const { claimed, claimed_by } = req.body;
  db.run(
    'UPDATE items SET claimed = ?, claimed_by = ? WHERE id = ?',
    [claimed ? 1 : 0, claimed_by || null, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: req.params.id, claimed, claimed_by });
    }
  );
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM items WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Deleted' });
  });
});

module.exports = router;