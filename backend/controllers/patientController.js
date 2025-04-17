const db = require('../config/db');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const { logAction } = require('../utils/logger');

// Patient login
exports.login = (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM patients WHERE email = ? AND password = ?';
  
  db.get(query, [email, password], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    if (row) {
      const token = jwt.sign(
        { id: row.id, email: row.email, role: 'patient' }, 
        JWT_SECRET, 
        { expiresIn: '1h' }
      );
      
      res.json({ 
        success: true, 
        patient: {
          id: row.id,
          email: row.email,
          name: row.name,
          dob: row.dob,
          doctorAssigned: row.doctor_assigned,
          healthWorker: row.health_worker,
          healthWorkerType: row.health_worker_type,
          phoneNumber: row.phone_number,
          testLocation: row.test_location,
          uid: row.uid
        }, 
        token 
      });
      
      logAction('patient login', `Patient ${row.email} logged in`);
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
};

// Get patient profile
exports.getProfile = (req, res) => {
  const patientId = req.user.id;
  const query = 'SELECT id, email, name, dob, doctor_assigned, health_worker, health_worker_type, phone_number, test_location, uid FROM patients WHERE id = ?';
  
  db.get(query, [patientId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Patient not found' });
    
    res.json({ 
      success: true, 
      profile: row 
    });
  });
};

// Update patient profile
exports.updateProfile = (req, res) => {
  const patientId = req.user.id;
  const { name, dob, doctorAssigned, healthWorker, healthWorkerType, phoneNumber, testLocation, uid } = req.body;
  
  const query = `UPDATE patients SET 
    name = ?, 
    dob = ?, 
    doctor_assigned = ?, 
    health_worker = ?, 
    health_worker_type = ?,
    phone_number = ?,
    test_location = ?,
    uid = ?
    WHERE id = ?`;
  
  db.run(query, [name, dob, doctorAssigned, healthWorker, healthWorkerType, phoneNumber, testLocation, uid, patientId], function(err) {
    if (err) return res.status(500).json({ error: 'Database error: ' + err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Patient not found or no changes made' });
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully' 
    });
    
    logAction('patient profile update', `Patient ${patientId} updated their profile`);
  });
};

// Get response status
exports.getResponseStatus = (req, res) => {
  const { patientId } = req.query;
  if (!patientId) return res.status(400).json({ error: 'Missing patientId' });

  // Get the most recent submission for that patient
  const responseQuery = 'SELECT responses FROM responses WHERE patient_id = ? ORDER BY id DESC LIMIT 1';
  
  db.get(responseQuery, [patientId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    const submitted = !!row;
    let parsedResponses = {};
    
    if (row) {
      try {
        parsedResponses = JSON.parse(row.responses);
      } catch (err) {
        console.error(err);
      }
    }

    // Check if editing is allowed
    db.get('SELECT value FROM settings WHERE key = ?', ['allow_edit'], (err2, settingRow) => {
      if (err2) return res.status(500).json({ error: 'Database error' });
      
      const canEdit = settingRow ? settingRow.value === '1' : false;
      res.json({
        submitted,
        responses: parsedResponses,
        canEdit,
      });
    });
  });
};

// Get patient's responses
exports.getMyResponses = (req, res) => {
  const patientId = req.user.id;
  const query = 'SELECT * FROM responses WHERE patient_id = ?';
  
  db.all(query, [patientId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
};
