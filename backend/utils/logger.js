const db = require('../config/db');

function logAction(action, details) {
  const query = 'INSERT INTO logs (action, details) VALUES (?, ?)';
  db.run(query, [action, details], (err) => {
    if (err) {
      console.error('Error logging action:', err);
    }
  });
}

module.exports = {
  logAction
};
