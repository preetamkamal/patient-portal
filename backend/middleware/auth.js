const jwt = require('jsonwebtoken');
const { logAction } = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Authentication token required' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user; // Expected payload: { id, email, role }
    next();
  });
}

// Role-based authorization
function authorizeAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
}

function authorizePatient(req, res, next) {
  if (req.user.role !== 'patient') {
    return res.status(403).json({ error: 'Forbidden: Patient access required' });
  }
  next();
}

module.exports = {
  authenticateToken,
  authorizeAdmin,
  authorizePatient,
  JWT_SECRET
};
