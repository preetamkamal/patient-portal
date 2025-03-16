// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

const PORT = process.env.PORT || 5011;
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";  // Change this in production

app.use(cors());
app.use(bodyParser.json());

// Ensure uploads folder exists (already done in db.js, but added here for safety)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Add this before your routes
app.use(express.static(path.join(__dirname, '../frontend/dist')));


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

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
    req.user = user; // Expected payload: { id, email, role }
    next();
  });
}

// ------------------------------
// AUTHENTICATION ENDPOINTS
// ------------------------------

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM admins WHERE email = ? AND password = ?';
  db.get(query, [email, password], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (row) {
      const token = jwt.sign({ id: row.id, email: row.email, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ success: true, admin: row, token });
      logAction('admin login', `Admin ${row.email} logged in`);
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});

app.get('/api/admin/logs', authenticateToken, (req, res) => {
  if(req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const query = 'SELECT * FROM logs ORDER BY timestamp DESC';
  db.all(query, [], (err, rows) => {
    if(err) res.status(500).json({ error: 'Database error' });
    else res.json(rows);
  });
});

// Patient login
app.post('/api/patient/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM patients WHERE email = ? AND password = ?';
  db.get(query, [email, password], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (row) {
      const token = jwt.sign({ id: row.id, email: row.email, role: 'patient' }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ success: true, patient: row, token });
      logAction('patient login', `Patient ${row.email} logged in`);
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});

// ------------------------------
// ADMIN ENDPOINTS
// ------------------------------

// GET /api/admin/users – returns all patient users.
app.get('/api/admin/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const query = 'SELECT id, email FROM patients';
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// DELETE /api/admin/users/:patientId – deletes a user.
app.delete('/api/admin/users/:patientId', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { patientId } = req.params;
  const query = 'DELETE FROM patients WHERE id = ?';
  db.run(query, [patientId], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  });
});

// DELETE /api/admin/responses/:patientId – deletes that user’s response.
app.delete('/api/admin/responses/:patientId', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { patientId } = req.params;
  const query = 'DELETE FROM responses WHERE patient_id = ?';
  db.run(query, [patientId], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'No response found for that user' });
    res.json({ success: true });
    logAction('admin update response', `Admin updated response for patient ${patientId}`);
  });
});

// GET /api/admin/questions – returns all questions.
// app.get('/api/admin/questions', authenticateToken, (req, res) => {
//   if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
//   const query = 'SELECT id, language, question_text, options, image_url FROM questions';
//   db.all(query, [], (err, rows) => {
//     if (err) return res.status(500).json({ error: 'Database error' });
//     res.json(rows);
//   });
// });

// GET /api/admin/questions – returns all questions in insertion order.
app.get('/api/admin/questions', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    
    // Add ORDER BY id ASC here:
    const query = 'SELECT id, language, question_text, options, image_url FROM questions ORDER BY id ASC';
    
    db.all(query, [], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    });
  });
  

// DELETE /api/admin/questions/:questionId – deletes a question.
app.delete('/api/admin/questions/:questionId', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { questionId } = req.params;
  const query = 'DELETE FROM questions WHERE id = ?';
  db.run(query, [questionId], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'Question not found' });
    res.json({ success: true });
    logAction('admin delete question', `Admin deleted a question ${questionId}`);
  });
});

// GET /api/admin/responses – returns all responses.
app.get('/api/admin/responses', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const query = 'SELECT * FROM responses';
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// PUT /api/admin/responses/:patientId – admin updates a patient's response.
app.put('/api/admin/responses/:patientId', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { patientId } = req.params;
  const { responses } = req.body;
  const query = 'UPDATE responses SET responses = ? WHERE patient_id = ?';
  db.run(query, [JSON.stringify(responses), patientId], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
    logAction('admin update response', `Admin updated response for patient ${patientId}`);
  });
});

// POST /api/admin/toggle-edit – toggles whether editing is allowed.
app.post('/api/admin/toggle-edit', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { allow_edit } = req.body;
  const query = 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)';
  db.run(query, ['allow_edit', allow_edit ? '1' : '0'], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true, allow_edit });
    logAction('toggle edit', `Admin set allow_edit to ${allow_edit}`);
  });
});


// POST /api/admin/add-question – adds a new question with optional image.
app.post('/api/admin/add-question', authenticateToken, upload.single('image'), (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { language, question_text, options } = req.body;
    let image_url = null;
    if (req.file) {
      image_url = '/uploads/' + req.file.filename;
    }
    
    // Process options: split by comma and trim each option.
    // For each option:
    // - If it equals "Correct" (case-insensitive), score = 1.
    // - If it equals "Wrong" (case-insensitive), score = 0.
    // - If it can be parsed as a number, score = that number.
    // - Otherwise, default score is 0.
    const optionArr = options.split(',').map(opt => {
      const trimmed = opt.trim();
      let score = 0;
      if (trimmed.toLowerCase() === 'correct') {
        score = 1;
      } else if (trimmed.toLowerCase() === 'wrong') {
        score = 0;
      } else if (!isNaN(Number(trimmed))) {
        score = Number(trimmed);
      }
      return { text: trimmed, score };
    });
    
    const parsedOptions = JSON.stringify(optionArr);
    
    const query = `INSERT INTO questions (language, question_text, options, image_url)
                   VALUES (?, ?, ?, ?)`;
    db.run(query, [language, question_text, parsedOptions, image_url], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, questionId: this.lastID });
      logAction('add question', `Admin added question: ${question_text}`);
    });
  });
  

// ------------------------------
// PATIENT ENDPOINTS
// ------------------------------

// GET /api/patient/response-status?patientId=<id> – returns submission status.
app.get('/api/patient/response-status', authenticateToken, (req, res) => {
  const { patientId } = req.query;
  if (!patientId) return res.status(400).json({ error: 'Missing patientId' });
  const responseQuery = 'SELECT responses FROM responses WHERE patient_id = ?';
  db.get(responseQuery, [patientId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    const submitted = !!row;
    let parsedResponses = {};
    if (row) {
      try {
        parsedResponses = JSON.parse(row.responses);
      } catch (err) {}
    }
    const settingsQuery = 'SELECT value FROM settings WHERE key = ?';
    db.get(settingsQuery, ['allow_edit'], (err2, settingRow) => {
      if (err2) return res.status(500).json({ error: 'Database error' });
      const canEdit = settingRow ? settingRow.value === '1' : false;
      res.json({
        submitted,
        responses: parsedResponses,
        canEdit,
      });
    });
  });
});

// GET /api/patient/my-responses – returns responses for the logged-in patient.
app.get('/api/patient/my-responses', authenticateToken, (req, res) => {
  if (req.user.role !== 'patient') return res.status(403).json({ error: 'Forbidden' });
  const patientId = req.user.id;
  const query = 'SELECT * FROM responses WHERE patient_id = ?';
  db.all(query, [patientId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// GET /api/mcqs?lang=<lang> – returns questions for patients.
app.get('/api/mcqs', authenticateToken, (req, res) => {
  const lang = req.query.lang || 'en';
  const query = 'SELECT * FROM questions WHERE language = ?';
  db.all(query, [lang], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    const mcqs = rows.map(q => ({
      id: q.id,
      question_text: q.question_text,
      options: JSON.parse(q.options),
      image_url: q.image_url,
    }));
    res.json(mcqs);
  });
});

// // Example: Protected endpoint for patients to update responses (editing)
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

// In server.js, POST /api/mcqs/submit
app.post('/api/mcqs/submit', authenticateToken, (req, res) => {
    if (req.user.role !== 'patient') return res.status(403).json({ error: 'Forbidden' });
    const patientId = req.user.id; // from JWT
    const { responses } = req.body; // responses: { questionId: selectedOptionText, ... }
    
    // Check if response already exists
    const checkQuery = 'SELECT * FROM responses WHERE patient_id = ?';
    db.get(checkQuery, [patientId], (err, row) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (row) return res.status(400).json({ error: 'Response already submitted' });
      
      const questionIds = Object.keys(responses);
      let totalScore = 0;
      let totalMaxScore = 0;
      let processed = 0;
      
      questionIds.forEach((qid) => {
        const query = 'SELECT options FROM questions WHERE id = ?';
        db.get(query, [qid], (err, qRow) => {
          processed++;
          if (!err && qRow) {
            try {
              const options = JSON.parse(qRow.options); // array of {text, score}
              // Find the option that matches the response value
              const selected = options.find(opt => opt.text === responses[qid]);
              // Maximum possible score for this question is the maximum score among options.
              const questionMax = Math.max(...options.map(opt => opt.score));
              totalMaxScore += questionMax;
              if (selected) totalScore += selected.score;
            } catch (e) {
              console.error(e);
            }
          }
          if (processed === questionIds.length) {
            const result = {
              answers: responses,
              score: totalScore,
              maxScore: totalMaxScore
            };
            const insertQuery = 'INSERT INTO responses (patient_id, responses) VALUES (?, ?)';
            db.run(insertQuery, [patientId, JSON.stringify(result)], function(err) {
              if (err) return res.status(500).json({ error: 'Database error' });
              res.json({ success: true, responseId: this.lastID, score: totalScore, maxScore: totalMaxScore });
            });
          }
        });
      });
    });
  });

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
  


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

