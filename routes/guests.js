const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  db.all('SELECT * FROM guests ORDER BY joined_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { name } = req.body;
  db.run(
    'INSERT INTO guests (name) VALUES (?)',
    [name],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, name, joined_at: new Date().toISOString() });
    }
  );
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM guests WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Deleted' });
  });
});

router.get('/:id/total', (req, res) => {
  db.all(
    'SELECT SUM(price) as total FROM items WHERE claimed = 1 AND claimed_by = ?',
    [req.params.id],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ total: rows[0].total || 0 });
    }
  );
});

module.exports = router;