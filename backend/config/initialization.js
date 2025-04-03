module.exports = function initializeDatabase(db) {
  db.serialize(() => {
    // Create tables
    db.run(`CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        name TEXT,
        dob TEXT,
        doctor_assigned TEXT,
        health_worker TEXT,
        health_worker_type TEXT
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        responses TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id)
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        language TEXT,
        question_text TEXT,
        options TEXT,
        image_url TEXT
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
    )`, (err) => {
        if (!err) {
            db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('allow_edit', '1')`);
        }
    });
    
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

    // Insert default patient accounts
    const insertPatient = 'INSERT OR IGNORE INTO patients (email, password) VALUES (?,?)';
    for (let i = 1; i <= 5; i++) {
        db.run(insertPatient, [`cho${i}@example.com`, `pass${i}`]);
    }

    // Check if questions table already has data
    db.get(`SELECT COUNT(*) as count FROM questions`, (err, row) => {
        if (err) {
            console.error("Error checking questions table: " + err.message);
            return;
        }
        
        if (row.count === 0) {
            console.log("No questions found. Adding default questions...");
            require('./questionData')(db);
        } else {
            console.log("Questions table already has data. Skipping default question insertion.");
        }
    });
  });
};
