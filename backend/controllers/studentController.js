const db = require('../database/db');

// Get all students
const getAllStudents = (req, res) => {
  db.all('SELECT * FROM students ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

// Get student by ID
const getStudentById = (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM students WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(row);
  });
};

// Create new student
const createStudent = (req, res) => {
  const { name, email, student_id, department, year } = req.body;
  
  if (!name || !email || !student_id || !department || !year) {
    return res.status(400).json({ 
      error: 'All fields are required: name, email, student_id, department, year' 
    });
  }
  
  db.run(
    'INSERT INTO students (name, email, student_id, department, year) VALUES (?, ?, ?, ?, ?)',
    [name, email, student_id, department, year],
    function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return res.status(400).json({ error: 'Email or Student ID already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        name,
        email,
        student_id,
        department,
        year
      });
    }
  );
};

// Update student
const updateStudent = (req, res) => {
  const { id } = req.params;
  const { name, email, student_id, department, year } = req.body;
  
  if (!name || !email || !student_id || !department || !year) {
    return res.status(400).json({ 
      error: 'All fields are required: name, email, student_id, department, year' 
    });
  }
  
  db.run(
    'UPDATE students SET name = ?, email = ?, student_id = ?, department = ?, year = ? WHERE id = ?',
    [name, email, student_id, department, year, id],
    function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return res.status(400).json({ error: 'Email or Student ID already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.json({
        id: parseInt(id),
        name,
        email,
        student_id,
        department,
        year
      });
    }
  );
};

// Delete student
const deleteStudent = (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM students WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  });
};

// Register for event
const registerForEvent = (req, res) => {
  const { eventId } = req.params;
  const { student_id } = req.body;

  if (!student_id) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  // Check if event exists
  db.get('SELECT * FROM events WHERE id = ?', [eventId], (err, event) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if already registered
    db.get('SELECT * FROM registrations WHERE student_id = ? AND event_id = ?', 
      [student_id, eventId], (err, existing) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (existing) {
        return res.status(400).json({ error: 'Already registered for this event' });
      }

      // Register student
      db.run('INSERT INTO registrations (student_id, event_id) VALUES (?, ?)', 
        [student_id, eventId], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
          message: 'Registration successful',
          registration_id: this.lastID
        });
      });
    });
  });
};

// Unregister from event
const unregisterFromEvent = (req, res) => {
  const { eventId } = req.params;
  const { student_id } = req.body;

  if (!student_id) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  // Check if registration exists
  db.get('SELECT * FROM registrations WHERE student_id = ? AND event_id = ?', 
    [student_id, eventId], (err, registration) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // Remove registration
    db.run('DELETE FROM registrations WHERE student_id = ? AND event_id = ?', 
      [student_id, eventId], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Successfully unregistered from event' });
    });
  });
};

// Mark attendance
const markAttendance = (req, res) => {
  const { eventId } = req.params;
  const { student_id, status } = req.body;

  if (!student_id || !status) {
    return res.status(400).json({ error: 'Student ID and status are required' });
  }

  if (!['present', 'absent'].includes(status)) {
    return res.status(400).json({ error: 'Status must be present or absent' });
  }

  // Check if student is registered for the event
  db.get('SELECT * FROM registrations WHERE student_id = ? AND event_id = ?', 
    [student_id, eventId], (err, registration) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!registration) {
      return res.status(400).json({ error: 'Student not registered for this event' });
    }

    // Mark attendance (replace if exists)
    db.run(`INSERT OR REPLACE INTO attendance (student_id, event_id, status) 
            VALUES (?, ?, ?)`, 
      [student_id, eventId, status], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        message: 'Attendance marked successfully',
        attendance_id: this.lastID
      });
    });
  });
};

// Submit feedback
const submitFeedback = (req, res) => {
  const { eventId } = req.params;
  const { student_id, rating, comment } = req.body;

  if (!student_id || !rating) {
    return res.status(400).json({ error: 'Student ID and rating are required' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  // Check if student attended the event
  db.get(`SELECT * FROM attendance WHERE student_id = ? AND event_id = ? AND status = 'present'`, 
    [student_id, eventId], (err, attendance) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!attendance) {
      return res.status(400).json({ error: 'Can only provide feedback for attended events' });
    }

    // Submit feedback (replace if exists)
    db.run(`INSERT OR REPLACE INTO feedback (student_id, event_id, rating, comment) 
            VALUES (?, ?, ?, ?)`, 
      [student_id, eventId, rating, comment || ''], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        message: 'Feedback submitted successfully',
        feedback_id: this.lastID
      });
    });
  });
};

// Get student's events
const getStudentEvents = (req, res) => {
  const { studentId } = req.params;

  const query = `
    SELECT 
      e.*,
      c.name as college_name,
      r.registered_at,
      a.status as attendance_status,
      f.rating,
      f.comment
    FROM events e
    JOIN colleges c ON e.college_id = c.college_id
    JOIN registrations r ON e.event_id = r.event_id
    LEFT JOIN attendance a ON e.event_id = a.event_id AND a.student_id = r.student_id
    LEFT JOIN feedback f ON e.event_id = f.event_id AND f.student_id = r.student_id
    WHERE r.student_id = ?
    ORDER BY e.date DESC
  `;

  db.all(query, [studentId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  registerForEvent,
  unregisterFromEvent,
  markAttendance,
  submitFeedback,
  getStudentEvents
};
