const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const DBSOURCE = path.resolve(__dirname, "../db.sqlite");

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error("Error opening database: " + err.message);
    } else {
        console.log("Connected to SQLite database");
        // Database initialization code moved to initialization.js
        require('./initialization')(db);
    }
});

module.exports = db;
