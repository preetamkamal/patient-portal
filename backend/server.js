// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db'); // Our SQLite connection
const cors = require('cors');
const app = express();
const PORT = 5011;

app.use(cors());
app.use(bodyParser.json());

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM admins WHERE email = ? AND password = ?';
  db.get(query, [email, password], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else if (row) {
      res.json({ success: true, admin: row });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});

// Patient login
app.post('/api/patient/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM patients WHERE email = ? AND password = ?';
  db.get(query, [email, password], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else if (row) {
      res.json({ success: true, patient: row });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});

// Fetch MCQs (in English or Hindi)
app.get('/api/mcqs', (req, res) => {
  const lang = req.query.lang || 'en';
  // For demo purposes, using hardcoded questions
  let mcqs;
  if (lang === 'hi') {
    mcqs = [
      { id: 1, question: "आपका नाम क्या है?", options: ["राम", "श्याम", "मोहन", "सोहन"] },
      { id: 2, question: "आपकी उम्र क्या है?", options: ["20-30", "31-40", "41-50", "51+"] }
    ];
  } else {
    mcqs = [
      { id: 1, question: "What is your name?", options: ["John", "Doe", "Smith", "Jane"] },
      { id: 2, question: "What is your age group?", options: ["20-30", "31-40", "41-50", "51+"] }
    ];
  }
  res.json(mcqs);
});

// Submit MCQ responses
app.post('/api/mcqs/submit', (req, res) => {
  const { patientId, responses } = req.body;
  const query = 'INSERT INTO responses (patient_id, responses) VALUES (?, ?)';
  db.run(query, [patientId, JSON.stringify(responses)], function(err) {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json({ success: true, responseId: this.lastID });
    }
  });
});

// Admin view all responses
app.get('/api/admin/responses', (req, res) => {
  const query = 'SELECT * FROM responses';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json(rows);
    }
  });
});

// Admin add a new patient
app.post('/api/admin/add-patient', (req, res) => {
  const { email, password } = req.body;
  const query = 'INSERT INTO patients (email, password) VALUES (?, ?)';
  db.run(query, [email, password], function(err) {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json({ success: true, patientId: this.lastID });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
