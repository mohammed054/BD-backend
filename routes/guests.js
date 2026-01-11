const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', async (req, res) => {
  db.all('SELECT * FROM guests ORDER BY joined_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

router.post('/', async (req, res) => {
  const { name } = req.body;
  db.run(
    'INSERT INTO guests (name) VALUES (?)',
    [name],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, name });
      }
    }
  );
});

router.delete('/:id', async (req, res) => {
  db.run('DELETE FROM guests WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Deleted' });
    }
  });
});

router.get('/:id/total', async (req, res) => {
  db.get(
    'SELECT COALESCE(SUM(price), 0) as total FROM items WHERE claimed = 1 AND claimed_by = ?',
    [req.params.id],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ total: row ? parseFloat(row.total) || 0 : 0 });
      }
    }
  );
});

module.exports = router;
