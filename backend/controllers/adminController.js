const db = require('../config/db');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const { logAction } = require('../utils/logger');

// Admin login
exports.login = (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM admins WHERE email = ? AND password = ?';
  
  db.get(query, [email, password], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    if (row) {
      const token = jwt.sign(
        { id: row.id, email: row.email, role: 'admin' }, 
        JWT_SECRET, 
        { expiresIn: '1h' }
      );
      
      res.json({ success: true, admin: row, token });
      logAction('admin login', `Admin ${row.email} logged in`);
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
};

// Get system logs
exports.getLogs = (req, res) => {
  const query = 'SELECT * FROM logs ORDER BY timestamp DESC';
  
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
};

// Get all users (patients)
exports.getUsers = (req, res) => {
  const query = 'SELECT id, email FROM patients';
  
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
};

// Delete a user
exports.deleteUser = (req, res) => {
  const { patientId } = req.params;
  const query = 'DELETE FROM patients WHERE id = ?';
  
  db.run(query, [patientId], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
    
    res.json({ success: true });
    logAction('admin delete user', `Admin deleted user ID: ${patientId}`);
  });
};

// Delete a response
exports.deleteResponse = (req, res) => {
  const { patientId } = req.params;
  const query = 'DELETE FROM responses WHERE patient_id = ?';
  
  db.run(query, [patientId], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'No response found for that user' });
    
    res.json({ success: true });
    logAction('admin delete response', `Admin deleted response for patient ${patientId}`);
  });
};

// Add a new patient
exports.addPatient = (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  const query = 'INSERT INTO patients (email, password) VALUES (?, ?)';
  
  db.run(query, [email, password], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(400).json({ error: 'Could not add patient' });
    
    res.json({ success: true, patientId: this.lastID });
    logAction('admin add patient', `Admin added patient with email: ${email}`);
  });
};

// Get all questions
exports.getQuestions = (req, res) => {
  const query = 'SELECT id, language, question_text, options, image_url FROM questions ORDER BY id ASC';
  
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
};

// Delete a question
exports.deleteQuestion = (req, res) => {
  const { questionId } = req.params;
  const query = 'DELETE FROM questions WHERE id = ?';
  
  db.run(query, [questionId], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'Question not found' });
    
    res.json({ success: true });
    logAction('admin delete question', `Admin deleted question ${questionId}`);
  });
};

// Get all responses
exports.getResponses = (req, res) => {
  const query = `
    SELECT r.*, p.name, p.email, p.dob, p.doctor_assigned, p.health_worker, p.health_worker_type
    FROM responses r
    LEFT JOIN patients p ON r.patient_id = p.id
    ORDER BY r.id DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
};

// Update a patient's response
exports.updateResponse = (req, res) => {
  const { patientId } = req.params;
  const { responses } = req.body;
  const query = 'UPDATE responses SET responses = ? WHERE patient_id = ?';
  
  db.run(query, [JSON.stringify(responses), patientId], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
    logAction('admin update response', `Admin updated response for patient ${patientId}`);
  });
};

// Toggle editing permission
exports.toggleEdit = (req, res) => {
  const { allow_edit } = req.body;
  const query = 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)';
  
  db.run(query, ['allow_edit', allow_edit ? '1' : '0'], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    res.json({ success: true, allow_edit });
    logAction('toggle edit', `Admin set allow_edit to ${allow_edit}`);
  });
};

// Add a new question
exports.addQuestion = (req, res) => {
  const { language, question_text, options } = req.body;
  let image_url = null;
  
  if (req.file) {
    image_url = '/uploads/' + req.file.filename;
  }
  
  // Process options
  const optionArr = JSON.parse(options).map(opt => {
    const text = opt.text.trim();
    let score = 0;
    
    if (text.toLowerCase() === 'correct') {
      score = 1;
    } else if (text.toLowerCase() === 'wrong') {
      score = 0;
    } else if (!isNaN(Number(text))) {
      score = Number(text);
    }
    
    return { text, score };
  });
  
  const parsedOptions = JSON.stringify(optionArr);
  
  const query = `INSERT INTO questions (language, question_text, options, image_url)
                VALUES (?, ?, ?, ?)`;
                
  db.run(query, [language, question_text, parsedOptions, image_url], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    res.json({ success: true, questionId: this.lastID });
    logAction('add question', `Admin added question: ${question_text}`);
  });
};
