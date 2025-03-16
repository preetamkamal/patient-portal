// // server.js
// // const express = require('express');
// // const bodyParser = require('body-parser');
// // const db = require('./db');
// // const cors = require('cors');
// // const jwt = require('jsonwebtoken');
// // const app = express();
// // const PORT = process.env.PORT || 5011;
// // const JWT_SECRET = "your_secret_key";  // Change to an env variable in production

// // app.use(cors());
// // app.use(bodyParser.json());

// const express = require('express');
// const bodyParser = require('body-parser');
// const db = require('./db');
// const cors = require('cors');
// const jwt = require('jsonwebtoken');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// const uploadDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const app = express();
// const PORT = process.env.PORT || 5011;
// const JWT_SECRET = "your_secret_key";  // change for production

// app.use(cors());
// app.use(bodyParser.json());

// // Serve the "uploads" folder statically so clients can access the uploaded images
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Multer config: store files in "uploads/" with a unique filename
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     const uniqueName = Date.now() + '-' + file.originalname;
//     cb(null, uniqueName);
//   }
// });
// const upload = multer({ storage });

// // Utility logging function
// function logAction(action, details) {
//   const query = 'INSERT INTO logs (action, details) VALUES (?, ?)';
//   db.run(query, [action, details]);
// }

// // JWT middleware
// function authenticateToken(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];
//   if (!token) return res.sendStatus(401);
//   jwt.verify(token, JWT_SECRET, (err, user) => {
//     if (err) return res.sendStatus(403);
//     req.user = user;
//     next();
//   });
// }

// // Admin login endpoint (issues JWT)
// app.post('/api/admin/login', (req, res) => {
//   const { email, password } = req.body;
//   const query = 'SELECT * FROM admins WHERE email = ? AND password = ?';
//   db.get(query, [email, password], (err, row) => {
//     if (err) {
//       res.status(500).json({ error: 'Database error' });
//     } else if (row) {
//       const token = jwt.sign({ id: row.id, email: row.email, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
//       res.json({ success: true, admin: row, token });
//       logAction('admin login', `Admin ${row.email} logged in`);
//     } else {
//       res.status(401).json({ success: false, message: 'Invalid credentials' });
//     }
//   });
// });

// // Patient login endpoint (issues JWT)
// app.post('/api/patient/login', (req, res) => {
//   const { email, password } = req.body;
//   const query = 'SELECT * FROM patients WHERE email = ? AND password = ?';
//   db.get(query, [email, password], (err, row) => {
//     if (err) {
//       res.status(500).json({ error: 'Database error' });
//     } else if (row) {
//       const token = jwt.sign({ id: row.id, email: row.email, role: 'patient' }, JWT_SECRET, { expiresIn: '1h' });
//       res.json({ success: true, patient: row, token });
//       logAction('patient login', `Patient ${row.email} logged in`);
//     } else {
//       res.status(401).json({ success: false, message: 'Invalid credentials' });
//     }
//   });
// });

// // FETCH MCQs (protected - can be either patient or admin)
// app.get('/api/mcqs', authenticateToken, (req, res) => {
//   // We'll just fetch questions by language from the "questions" table
//   const lang = req.query.lang || 'en';
//   const query = 'SELECT * FROM questions WHERE language = ?';
//   db.all(query, [lang], (err, rows) => {
//     if (err) {
//       res.status(500).json({ error: 'Database error' });
//     } else {
//       // Convert options from JSON string to array
//       const mcqs = rows.map(q => ({
//         id: q.id,
//         question: q.question_text,
//         options: JSON.parse(q.options),
//         image_url: q.image_url
//       }));
//       res.json(mcqs);
//     }
//   });
// });

// // SUBMIT MCQs (patient only)
// app.post('/api/mcqs/submit', authenticateToken, (req, res) => {
//   if (req.user.role !== 'patient') {
//     return res.status(403).json({ error: 'Forbidden' });
//   }
//   const { patientId, responses } = req.body;
//   // Insert into "responses" table
//   const query = 'INSERT INTO responses (patient_id, responses) VALUES (?,?)';
//   db.run(query, [patientId, JSON.stringify(responses)], function(err) {
//     if (err) {
//       res.status(500).json({ error: 'Database error' });
//     } else {
//       logAction('submit response', `Patient ${patientId} submitted MCQs`);
//       res.json({ success: true, responseId: this.lastID });
//     }
//   });
// });

// // Example: Protected endpoint for patients to update responses (editing)
// app.put('/api/mcqs/update', authenticateToken, (req, res) => {
//   if (req.user.role !== 'patient') return res.status(403).json({ error: 'Forbidden' });
//   // Check if editing is allowed
//   db.get('SELECT value FROM settings WHERE key = ?', ['allow_edit'], (err, row) => {
//     if (err) return res.status(500).json({ error: 'Database error' });
//     const allow_edit = row ? row.value === '1' : true;
//     if(!allow_edit) return res.status(403).json({ error: 'Editing not allowed' });
    
//     const { patientId, responses } = req.body;
//     const query = 'UPDATE responses SET responses = ? WHERE patient_id = ?';
//     db.run(query, [JSON.stringify(responses), patientId], function(err) {
//       if(err) res.status(500).json({ error: 'Database error' });
//       else {
//         logAction('update response', `Patient ${patientId} updated response`);
//         res.json({ success: true });
//       }
//     });
//   });
// });

// // Endpoint for toggling edit (admin only)
// app.post('/api/admin/toggle-edit', authenticateToken, (req, res) => {
//   if(req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
//   const { allow_edit } = req.body;  // expects a boolean
//   const query = 'INSERT OR REPLACE INTO settings (key, value) VALUES (?,?)';
//   db.run(query, ['allow_edit', allow_edit ? '1' : '0'], function(err) {
//     if(err) {
//       res.status(500).json({ error: 'Database error' });
//     } else {
//       logAction('toggle edit', `Admin set allow_edit to ${allow_edit}`);
//       res.json({ success: true, allow_edit });
//     }
//   });
// });

// // Endpoint for admin to add a new question (with optional image)
// // app.post('/api/admin/add-question', authenticateToken, (req, res) => {
// //   if(req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
// //   const { language, question_text, options, image_url } = req.body;
// //   const query = 'INSERT INTO questions (language, question_text, options, image_url) VALUES (?,?,?,?)';
// //   db.run(query, [language, question_text, JSON.stringify(options), image_url || null], function(err) {
// //     if(err) {
// //       res.status(500).json({ error: 'Database error' });
// //     } else {
// //       logAction('add question', `Admin added question: ${question_text}`);
// //       res.json({ success: true, questionId: this.lastID });
// //     }
// //   });
// // });

// app.post('/api/admin/add-question', authenticateToken, upload.single('image'), (req, res) => {
//     if (req.user.role !== 'admin') {
//       return res.status(403).json({ error: 'Forbidden' });
//     }
  
//     const { language, question_text, options } = req.body;
//     let image_url = null;
  
//     // If an image was uploaded, store its path
//     if (req.file) {
//       image_url = '/uploads/' + req.file.filename; // The static path to the file
//     }
  
//     // Convert options to a JSON string if needed
//     let parsedOptions;
//     try {
//       parsedOptions = JSON.stringify(JSON.parse(options)); 
//     } catch {
//       // If "options" is already a JSON string like ["Yes","No"], just use it directly
//       parsedOptions = options;
//     }
  
//     const query = `INSERT INTO questions (language, question_text, options, image_url)
//                    VALUES (?, ?, ?, ?)`;
//     db.run(query, [language, question_text, parsedOptions, image_url], function (err) {
//       if (err) {
//         return res.status(500).json({ error: 'Database error' });
//       }
//       res.json({ success: true, questionId: this.lastID });
//     });
//   });

// // Endpoint for admin to view logs
// app.get('/api/admin/logs', authenticateToken, (req, res) => {
//   if(req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
//   const query = 'SELECT * FROM logs ORDER BY timestamp DESC';
//   db.all(query, [], (err, rows) => {
//     if(err) res.status(500).json({ error: 'Database error' });
//     else res.json(rows);
//   });
// });

// // For admin to view responses:
// app.get('/api/admin/responses', authenticateToken, (req, res) => {
//     if (req.user.role !== 'admin')
//       return res.status(403).json({ error: 'Forbidden' });
//     const query = 'SELECT * FROM responses';
//     db.all(query, [], (err, rows) => {
//       if (err) res.status(500).json({ error: 'Database error' });
//       else res.json(rows);
//     });
//   });
  
//   // For admin to update a patient’s response:
//   app.put('/api/admin/responses/:patientId', authenticateToken, (req, res) => {
//     if (req.user.role !== 'admin')
//       return res.status(403).json({ error: 'Forbidden' });
//     const { responses } = req.body;
//     const patientId = req.params.patientId;
//     const query = 'UPDATE responses SET responses = ? WHERE patient_id = ?';
//     db.run(query, [JSON.stringify(responses), patientId], function (err) {
//       if (err) res.status(500).json({ error: 'Database error' });
//       else {
//         logAction('admin update response', `Admin updated response for patient ${patientId}`);
//         res.json({ success: true });
//       }
//     });
//   });

//   app.get('/api/admin/users', authenticateToken, (req, res) => {
//     if (req.user.role !== 'admin') {
//       return res.status(403).json({ error: 'Forbidden' });
//     }
//     const query = 'SELECT id, email FROM patients';
//     db.all(query, [], (err, rows) => {
//       if (err) {
//         return res.status(500).json({ error: 'Database error' });
//       }
//       // rows is an array of { id, email }
//       res.json(rows);
//     });
//   });

//   // Endpoint for patient to view their own responses
// app.get('/api/patient/my-responses', authenticateToken, (req, res) => {
//     // Typically we'd use req.user.id from the JWT. For demo, if your user object includes an id:
//     if (req.user.role !== 'patient') {
//       return res.status(403).json({ error: 'Forbidden' });
//     }
  
//     const patientId = req.user.id; // or a hardcoded value if your token doesn't store it
//     const query = 'SELECT * FROM responses WHERE patient_id = ?';
//     db.all(query, [patientId], (err, rows) => {
//       if (err) {
//         return res.status(500).json({ error: 'Database error' });
//       }
//       res.json(rows);
//     });
//   });

//   app.get('/api/admin/questions', authenticateToken, (req, res) => {
//     if (req.user.role !== 'admin') {
//       return res.status(403).json({ error: 'Forbidden' });
//     }
//     const query = 'SELECT id, language, question_text, options, image_url FROM questions';
//     db.all(query, [], (err, rows) => {
//       if (err) {
//         return res.status(500).json({ error: 'Database error' });
//       }
//       res.json(rows);
//     });
//   });


//   app.delete('/api/admin/questions/:questionId', authenticateToken, (req, res) => {
//     if (req.user.role !== 'admin') {
//       return res.status(403).json({ error: 'Forbidden' });
//     }
//     const { questionId } = req.params;
//     const query = 'DELETE FROM questions WHERE id = ?';
//     db.run(query, [questionId], function (err) {
//       if (err) {
//         return res.status(500).json({ error: 'Database error' });
//       }
//       if (this.changes === 0) {
//         return res.status(404).json({ error: 'Question not found' });
//       }
//       res.json({ success: true });
//     });
//   });
  

//   app.get('/api/patient/response-status', authenticateToken, (req, res) => {
//     // Optionally, check if user is 'patient' or if admin can also fetch
//     // if (req.user.role !== 'patient') {
//     //   return res.status(403).json({ error: 'Forbidden' });
//     // }
  
//     const { patientId } = req.query;
//     if (!patientId) {
//       return res.status(400).json({ error: 'Missing patientId' });
//     }
  
//     // 1) Check if a response exists
//     const responseQuery = 'SELECT responses FROM responses WHERE patient_id = ?';
//     db.get(responseQuery, [patientId], (err, row) => {
//       if (err) {
//         return res.status(500).json({ error: 'Database error' });
//       }
//       const submitted = !!row;
//       let parsedResponses = {};
//       if (row) {
//         try {
//           parsedResponses = JSON.parse(row.responses);
//         } catch (err) {
//           // fallback if JSON parse fails
//         }
//       }
  
//       // 2) Check if editing is allowed (from settings)
//       const settingsQuery = 'SELECT value FROM settings WHERE key = ?';
//       db.get(settingsQuery, ['allow_edit'], (err2, settingRow) => {
//         if (err2) {
//           return res.status(500).json({ error: 'Database error' });
//         }
//         const canEdit = settingRow ? settingRow.value === '1' : false;
  
//         res.json({
//           submitted,
//           responses: parsedResponses,
//           canEdit
//         });
//       });
//     });
//   });
  
  
  
  
//   // For admin to delete a user:
//   app.delete('/api/admin/users/:patientId', authenticateToken, (req, res) => {
//     if (req.user.role !== 'admin')
//       return res.status(403).json({ error: 'Forbidden' });
//     const patientId = req.params.patientId;
//     const query = 'DELETE FROM patients WHERE id = ?';
//     db.run(query, [patientId], function (err) {
//       if (err) res.status(500).json({ error: 'Database error' });
//       else {
//         logAction('admin delete user', `Admin deleted user ${patientId}`);
//         res.json({ success: true });
//       }
//     });
//   });
  

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });




// server.js
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
const JWT_SECRET = "your_secret_key";  // Change this in production

app.use(cors());
app.use(bodyParser.json());

// Ensure uploads folder exists (already done in db.js, but added here for safety)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.get('/api/admin/questions', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const query = 'SELECT id, language, question_text, options, image_url FROM questions';
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
  let parsedOptions;
  try {
    parsedOptions = JSON.stringify(JSON.parse(options));
  } catch {
    parsedOptions = options;
  }
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

// POST /api/mcqs/submit – patient submits responses. Only one submission allowed.
app.post('/api/mcqs/submit', authenticateToken, (req, res) => {
  if (req.user.role !== 'patient') return res.status(403).json({ error: 'Forbidden' });
  const patientId = req.user.id;
  const { responses } = req.body;
  const checkQuery = 'SELECT * FROM responses WHERE patient_id = ?';
  db.get(checkQuery, [patientId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (row) {
      return res.status(400).json({ error: 'Response already submitted' });
    }
    const query = 'INSERT INTO responses (patient_id, responses) VALUES (?, ?)';
    db.run(query, [patientId, JSON.stringify(responses)], function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ success: true, responseId: this.lastID });
      logAction('submit response', `Patient ${patientId} submitted MCQs`);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
