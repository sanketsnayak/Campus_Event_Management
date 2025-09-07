const db = require('../database/db');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Create event
const createEvent = (req, res) => {
  const { title, description, date, time, location, max_participants } = req.body;

  // Validate required fields
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }
  if (!time) {
    return res.status(400).json({ error: 'Time is required' });
  }
  if (!location) {
    return res.status(400).json({ error: 'Location is required' });
  }
  if (!max_participants || isNaN(max_participants) || max_participants <= 0) {
    return res.status(400).json({ error: 'Max participants must be a positive number' });
  }

  const query = `
    INSERT INTO events (title, description, date, time, location, max_participants)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [title, description || '', date, time, location, max_participants], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      id: this.lastID,
      title,
      description: description || '',
      date,
      time,
      location,
      max_participants
    });
  });
};

// Get all events
const getEvents = (req, res) => {
  const query = `
    SELECT 
      e.*,
      COUNT(r.id) as registered_count
    FROM events e
    LEFT JOIN registrations r ON e.id = r.event_id
    GROUP BY e.id
    ORDER BY e.created_at DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

// Get event by ID
const getEventById = (req, res) => {
  const { id } = req.params;

  const query = 'SELECT * FROM events WHERE id = ?';

  db.get(query, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(row);
  });
};

// Update event
const updateEvent = (req, res) => {
  const { id } = req.params;
  const { title, description, date, time, location, max_participants } = req.body;

  if (!title || !date || !time || !location || !max_participants) {
    return res.status(400).json({ error: 'Missing required fields: title, date, time, location, max_participants' });
  }

  const query = `
    UPDATE events 
    SET title = ?, description = ?, date = ?, time = ?, location = ?, max_participants = ?
    WHERE id = ?
  `;

  db.run(query, [title, description, date, time, location, max_participants, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ 
      id: parseInt(id),
      title,
      description,
      date,
      time,
      location,
      max_participants
    });
  });
};

// Delete event
const deleteEvent = (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM events WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  });
};

// Get registrations for a specific event
const getEventRegistrations = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      r.id as registration_id,
      r.registered_at,
      s.id as student_id,
      s.name,
      s.email,
      s.student_id,
      s.department,
      s.year
    FROM registrations r
    JOIN students s ON r.student_id = s.id
    WHERE r.event_id = ?
    ORDER BY r.registered_at DESC
  `;

  db.all(query, [id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

// Register for event
const registerForEvent = (req, res) => {
  const { id } = req.params; // event_id
  const studentId = req.user.id; // from JWT token

  // First check if event exists
  db.get('SELECT * FROM events WHERE id = ?', [id], (err, event) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if student is already registered
    db.get('SELECT * FROM registrations WHERE student_id = ? AND event_id = ?', [studentId, id], (err, existingRegistration) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (existingRegistration) {
        return res.status(400).json({ error: 'You are already registered for this event' });
      }

      // Check if event is full
      db.get('SELECT COUNT(*) as count FROM registrations WHERE event_id = ?', [id], (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        if (result.count >= event.max_participants) {
          return res.status(400).json({ error: 'Event is full' });
        }

        // Register the student
        const insertQuery = 'INSERT INTO registrations (student_id, event_id) VALUES (?, ?)';
        db.run(insertQuery, [studentId, id], function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.status(201).json({ 
            message: 'Successfully registered for event',
            registration_id: this.lastID,
            event_id: id,
            student_id: studentId
          });
        });
      });
    });
  });
};

// Get student's registrations
const getStudentRegistrations = (req, res) => {
  const studentId = req.user.id; // from JWT token

  const query = `
    SELECT 
      r.id as registration_id,
      r.registered_at,
      e.id as event_id,
      e.title,
      e.description,
      e.date,
      e.time,
      e.location,
      e.max_participants
    FROM registrations r
    JOIN events e ON r.event_id = e.id
    WHERE r.student_id = ?
    ORDER BY e.date ASC
  `;

  db.all(query, [studentId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

// Unregister from event
const unregisterFromEvent = (req, res) => {
  const { id } = req.params; // event_id
  const studentId = req.user.id; // from JWT token

  // Check if student is registered for this event
  db.get('SELECT * FROM registrations WHERE student_id = ? AND event_id = ?', [studentId, id], (err, registration) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!registration) {
      return res.status(400).json({ error: 'You are not registered for this event' });
    }

    // Remove the registration
    db.run('DELETE FROM registrations WHERE student_id = ? AND event_id = ?', [studentId, id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ 
        message: 'Successfully unregistered from event',
        event_id: id,
        student_id: studentId
      });
    });
  });
};

// Get attendance for an event
const getEventAttendance = (req, res) => {
  const { id } = req.params; // event_id

  const query = `
    SELECT 
      r.student_id,
      s.student_id as student_id_string,
      s.name,
      s.email,
      s.department,
      s.year,
      r.registered_at,
      COALESCE(a.status, 'not_marked') as attendance_status,
      a.marked_at
    FROM registrations r
    JOIN students s ON r.student_id = s.id
    LEFT JOIN attendance a ON r.student_id = a.student_id AND r.event_id = a.event_id
    WHERE r.event_id = ?
    ORDER BY s.name
  `;

  db.all(query, [id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Calculate attendance statistics
    const totalRegistered = rows.length;
    const presentCount = rows.filter(row => row.attendance_status === 'present').length;
    const absentCount = rows.filter(row => row.attendance_status === 'absent').length;
    const notMarkedCount = rows.filter(row => row.attendance_status === 'not_marked').length;

    res.json({
      students: rows,
      statistics: {
        total_registered: totalRegistered,
        present: presentCount,
        absent: absentCount,
        not_marked: notMarkedCount,
        attendance_percentage: totalRegistered > 0 ? Math.round((presentCount / totalRegistered) * 100) : 0
      }
    });
  });
};

// Mark attendance for multiple students
const markEventAttendance = (req, res) => {
  const { id } = req.params; // event_id
  const { attendance_records } = req.body;

  if (!attendance_records || !Array.isArray(attendance_records)) {
    return res.status(400).json({ error: 'Attendance records array is required' });
  }

  // Validate that all records have required fields
  for (const record of attendance_records) {
    if (!record.student_id || !record.status) {
      return res.status(400).json({ error: 'Each record must have student_id and status' });
    }
    if (!['present', 'absent'].includes(record.status)) {
      return res.status(400).json({ error: 'Status must be present or absent' });
    }
  }

  // Start a transaction to mark attendance for all students
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    let completedRecords = 0;
    let errorOccurred = false;

    if (attendance_records.length === 0) {
      db.run("COMMIT");
      return res.json({ message: 'No attendance records to update' });
    }

    attendance_records.forEach((record) => {
      // Check if student is registered for the event
      db.get('SELECT * FROM registrations WHERE student_id = ? AND event_id = ?', 
        [record.student_id, id], (err, registration) => {
        if (err || !registration) {
          if (!errorOccurred) {
            errorOccurred = true;
            db.run("ROLLBACK");
            return res.status(400).json({ 
              error: `Student ${record.student_id} is not registered for this event` 
            });
          }
          return;
        }

        // Mark attendance (replace if exists)
        db.run(`INSERT OR REPLACE INTO attendance (student_id, event_id, status, marked_at) 
                VALUES (?, ?, ?, datetime('now'))`, 
          [record.student_id, id, record.status], function(err) {
          if (err && !errorOccurred) {
            errorOccurred = true;
            db.run("ROLLBACK");
            return res.status(500).json({ error: err.message });
          }

          completedRecords++;
          
          if (completedRecords === attendance_records.length && !errorOccurred) {
            db.run("COMMIT");
            res.json({
              message: 'Attendance marked successfully for all students',
              updated_count: completedRecords
            });
          }
        });
      });
    });
  });
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventRegistrations,
  registerForEvent,
  getStudentRegistrations,
  verifyToken,
  unregisterFromEvent,
  getEventAttendance,
  markEventAttendance
};
