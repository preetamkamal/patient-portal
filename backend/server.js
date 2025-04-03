require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const patientRoutes = require('./routes/patientRoutes');
const questionRoutes = require('./routes/questionRoutes');

// Import middleware
const { setupUploads } = require('./middleware/upload');

const app = express();
const PORT = process.env.PORT || 5011;

// Middleware
app.use(cors());
app.use(bodyParser.json());
setupUploads(app);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/mcqs', questionRoutes);

// Settings route - could move to admin routes but keeping separate for clarity
app.use('/api/settings', require('./routes/settingsRoutes'));

// Serve frontend for any other routes (for production)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

