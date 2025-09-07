const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'campus_events.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeTables();
  }
});

function initializeTables() {
  // Create students table with authentication fields
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      student_id TEXT NOT NULL UNIQUE,
      university TEXT NOT NULL,
      department TEXT NOT NULL,
      year INTEGER NOT NULL,
      phone TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating students table:', err);
      return;
    }
    
    // Create admins table
    db.run(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating admins table:', err);
        return;
      }
      
      // Create events table
      db.run(`
        CREATE TABLE IF NOT EXISTS events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          date DATE NOT NULL,
          time TEXT NOT NULL,
          location TEXT NOT NULL,
          max_participants INTEGER NOT NULL,
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES admins(id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating events table:', err);
          return;
        }
        
        // Create registrations table
        db.run(`
          CREATE TABLE IF NOT EXISTS registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            event_id INTEGER NOT NULL,
            registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id),
            FOREIGN KEY (event_id) REFERENCES events(id),
            UNIQUE(student_id, event_id)
          )
        `, (err) => {
          if (err) {
            console.error('Error creating registrations table:', err);
            return;
          }
          
          // Create attendance table
          db.run(`
            CREATE TABLE IF NOT EXISTS attendance (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              student_id INTEGER NOT NULL,
              event_id INTEGER NOT NULL,
              status TEXT NOT NULL CHECK(status IN ('present', 'absent')),
              marked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (student_id) REFERENCES students(id),
              FOREIGN KEY (event_id) REFERENCES events(id),
              UNIQUE(student_id, event_id)
            )
          `, (err) => {
            if (err) {
              console.error('Error creating attendance table:', err);
              return;
            }
            
            // Create feedback table
            db.run(`
              CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                event_id INTEGER NOT NULL,
                rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
                comment TEXT,
                submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id),
                FOREIGN KEY (event_id) REFERENCES events(id),
                UNIQUE(student_id, event_id)
              )
            `, (err) => {
              if (err) {
                console.error('Error creating feedback table:', err);
                return;
              }
              
              console.log('All database tables initialized successfully');
              console.log('Database is ready for authentication and real users');
            });
          });
        });
      });
    });
  });
}

module.exports = db;
