// server.js
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = process.env.PORT || 5011;
const JWT_SECRET = "your_secret_key";  // Change to an env variable in production

app.use(cors());
app.use(bodyParser.json());

// Utility logging function
function logAction(action, details) {
  const query = 'INSERT INTO logs (action, details) VALUES (?, ?)';
  db.run(query, [action, details]);
}

// JWT middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Admin login endpoint (issues JWT)
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM admins WHERE email = ? AND password = ?';
  db.get(query, [email, password], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else if (row) {
      const token = jwt.sign({ id: row.id, email: row.email, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ success: true, admin: row, token });
      logAction('admin login', `Admin ${row.email} logged in`);
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});

// Patient login endpoint (issues JWT)
app.post('/api/patient/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM patients WHERE email = ? AND password = ?';
  db.get(query, [email, password], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else if (row) {
      const token = jwt.sign({ id: row.id, email: row.email, role: 'patient' }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ success: true, patient: row, token });
      logAction('patient login', `Patient ${row.email} logged in`);
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});

// FETCH MCQs (protected - can be either patient or admin)
app.get('/api/mcqs', authenticateToken, (req, res) => {
  // We'll just fetch questions by language from the "questions" table
  const lang = req.query.lang || 'en';
  const query = 'SELECT * FROM questions WHERE language = ?';
  db.all(query, [lang], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      // Convert options from JSON string to array
      const mcqs = rows.map(q => ({
        id: q.id,
        question: q.question_text,
        options: JSON.parse(q.options),
        image_url: q.image_url
      }));
      res.json(mcqs);
    }
  });
});

// SUBMIT MCQs (patient only)
app.post('/api/mcqs/submit', authenticateToken, (req, res) => {
  if (req.user.role !== 'patient') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { patientId, responses } = req.body;
  // Insert into "responses" table
  const query = 'INSERT INTO responses (patient_id, responses) VALUES (?,?)';
  db.run(query, [patientId, JSON.stringify(responses)], function(err) {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      logAction('submit response', `Patient ${patientId} submitted MCQs`);
      res.json({ success: true, responseId: this.lastID });
    }
  });
});

// Example: Protected endpoint for patients to update responses (editing)
app.put('/api/mcqs/update', authenticateToken, (req, res) => {
  if (req.user.role !== 'patient') return res.status(403).json({ error: 'Forbidden' });
  // Check if editing is allowed
  db.get('SELECT value FROM settings WHERE key = ?', ['allow_edit'], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    const allow_edit = row ? row.value === '1' : true;
    if(!allow_edit) return res.status(403).json({ error: 'Editing not allowed' });
    
    const { patientId, responses } = req.body;
    const query = 'UPDATE responses SET responses = ? WHERE patient_id = ?';
    db.run(query, [JSON.stringify(responses), patientId], function(err) {
      if(err) res.status(500).json({ error: 'Database error' });
      else {
        logAction('update response', `Patient ${patientId} updated response`);
        res.json({ success: true });
      }
    });
  });
});

// Endpoint for toggling edit (admin only)
app.post('/api/admin/toggle-edit', authenticateToken, (req, res) => {
  if(req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { allow_edit } = req.body;  // expects a boolean
  const query = 'INSERT OR REPLACE INTO settings (key, value) VALUES (?,?)';
  db.run(query, ['allow_edit', allow_edit ? '1' : '0'], function(err) {
    if(err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      logAction('toggle edit', `Admin set allow_edit to ${allow_edit}`);
      res.json({ success: true, allow_edit });
    }
  });
});

// Endpoint for admin to add a new question (with optional image)
app.post('/api/admin/add-question', authenticateToken, (req, res) => {
  if(req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { language, question_text, options, image_url } = req.body;
  const query = 'INSERT INTO questions (language, question_text, options, image_url) VALUES (?,?,?,?)';
  db.run(query, [language, question_text, JSON.stringify(options), image_url || null], function(err) {
    if(err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      logAction('add question', `Admin added question: ${question_text}`);
      res.json({ success: true, questionId: this.lastID });
    }
  });
});

// Endpoint for admin to view logs
app.get('/api/admin/logs', authenticateToken, (req, res) => {
  if(req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const query = 'SELECT * FROM logs ORDER BY timestamp DESC';
  db.all(query, [], (err, rows) => {
    if(err) res.status(500).json({ error: 'Database error' });
    else res.json(rows);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
