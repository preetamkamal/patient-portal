// // db.js
// const path = require('path');
// const sqlite3 = require('sqlite3').verbose();
// const DBSOURCE = path.resolve(__dirname, "db.sqlite");

// let db = new sqlite3.Database(DBSOURCE, (err) => {
//   if (err) {
//     console.error("Error opening database: " + err.message);
//   } else {
//     console.log("Connected to SQLite database");
//     db.serialize(() => {
//       // Core tables
//       db.run(`CREATE TABLE IF NOT EXISTS admins (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           email TEXT UNIQUE,
//           password TEXT
//       )`);
//       db.run(`CREATE TABLE IF NOT EXISTS patients (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           email TEXT UNIQUE,
//           password TEXT
//       )`);
//       db.run(`CREATE TABLE IF NOT EXISTS responses (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           patient_id INTEGER,
//           responses TEXT,
//           FOREIGN KEY (patient_id) REFERENCES patients(id)
//       )`);

//       // Table for questions
//       db.run(`CREATE TABLE IF NOT EXISTS questions (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           language TEXT,
//           question_text TEXT,
//           options TEXT,
//           image_url TEXT
//       )`);

//       // Simple global settings table
//       db.run(`CREATE TABLE IF NOT EXISTS settings (
//           key TEXT PRIMARY KEY,
//           value TEXT
//       )`, (err) => {
//         // Insert default setting if not exists
//         if (!err) {
//           db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('allow_edit', '1')`);
//         }
//       });

//       // Log table
//       db.run(`CREATE TABLE IF NOT EXISTS logs (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
//           action TEXT,
//           details TEXT
//       )`);

//       // Insert default admin accounts
//       const insertAdmin = 'INSERT OR IGNORE INTO admins (email, password) VALUES (?,?)';
//       db.run(insertAdmin, ["admin1@example.com", "admin123"]);
//       db.run(insertAdmin, ["admin2@example.com", "admin123"]);

//       // Insert 5 random patient accounts
//       const insertPatient = 'INSERT OR IGNORE INTO patients (email, password) VALUES (?,?)';
//       for (let i = 1; i <= 5; i++) {
//         db.run(insertPatient, [`patient${i}@example.com`, `pass${i}`]);
//       }

//       // Insert some default English questions
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
//               VALUES ("en", "What is your name?", '["John", "Doe", "Smith", "Jane"]', NULL)`);
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
//               VALUES ("en", "What is your age group?", '["20-30", "31-40", "41-50", "51+"]', NULL)`);
      
//       // Insert some default Hindi questions
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
//               VALUES ("hi", "आपका नाम क्या है?", '["राम", "श्याम", "मोहन", "सोहन"]', NULL)`);
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
//               VALUES ("hi", "आपकी उम्र क्या है?", '["20-30", "31-40", "41-50", "51+"]', NULL)`);
//     });
//   }
// });

// module.exports = db;








// // db.js
// const path = require('path');
// const sqlite3 = require('sqlite3').verbose();
// const DBSOURCE = path.resolve(__dirname, "db.sqlite");
// const fs = require('fs');

// // Ensure the uploads directory exists
// const uploadDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// let db = new sqlite3.Database(DBSOURCE, (err) => {
//   if (err) {
//     console.error("Error opening database: " + err.message);
//   } else {
//     console.log("Connected to SQLite database");
//     db.serialize(() => {
//       // Create tables
//       db.run(`CREATE TABLE IF NOT EXISTS admins (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           email TEXT UNIQUE,
//           password TEXT
//       )`);
//       db.run(`CREATE TABLE IF NOT EXISTS patients (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           email TEXT UNIQUE,
//           password TEXT
//       )`);
//       db.run(`CREATE TABLE IF NOT EXISTS responses (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           patient_id INTEGER,
//           responses TEXT,
//           FOREIGN KEY (patient_id) REFERENCES patients(id)
//       )`);
//       db.run(`CREATE TABLE IF NOT EXISTS questions (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           language TEXT,
//           question_text TEXT,
//           options TEXT,
//           image_url TEXT
//       )`);
//       db.run(`CREATE TABLE IF NOT EXISTS settings (
//           key TEXT PRIMARY KEY,
//           value TEXT
//       )`, (err) => {
//           if (!err) {
//             db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('allow_edit', '1')`);
//           }
//       });
//       db.run(`CREATE TABLE IF NOT EXISTS logs (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
//           action TEXT,
//           details TEXT
//       )`);

//       // Insert default admin accounts
//       const insertAdmin = 'INSERT OR IGNORE INTO admins (email, password) VALUES (?,?)';
//       db.run(insertAdmin, ["admin1@example.com", "admin123"]);
//       db.run(insertAdmin, ["admin2@example.com", "admin123"]);

//       // Insert default patient accounts
//       const insertPatient = 'INSERT OR IGNORE INTO patients (email, password) VALUES (?,?)';
//       for (let i = 1; i <= 5; i++) {
//         db.run(insertPatient, [`patient${i}@example.com`, `pass${i}`]);
//       }

//       // Insert default questions (both English and Hindi)
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
//               VALUES ("en", "What is your name?", '["John", "Doe", "Smith", "Jane"]', NULL)`);
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
//               VALUES ("en", "What is your age group?", '["20-30", "31-40", "41-50", "51+"]', NULL)`);
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
//               VALUES ("hi", "आपका नाम क्या है?", '["राम", "श्याम", "मोहन", "सोहन"]', NULL)`);
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
//               VALUES ("hi", "आपकी उम्र क्या है?", '["20-30", "31-40", "41-50", "51+"]', NULL)`);
//     });
//   }
// });

// module.exports = db;










// // db.js
// const path = require('path');
// const sqlite3 = require('sqlite3').verbose();
// const fs = require('fs');

// const DBSOURCE = path.resolve(__dirname, "db.sqlite");

// // Ensure the uploads directory exists
// const uploadDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// let db = new sqlite3.Database(DBSOURCE, (err) => {
//   if (err) {
//     console.error("Error opening database: " + err.message);
//   } else {
//     console.log("Connected to SQLite database");
//     db.serialize(() => {
//       // Create tables
//       db.run(`CREATE TABLE IF NOT EXISTS admins (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           email TEXT UNIQUE,
//           password TEXT
//       )`);
//       db.run(`CREATE TABLE IF NOT EXISTS patients (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           email TEXT UNIQUE,
//           password TEXT
//       )`);
//       db.run(`CREATE TABLE IF NOT EXISTS responses (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           patient_id INTEGER,
//           responses TEXT,
//           FOREIGN KEY (patient_id) REFERENCES patients(id)
//       )`);
//       db.run(`CREATE TABLE IF NOT EXISTS questions (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           language TEXT,
//           question_text TEXT,
//           options TEXT,
//           image_url TEXT
//       )`);
//       db.run(`CREATE TABLE IF NOT EXISTS settings (
//           key TEXT PRIMARY KEY,
//           value TEXT
//       )`, (err) => {
//           if (!err) {
//             db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('allow_edit', '1')`);
//           }
//       });
//       db.run(`CREATE TABLE IF NOT EXISTS logs (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
//           action TEXT,
//           details TEXT
//       )`);

//       // Insert default admin accounts
//       const insertAdmin = 'INSERT OR IGNORE INTO admins (email, password) VALUES (?,?)';
//       db.run(insertAdmin, ["admin1@example.com", "admin123"]);
//       db.run(insertAdmin, ["admin2@example.com", "admin123"]);

//       // Insert default patient accounts
//       const insertPatient = 'INSERT OR IGNORE INTO patients (email, password) VALUES (?,?)';
//       for (let i = 1; i <= 5; i++) {
//         db.run(insertPatient, [`patient${i}@example.com`, `pass${i}`]);
//       }

//       // Insert default Hindi questions according to the provided list

//       // Q1
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
//               VALUES ("hi", "Is it morning or afternoon or evening? यह सुबह है, दोपहर है या शाम है?", '["Correct (1)","Wrong (0)"]', NULL)`);
//       // Q2
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
//               VALUES ("hi", "What day of the week is today? आज साप्ताह का कौनसा दिन है?", '["Correct (1)","Wrong (0)"]', NULL)`);
//       // Q3
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
//               VALUES ("hi", "What date is it today? आज कौन सी तारीख है?", '["Correct (1)","Wrong (0)"]', NULL)`);
//       // Q4
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
//               VALUES ("hi", "Which month is today? आज कौन सा महीना है?", '["Correct (1)","Wrong (0)"]', NULL)`);
//       // Q5
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
//               VALUES ("hi", "What season of the year is this? यह साल का कौनसा मौसम है?", '["Correct (1)","Wrong (0)"]', NULL)`);
//       // Q6
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
//               VALUES ("hi", "Under which post office does your village come? कौन से पोस्ट ऑफीस के तहत आपका गाँव पड़ता है?", '["Correct (1)","Wrong (0)"]', NULL)`);
//       // Q7
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
//               VALUES ("hi", "Which district does your village fall under? किस जिले में आपका गाँव पड़ता है?", '["Correct (1)","Wrong (0)"]', NULL)`);
//       // Q8
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
//               VALUES ("hi", "Which village are you from? आप कौन से गाँव से हैं?", '["Correct (1)","Wrong (0)"]', NULL)`);
//       // Q9
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
//               VALUES ("hi", "Which block (If village has only blocks) OR Which numbered area is this? आपका गाँव कौन से ब्लॉक या क्षेत्र में पड़ता है?", '["Correct (1)","Wrong (0)"]', NULL)`);
//       // Q10
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
//               VALUES ("hi", "Which place is this? ये कौन सी जगह है?", '["Correct (1)","Wrong (0)"]', NULL)`);
//       // Q11
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
//               VALUES ("hi", "(I went to Delhi and brought three things - Mango, chair, and coin) Can you tell me what are the three things I brought from Delhi? (मैं दिल्ली गया और चीजें लाया - आम, कुर्सी और सिक्का)", '["1","2","3"]', NULL)`);
//       // Q12.a
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
//               VALUES ("hi", "Now can you tell me names of the days of the week starting from Sunday? अब आप मुझे रविवार से शुरू करते हुए साप्ताह के सभी दिनों के नाम बता सकते हैं?", '["1","2","3","4","5"]', NULL)`);
//       // Q12.b
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
//               VALUES ("hi", "Now can you tell me names of the days backwards? अब आप उल्टी तरफ से सभी दिनों के नाम बता सकते हैं?", '["1","2","3","4","5"]', NULL)`);
//       // Q13 (covers questions 13-15)
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
//               VALUES ("hi", "What are the names of the three things, which I told you have brought from Delhi? मैं दिल्ली से क्या तीन चीजें लाया था?", '["1","2","3"]', NULL)`);
//       // Q16
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
//               VALUES ("hi", "(Show the subject the wrist watch and pen) Can you tell me these objects? क्या आप इन वस्तुओं के नाम बता सकते हैं? (If yes, Items 17 & 18 apply) (If No, Item 17(a) apply)", '["Correct (1)","Wrong (0)"]', NULL)`);
//       // Q17
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
//               VALUES ("hi", "Show him the wrist watch and say - what is this? यह क्या है? OR", '["Correct (1)","Wrong (0)"]', NULL)`);
//       // Q17a
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
//               VALUES ("hi", "If necessary, Identification of watch by touching what is this? यह क्या है?", '["Correct (1)","Wrong (0)"]', NULL)`);
//       // Q18
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
//               VALUES ("hi", "Show him the pen and say - what is this? यह क्या है? OR", '["Correct (1)","Wrong (0)"]', NULL)`);
//       // Q18a
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
//               VALUES ("hi", "(If necessary) Identification of pen by Touching what is this? यह क्या है?", '["Correct (1)","Wrong (0)"]', NULL)`);
//       // Q19
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
//               VALUES ("hi", "Now I am going to say something, listen carefully and repeat it exactly as I say after I finish Phrase: \"NEITHER THIS NOR THAT\" अब मैं कुछ कहूँगा और मेरे कहने के बाद आप उसे दोहराना : \"ना तो यह और ना ही वह\"", '["Correct (1)","Wrong (0)"]', NULL)`);
//       // Q20
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
//               VALUES ("hi", "Now look at my face and do exactly what I do. अब मेरे चेहरे को देखो और जो मैं करूँगा वह आप भी करो Close your eyes. अपनी आखें बंद करो", '["Correct (1)","Wrong (0)"]', NULL)`);
//       // Q21
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
//               VALUES ("hi", "First you take the paper in your right hand, then with your both hands, fold it into half once and then give the paper back to me. पहले आप कागज़ अपने दाहिने हाथ में ले और फिर दोनों हाथों से उसे बीच में से मोड़ कर वापस करें", '["1","2","3"]', NULL)`);
//       // Q22
//       db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
//               VALUES ("hi", "Now say a line about your house? (something specifically about your houses) अब आप अपने घर के बारे में एक वाक्य बोलिए NOT INCLUDED IN HMSE TOTAL If given -1, Not given -0.", '["Given (1)","Not Given (0)"]', NULL)`);
//       // Q23
//     //   db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
//     //           VALUES ("hi", "Here is a drawing, you must copy this drawing exactly as shown in the space provided here. इस चित्र को देखिए, और हूबहू इसके जैसा चित्र बनाइए", '["Correct (1)","Wrong (0)"]', NULL)`);
//     db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
//         VALUES (
//           "hi",
//           "Here is a drawing, you must copy this drawing exactly as shown in the space provided here. इस चित्र को देखिए, और हूबहू इसके जैसा चित्र बनाइए",
//           '["Correct (1)","Wrong (0)"]',
//           "/uploads/question-23-hi.png"
//         )`);    

// });
//   }
// });

// module.exports = db;




// db.js
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

      // Insert default Hindi questions according to your list
      // Q1
      db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
              VALUES ("hi", "1. Is it morning or afternoon or evening? यह सुबह है, दोपहर है या शाम है?", '["Correct (1)","Wrong (0)"]', NULL)`);
      // Q2
      db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
              VALUES ("hi", "2. What day of the week is today? आज साप्ताह का कौनसा दिन है?", '["Correct (1)","Wrong (0)"]', NULL)`);
      // Q3
      db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
              VALUES ("hi", "3. What date is it today? आज कौन सी तारीख है?", '["Correct (1)","Wrong (0)"]', NULL)`);
      // Q4
      db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
              VALUES ("hi", "4. Which month is today? आज कौन सा महीना है?", '["Correct (1)","Wrong (0)"]', NULL)`);
      // Q5
      db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
              VALUES ("hi", "5. What season of the year is this? यह साल का कौनसा मौसम है?", '["Correct (1)","Wrong (0)"]', NULL)`);
      // Q6
      db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
              VALUES ("hi", "6. Under which post office does your village come? कौन से पोस्ट ऑफीस के तहत आपका गाँव पड़ता है?", '["Correct (1)","Wrong (0)"]', NULL)`);
      // Q7
      db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
              VALUES ("hi", "7. Which district does your village fall under? किस जिले में आपका गाँव पड़ता है?", '["Correct (1)","Wrong (0)"]', NULL)`);
      // Q8
      db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
              VALUES ("hi", "8. Which village are you from? आप कौन से गाँव से हैं?", '["Correct (1)","Wrong (0)"]', NULL)`);
      // Q9
      db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
              VALUES ("hi", "9. Which block (If village has only blocks) OR Which numbered area is this? आपका गाँव कौन से ब्लॉक या क्षेत्र में पड़ता है?", '["Correct (1)","Wrong (0)"]', NULL)`);
      // Q10
      db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
              VALUES ("hi", "10. Which place is this? ये कौन सी जगह है?", '["Correct (1)","Wrong (0)"]', NULL)`);
      // Q11
      db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
              VALUES ("hi", "11. (I went to Delhi and brought three things - Mango, chair, and coin) Can you tell me what are the three things I brought from Delhi? (मैं दिल्ली गया और चीजें लाया - आम, कुर्सी और सिक्का)", '["1","2","3"]', NULL)`);
      // Q12.a
      db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
              VALUES ("hi", "12.a Now can you tell me names of the days of the week starting from Sunday? अब आप मुझे रविवार से शुरू करते हुए साप्ताह के सभी दिनों के नाम बता सकते हैं?", '["1","2","3","4","5"]', NULL)`);
      // Q12.b
      db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
              VALUES ("hi", "12.b Now can you tell me names of the days backwards? अब आप उल्टी तरफ से सभी दिनों के नाम बता सकते हैं?", '["1","2","3","4","5"]', NULL)`);
      // Q13 (covers Q13 to Q15)
      db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
              VALUES ("hi", "13 - 15. What are the names of the three things, which I told you have brought from Delhi? मैं दिल्ली से क्या तीन चीजें लाया था?", '["1","2","3"]', NULL)`);
      // Q16
      db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
              VALUES ("hi", "16. (Show the subject the wrist watch and pen) Can you tell me these objects? क्या आप इन वस्तुओं के नाम बता सकते हैं? (If yes, Items 17 & 18 apply) (If No, Item 17(a) apply)", '["Correct (1)","Wrong (0)"]', NULL)`);
      // Q17
      db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
              VALUES ("hi", "17. Show him the wrist watch and say - what is this? यह क्या है? OR", '["Correct (1)","Wrong (0)"]', NULL)`);
      // Q17a
      db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
              VALUES ("hi", "17.a If necessary, Identification of watch by touching what is this? यह क्या है?", '["Correct (1)","Wrong (0)"]', NULL)`);
      // Q18
      db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
              VALUES ("hi", "18. Show him the pen and say - what is this? यह क्या है? OR", '["Correct (1)","Wrong (0)"]', NULL)`);
      // Q18a
      db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url) 
              VALUES ("hi", "18.a (If necessary) Identification of pen by Touching what is this? यह क्या है?", '["Correct (1)","Wrong (0)"]', NULL)`);
      // Q19 - Use parameterized query to avoid quote issues.
      const q19_text = '19. Now I am going to say something, listen carefully and repeat it exactly as I say after I finish Phrase: "NEITHER THIS NOR THAT" अब मैं कुछ कहूँगा और मेरे कहने के बाद आप उसे दोहराना : "ना तो यह और ना ही वह"';
      const q19_options = '["Correct (1)","Wrong (0)"]';
      db.run('INSERT OR IGNORE INTO questions (language, question_text, options, image_url) VALUES (?, ?, ?, ?)',
             ["hi", q19_text, q19_options, null]);

      // Q20
      db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
              VALUES ("hi", "20. Now look at my face and do exactly what I do. अब मेरे चेहरे को देखो और जो मैं करूँगा वह आप भी करो Close your eyes. अपनी आखें बंद करो", '["Correct (1)","Wrong (0)"]', NULL)`);
      // Q21
      db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
              VALUES ("hi", "21. First you take the paper in your right hand, then with your both hands, fold it into half once and then give the paper back to me. पहले आप कागज़ अपने दाहिने हाथ में ले और फिर दोनों हाथों से उसे बीच में से मोड़ कर वापस करें", '["1","2","3"]', NULL)`);
      // Q22
      db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
              VALUES ("hi", "22. Now say a line about your house? (something specifically about your houses) अब आप अपने घर के बारे में एक वाक्य बोलिए NOT INCLUDED IN HMSE TOTAL If given -1, Not given -0.", '["Given (1)","Not Given (0)"]', NULL)`);
      // Q23 - with an image. Make sure the file "default-drawing.png" exists in the uploads directory.
      db.run(`INSERT OR IGNORE INTO questions (language, question_text, options, image_url)
              VALUES ("hi", "23. Here is a drawing, you must copy this drawing exactly as shown in the space provided here. इस चित्र को देखिए, और हूबहू इसके जैसा चित्र बनाइए", '["Correct (1)","Wrong (0)"]', "/uploads/question-23-hi.png")`);
    });
  }
});

module.exports = db;
