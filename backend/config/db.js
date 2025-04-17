const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Use a data directory that's outside the deployment path for persistence
// Default to the original path if DATA_DIR is not set
const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '..');
const DB_FILENAME = process.env.DB_FILENAME || 'db.sqlite';

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DBSOURCE = path.resolve(DATA_DIR, DB_FILENAME);
console.log(`Using database at ${DBSOURCE}`);

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Track if this is a fresh database (newly created)
const dbExists = fs.existsSync(DBSOURCE);

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error("Error opening database: " + err.message);
    } else {
        console.log("Connected to SQLite database");
        // Only pass initialization flag if database is newly created
        require('./initialization')(db, !dbExists);
    }
});

module.exports = db;
