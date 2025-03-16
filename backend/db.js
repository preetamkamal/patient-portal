const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const DBSOURCE = path.resolve(__dirname, "db.sqlite");

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error("Error opening database: " + err.message);
    } else {
        console.log("Connected to SQLite database");
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
                password TEXT
            )`);
            db.run(`CREATE TABLE IF NOT EXISTS responses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER,
                responses TEXT,
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
                db.run(insertPatient, [`patient${i}@example.com`, `pass${i}`]);
            }

            // Check if questions table already has data
            db.get(`SELECT COUNT(*) as count FROM questions`, (err, row) => {
                if (err) {
                    console.error("Error checking questions table: " + err.message);
                    return;
                }
                if (row.count === 0) {
                    console.log("No questions found. Adding default questions...");
                    const defaultOptions = JSON.stringify([
                        { text: "Correct", score: 1 },
                        { text: "Wrong", score: 0 }
                    ]);
        
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
                      VALUES ("hi", "1. Is it morning or afternoon or evening? यह सुबह है, दोपहर है या शाम है?", ? , NULL)`, [defaultOptions]);
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
                      VALUES ("hi", "2. What day of the week is today? आज साप्ताह का कौनसा दिन है?", ? , NULL)`, [defaultOptions]);
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
                      VALUES ("hi", "3. What date is it today? आज कौन सी तारीख है?", ? , NULL)`, [defaultOptions]);
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
                      VALUES ("hi", "4. Which month is today? आज कौन सा महीना है?", ? , NULL)`, [defaultOptions]);
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
                      VALUES ("hi", "5. What season of the year is this? यह साल का कौनसा मौसम है?", ? , NULL)`, [defaultOptions]);
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
                      VALUES ("hi", "6. Under which post office does your village come? कौन से पोस्ट ऑफीस के तहत आपका गाँव पड़ता है?", ? , NULL)`, [defaultOptions]);
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
                      VALUES ("hi", "7. Which district does your village fall under? किस जिले में आपका गाँव पड़ता है?", ? , NULL)`, [defaultOptions]);
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
                      VALUES ("hi", "8. Which village are you from? आप कौन से गाँव से हैं?", ? , NULL)`, [defaultOptions]);
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
                      VALUES ("hi", "9. Which block (If village has only blocks) OR Which numbered area is this? आपका गाँव कौन से ब्लॉक या क्षेत्र में पड़ता है?", ? , NULL)`, [defaultOptions]);
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
                      VALUES ("hi", "10. Which place is this? ये कौन सी जगह है?", ? , NULL)`, [defaultOptions]);
        
                    // For Q11 to Q18, assume options are numeric or fixed text:
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
                      VALUES ("hi", "11. (I went to Delhi and brought three things - Mango, chair, and coin) Can you tell me what are the three things I brought from Delhi? (मैं दिल्ली गया और चीजें लाया - आम, कुर्सी और सिक्का)", '[{"text": "1", "score": 1}, {"text": "2", "score": 2}, {"text": "3", "score": 3}]', NULL)`);
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
                      VALUES ("hi", "12.a Now can you tell me names of the days of the week starting from Sunday? अब आप मुझे रविवार से शुरू करते हुए साप्ताह के सभी दिनों के नाम बता सकते हैं?", '[{"text": "1", "score": 1}, {"text": "2", "score": 2}, {"text": "3", "score": 3}, {"text": "4", "score": 4}, {"text": "5", "score": 5}]', NULL)`);
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
                      VALUES ("hi", "12.b Now can you tell me names of the days backwards? अब आप उल्टी तरफ से सभी दिनों के नाम बता सकते हैं?", '[{"text": "1", "score": 1}, {"text": "2", "score": 2}, {"text": "3", "score": 3}, {"text": "4", "score": 4}, {"text": "5", "score": 5}]', NULL)`);
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
                      VALUES ("hi", "13 - 15. What are the names of the three things, which I told you have brought from Delhi? मैं दिल्ली से क्या तीन चीजें लाया था?", '[{"text": "1", "score": 1}, {"text": "2", "score": 2}, {"text": "3", "score": 3}]', NULL)`);
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
                      VALUES ("hi", "16. (Show the subject the wrist watch and pen) Can you tell me these objects? क्या आप इन वस्तुओं के नाम बता सकते हैं? (If yes, Items 17 & 18 apply) (If No, Item 17(a) apply)", '[{"text": "Correct", "score": 1}, {"text": "Wrong", "score": 0}]', NULL)`);
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
                      VALUES ("hi", "17. Show him the wrist watch and say - what is this? यह क्या है? OR", '[{"text": "Correct", "score": 1}, {"text": "Wrong", "score": 0}]', NULL)`);
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
                      VALUES ("hi", "17.a If necessary, Identification of watch by touching what is this? यह क्या है?", '[{"text": "Correct", "score": 1}, {"text": "Wrong", "score": 0}]', NULL)`);
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
                      VALUES ("hi", "18. Show him the pen and say - what is this? यह क्या है? OR", '[{"text": "Correct", "score": 1}, {"text": "Wrong", "score": 0}]', NULL)`);
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
                      VALUES ("hi", "18.a (If necessary) Identification of pen by Touching what is this? यह क्या है?", '[{"text": "Correct", "score": 1}, {"text": "Wrong", "score": 0}]', NULL)`);
        
                    const q19_text = '19. Now I am going to say something, listen carefully and repeat it exactly as I say after I finish Phrase: "NEITHER THIS NOR THAT" अब मैं कुछ कहूँगा और मेरे कहने के बाद आप उसे दोहराना : "ना तो यह और ना ही वह"';
                    const q19_options = '[{"text": "Correct", "score": 1}, {"text": "Wrong", "score": 0}]';
                    db.run('INSERT OR IGNORE INTO questions (language, question_text, options, image_url) VALUES (?, ?, ?, ?)',
                        ["hi", q19_text, q19_options, null]);
        
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
                      VALUES ("hi", "20. Now look at my face and do exactly what I do. अब मेरे चेहरे को देखो और जो मैं करूँगा वह आप भी करो Close your eyes. अपनी आखें बंद करो", '[{"text": "Correct", "score": 1}, {"text": "Wrong", "score": 0}]', NULL)`);
        
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
                      VALUES ("hi", "21. First you take the paper in your right hand, then with your both hands, fold it into half once and then give the paper back to me. पहले आप कागज़ अपने दाहिने हाथ में ले और फिर दोनों हाथों से उसे बीच में से मोड़ कर वापस करें", '[{"text": "1", "score": 1}, {"text": "2", "score": 2}, {"text": "3", "score": 3}]', NULL)`);
        
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
                      VALUES ("hi", "22. Now say a line about your house? (something specifically about your houses) अब आप अपने घर के बारे में एक वाक्य बोलिए NOT INCLUDED IN HMSE TOTAL If given -1, Not given -0.", '[{"text": "Given", "score": 1}, {"text": "Not Given", "score": 0}]', NULL)`);
        
                    // Q23 with an image. Ensure "question-23-hi.png" exists in uploads folder.
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
                      VALUES ("hi", "23. Here is a drawing, you must copy this drawing exactly as shown in the space provided here. इस चित्र को देखिए, और हूबहू इसके जैसा चित्र बनाइए", '[{"text": "Correct", "score": 1}, {"text": "Wrong", "score": 0}]', "/uploads/question-23-hi.png")`);
        
                    // Add after the Hindi questions in the db.serialize() function
        
                    // Insert default English questions (MMSE format)
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
            VALUES ("en", "1. Orientation: What is the (year) (season) (date) (day) (month)?", 
                    '[{"text": "0", "score": 0}, {"text": "1", "score": 1}, {"text": "2", "score": 2}, {"text": "3", "score": 3}, {"text": "4", "score": 4}, {"text": "5", "score": 5}]', NULL)`);
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
            VALUES ("en", "2. Orientation: Where are we (state) (country) (town) (hospital) (floor)?", 
                    '[{"text": "0", "score": 0}, {"text": "1", "score": 1}, {"text": "2", "score": 2}, {"text": "3", "score": 3}, {"text": "4", "score": 4}, {"text": "5", "score": 5}]', NULL)`);
        
        
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
            VALUES ("en", "3. Registration: 
        Name 3 objects: 1 second to say each. \n Then ask the patient
        all 3 after you have said them. Give 1 point for each correct answer.
        Then repeat them until he/she learns all 3. Count trials and record.
        Trials.", 
                    '[{"text": "0", "score": 0}, {"text": "1", "score": 1}, {"text": "2", "score": 2}, {"text": "3", "score": 3}]', NULL)`);
        
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
            VALUES ("en", "4. Attention and Calculation:
        Serial 7’s. 1 point for each correct answer. Stop after 5 answers.
        Alternatively spell “world” backward.", 
                    '[{"text": "0", "score": 0}, {"text": "1", "score": 1}, {"text": "2", "score": 2}, {"text": "3", "score": 3}, {"text": "4", "score": 4}, {"text": "5", "score": 5}]', NULL)`);
        
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
            VALUES ("en", "5. Recall: 
        Ask for the 3 objects repeated above. Give 1 point for each correct answer.", 
                     '[{"text": "0", "score": 0}, {"text": "1", "score": 1}, {"text": "2", "score": 2}, {"text": "3", "score": 3}]', NULL)`);
        
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
            VALUES ("en", "6. Language:
        Name a pencil and watch.", 
                    '[{"text": "0 correct", "score": 0}, {"text": "1 correct", "score": 1}, {"text": "2 correct", "score": 2}]', NULL)`);
        
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
            VALUES ("en", "7. Repeat the following \'No ifs, ands, or buts\'", 
                    '[{"text": "0", "score": 0}, {"text": "1", "score": 1}]', NULL)`);
        
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
            VALUES ("en", "8. Follow a 3-stage command:
        \'Take a paper in your hand, fold it in half, and put it on the floor.\'", 
                    '[{"text": "0 correct", "score": 0}, {"text": "1 correct", "score": 1}, {"text": "2 correct", "score": 2}, {"text": "3 correct", "score": 3}]', NULL)`);
        
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
            VALUES ("en", "9. Read and obey the following: CLOSE YOUR EYES", 
                    '[{"text": "0", "score": 0}, {"text": "1", "score": 1}]', NULL)`);
        
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
            VALUES ("en", "10. Write a sentence.", 
                    '[{"text": "0", "score": 0}, {"text": "1", "score": 1}]', NULL)`);
        
                    db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
            VALUES ("en", "11. Copy the design shown.", 
                    '[{"text": "0", "score": 0}, {"text": "1", "score": 1}]', "/uploads/question-21-en.png")`);
                } else {
                    console.log("Questions table already has data. Skipping default question insertion.");
                }
            });
        });
    }
});

module.exports = db;