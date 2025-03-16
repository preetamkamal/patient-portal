// db.js
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

      // Table for questions
      db.run(`CREATE TABLE IF NOT EXISTS questions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          language TEXT,
          question_text TEXT,
          options TEXT,
          image_url TEXT
      )`);

      // Simple global settings table
      db.run(`CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
      )`, (err) => {
        // Insert default setting if not exists
        if (!err) {
          db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('allow_edit', '1')`);
        }
      });

      // Log table
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

      // Insert some default English questions
      db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
              VALUES ("en", "What is your name?", '["John", "Doe", "Smith", "Jane"]', NULL)`);
      db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
              VALUES ("en", "What is your age group?", '["20-30", "31-40", "41-50", "51+"]', NULL)`);
      
      // Insert some default Hindi questions
      db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
              VALUES ("hi", "आपका नाम क्या है?", '["राम", "श्याम", "मोहन", "सोहन"]', NULL)`);
      db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
              VALUES ("hi", "आपकी उम्र क्या है?", '["20-30", "31-40", "41-50", "51+"]', NULL)`);
    });
  }
});

module.exports = db;
