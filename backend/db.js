const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const DBSOURCE = path.resolve(__dirname, "db.sqlite");

let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error("Error opening database: " + err.message);
  } else {
    console.log("Connected to SQLite database");
    db.serialize(() => {
      // Core tables
      db.run(`CREATE TABLE IF NOT EXISTS admins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE,
          password TEXT
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS patients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE,
          password TEXT
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS responses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          patient_id INTEGER,
          responses TEXT,
          FOREIGN KEY (patient_id) REFERENCES patients(id)
      )`);

      // New table for questions (each question can include an optional image)
      db.run(`CREATE TABLE IF NOT EXISTS questions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          language TEXT,
          question_text TEXT,
          options TEXT,   -- Stored as a JSON string
          image_url TEXT
      )`);

      // Simple global settings table (e.g. to enable/disable edit)
      db.run(`CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
      )`, (err) => {
          // Insert default setting if not exists
          if (!err) {
            db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('allow_edit', '1')`);
          }
      });

      // Log table to record changes
      db.run(`CREATE TABLE IF NOT EXISTS logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          action TEXT,
          details TEXT
      )`);

      // Insert default admin accounts
      const insertAdmin = 'INSERT OR IGNORE INTO admins (email, password) VALUES (?,?)';
      db.run(insertAdmin, ["admin1@example.com", "admin123"]);
      db.run(insertAdmin, ["admin2@example.com", "admin123"]);

      // Insert 5 random patient accounts
      const insertPatient = 'INSERT OR IGNORE INTO patients (email, password) VALUES (?,?)';
      for (let i = 1; i <= 5; i++) {
        db.run(insertPatient, [`patient${i}@example.com`, `pass${i}`]);
      }
    });
  }
});

module.exports = db;
