const db = require('../config/db');
const { logAction } = require('../utils/logger');

// Get questions based on language
exports.getQuestions = (req, res) => {
  const lang = req.query.lang || 'en';
  
  const query = `
    SELECT * FROM questions 
    WHERE language = ? 
    ORDER BY CAST(
      SUBSTR(question_text, 1, INSTR(question_text, '.') - 1) 
      AS INTEGER
    ) ASC
  `;
  
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
};

// Submit responses
exports.submitResponses = (req, res) => {
  if (req.user.role !== 'patient') return res.status(403).json({ error: 'Forbidden' });
  
  const patientId = req.user.id;
  const { responses, patientInfo } = req.body;
  
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
          const options = JSON.parse(qRow.options);
          const selected = options.find(opt => opt.text === responses[qid]);
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
          maxScore: totalMaxScore,
          patientInfo: patientInfo
        };
        
        const insertQuery = 'INSERT INTO responses (patient_id, responses) VALUES (?, ?)';
        
        db.run(insertQuery, [patientId, JSON.stringify(result)], function(err) {
          if (err) return res.status(500).json({ error: 'Database error' });
          
          res.json({ 
            success: true, 
            responseId: this.lastID, 
            score: totalScore, 
            maxScore: totalMaxScore 
          });
          
          logAction('submit response', `Patient ${patientId} submitted responses`);
        });
      }
    });
  });
};

// Update responses
exports.updateResponses = (req, res) => {
  if (req.user.role !== 'patient') return res.status(403).json({ error: 'Forbidden' });
  
  // Check if editing is allowed
  db.get('SELECT value FROM settings WHERE key = ?', ['allow_edit'], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    const allow_edit = row ? row.value === '1' : true;
    if(!allow_edit) return res.status(403).json({ error: 'Editing not allowed' });
    
    const { patientId, responses } = req.body;
    const query = 'UPDATE responses SET responses = ? WHERE patient_id = ?';
    
    db.run(query, [JSON.stringify(responses), patientId], function(err) {
      if(err) return res.status(500).json({ error: 'Database error' });
      
      logAction('update response', `Patient ${patientId} updated response`);
      res.json({ success: true });
    });
  });
};
