const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const DBSOURCE = path.resolve(__dirname, "db.sqlite");

let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error("Error opening database: " + err.message);
  } else {
    console.log("Connected to SQLite database");

    db.serialize(() => {
      // Create tables sequentially
      db.run(`CREATE TABLE IF NOT EXISTS admins (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              email TEXT UNIQUE,
              password TEXT
          )`, (err) => {
            if (err) console.error("Error creating admins table:", err);
            else console.log("Admins table created or already exists");
          });

      db.run(`CREATE TABLE IF NOT EXISTS patients (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              email TEXT UNIQUE,
              password TEXT
          )`, (err) => {
            if (err) console.error("Error creating patients table:", err);
            else console.log("Patients table created or already exists");
          });

      db.run(`CREATE TABLE IF NOT EXISTS responses (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              patient_id INTEGER,
              responses TEXT,
              FOREIGN KEY (patient_id) REFERENCES patients(id)
          )`, (err) => {
            if (err) console.error("Error creating responses table:", err);
            else console.log("Responses table created or already exists");
          });

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
