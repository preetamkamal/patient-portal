const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const questionController = require('../controllers/questionController');

// Get questions by language
router.get('/', authenticateToken, questionController.getQuestions);

// Submit responses
router.post('/submit', authenticateToken, questionController.submitResponses);

// Update responses
router.put('/update', authenticateToken, questionController.updateResponses);

module.exports = router;
