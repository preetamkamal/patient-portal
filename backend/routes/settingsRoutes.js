const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get application settings
router.get('/', (req, res) => {
  const query = 'SELECT value FROM settings WHERE key = ?';
  db.get(query, ['allow_edit'], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ allow_edit: row ? row.value : '1' });
  });
});

module.exports = router;
