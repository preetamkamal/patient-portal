const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const { upload } = require('../middleware/upload');

// Auth routes
router.post('/login', adminController.login);

// Protected admin routes
router.get('/logs', authenticateToken, authorizeAdmin, adminController.getLogs);
router.get('/users', authenticateToken, authorizeAdmin, adminController.getUsers);
router.delete('/users/:patientId', authenticateToken, authorizeAdmin, adminController.deleteUser);
router.post('/add-patient', authenticateToken, authorizeAdmin, adminController.addPatient);
router.get('/questions', authenticateToken, authorizeAdmin, adminController.getQuestions);
router.delete('/questions/:questionId', authenticateToken, authorizeAdmin, adminController.deleteQuestion);
router.post('/add-question', authenticateToken, authorizeAdmin, upload.single('image'), adminController.addQuestion);
router.get('/responses', authenticateToken, authorizeAdmin, adminController.getResponses);
router.put('/responses/:patientId', authenticateToken, authorizeAdmin, adminController.updateResponse);
router.delete('/responses/:patientId', authenticateToken, authorizeAdmin, adminController.deleteResponse);
router.post('/toggle-edit', authenticateToken, authorizeAdmin, adminController.toggleEdit);

module.exports = router;
