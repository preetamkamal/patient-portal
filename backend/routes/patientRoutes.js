const express = require('express');
const router = express.Router();
const { authenticateToken, authorizePatient } = require('../middleware/auth');
const patientController = require('../controllers/patientController');

// Auth routes
router.post('/login', patientController.login);

// Patient profile routes
router.get('/profile', authenticateToken, authorizePatient, patientController.getProfile);
router.post('/profile', authenticateToken, authorizePatient, patientController.updateProfile);

// Response routes
router.get('/response-status', authenticateToken, patientController.getResponseStatus);
router.get('/my-responses', authenticateToken, authorizePatient, patientController.getMyResponses);

module.exports = router;
