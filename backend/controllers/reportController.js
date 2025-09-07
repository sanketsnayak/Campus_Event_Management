const db = require('../database/db');

// Event popularity report
const getEventPopularity = (req, res) => {
  const query = `
    SELECT 
      e.event_id,
      e.title,
      e.type,
      e.date,
      e.location,
      c.name as college_name,
      COUNT(r.reg_id) as registration_count,
      COUNT(a.att_id) as attendance_count,
      CASE 
        WHEN COUNT(r.reg_id) > 0 
        THEN ROUND((COUNT(a.att_id) * 100.0 / COUNT(r.reg_id)), 2)
        ELSE 0 
      END as attendance_percentage,
      ROUND(AVG(f.rating), 2) as average_rating
    FROM events e
    JOIN colleges c ON e.college_id = c.college_id
    LEFT JOIN registrations r ON e.event_id = r.event_id
    LEFT JOIN attendance a ON e.event_id = a.event_id AND a.status = 'present'
    LEFT JOIN feedback f ON e.event_id = f.event_id
    GROUP BY e.event_id, e.title, e.type, e.date, e.location, c.name
    ORDER BY registration_count DESC, attendance_count DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

// Student participation report
const getStudentParticipation = (req, res) => {
  const { studentId } = req.params;

  const query = `
    SELECT 
      s.student_id,
      s.name,
      s.email,
      s.roll_no,
      c.name as college_name,
      COUNT(r.reg_id) as total_registrations,
      COUNT(a.att_id) as total_attendances,
      CASE 
        WHEN COUNT(r.reg_id) > 0 
        THEN ROUND((COUNT(a.att_id) * 100.0 / COUNT(r.reg_id)), 2)
        ELSE 0 
      END as attendance_rate,
      ROUND(AVG(f.rating), 2) as average_feedback_rating
    FROM students s
    JOIN colleges c ON s.college_id = c.college_id
    LEFT JOIN registrations r ON s.student_id = r.student_id
    LEFT JOIN attendance a ON s.student_id = a.student_id AND a.status = 'present'
    LEFT JOIN feedback f ON s.student_id = f.student_id
    WHERE s.student_id = ?
    GROUP BY s.student_id, s.name, s.email, s.roll_no, c.name
  `;

  db.get(query, [studentId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(row);
  });
};

// Top active students
const getTopStudents = (req, res) => {
  const limit = req.query.limit || 3;

  const query = `
    SELECT 
      s.student_id,
      s.name,
      s.email,
      s.roll_no,
      c.name as college_name,
      COUNT(r.reg_id) as total_registrations,
      COUNT(a.att_id) as total_attendances,
      CASE 
        WHEN COUNT(r.reg_id) > 0 
        THEN ROUND((COUNT(a.att_id) * 100.0 / COUNT(r.reg_id)), 2)
        ELSE 0 
      END as attendance_rate
    FROM students s
    JOIN colleges c ON s.college_id = c.college_id
    LEFT JOIN registrations r ON s.student_id = r.student_id
    LEFT JOIN attendance a ON s.student_id = a.student_id AND a.status = 'present'
    GROUP BY s.student_id, s.name, s.email, s.roll_no, c.name
    ORDER BY total_attendances DESC, total_registrations DESC
    LIMIT ?
  `;

  db.all(query, [limit], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

// Event detailed report
const getEventReport = (req, res) => {
  const { id } = req.params;

  const eventQuery = `
    SELECT 
      e.*,
      c.name as college_name,
      COUNT(DISTINCT r.reg_id) as total_registrations,
      COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.att_id END) as total_attendances,
      CASE 
        WHEN COUNT(DISTINCT r.reg_id) > 0 
        THEN ROUND((COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.att_id END) * 100.0 / COUNT(DISTINCT r.reg_id)), 2)
        ELSE 0 
      END as attendance_percentage,
      ROUND(AVG(f.rating), 2) as average_rating,
      COUNT(DISTINCT f.feedback_id) as feedback_count
    FROM events e
    JOIN colleges c ON e.college_id = c.college_id
    LEFT JOIN registrations r ON e.event_id = r.event_id
    LEFT JOIN attendance a ON e.event_id = a.event_id
    LEFT JOIN feedback f ON e.event_id = f.event_id
    WHERE e.event_id = ?
    GROUP BY e.event_id
  `;

  const participantsQuery = `
    SELECT 
      s.student_id,
      s.name,
      s.email,
      s.roll_no,
      r.registered_at,
      a.status as attendance_status,
      f.rating,
      f.comment
    FROM registrations r
    JOIN students s ON r.student_id = s.student_id
    LEFT JOIN attendance a ON r.student_id = a.student_id AND r.event_id = a.event_id
    LEFT JOIN feedback f ON r.student_id = f.student_id AND r.event_id = f.event_id
    WHERE r.event_id = ?
    ORDER BY r.registered_at
  `;

  db.get(eventQuery, [id], (err, eventData) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!eventData) {
      return res.status(404).json({ error: 'Event not found' });
    }

    db.all(participantsQuery, [id], (err, participants) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        event: eventData,
        participants: participants
      });
    });
  });
};

// Dashboard statistics
const getDashboardStats = (req, res) => {
  const { college_id } = req.query;

  const queries = [
    // Total events
    college_id 
      ? `SELECT COUNT(*) as count FROM events WHERE college_id = ?`
      : `SELECT COUNT(*) as count FROM events`,
    
    // Total students
    college_id
      ? `SELECT COUNT(*) as count FROM students WHERE college_id = ?`
      : `SELECT COUNT(*) as count FROM students`,
    
    // Total registrations
    college_id
      ? `SELECT COUNT(*) as count FROM registrations r JOIN events e ON r.event_id = e.event_id WHERE e.college_id = ?`
      : `SELECT COUNT(*) as count FROM registrations`,
    
    // Recent events
    college_id
      ? `SELECT e.*, c.name as college_name FROM events e JOIN colleges c ON e.college_id = c.college_id WHERE e.college_id = ? ORDER BY e.created_at DESC LIMIT 5`
      : `SELECT e.*, c.name as college_name FROM events e JOIN colleges c ON e.college_id = c.college_id ORDER BY e.created_at DESC LIMIT 5`
  ];

  const params = college_id ? [college_id, college_id, college_id, college_id] : [[], [], [], []];

  Promise.all([
    new Promise((resolve, reject) => {
      db.get(queries[0], college_id ? [college_id] : [], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    }),
    new Promise((resolve, reject) => {
      db.get(queries[1], college_id ? [college_id] : [], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    }),
    new Promise((resolve, reject) => {
      db.get(queries[2], college_id ? [college_id] : [], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    }),
    new Promise((resolve, reject) => {
      db.all(queries[3], college_id ? [college_id] : [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    })
  ])
  .then(([totalEvents, totalStudents, totalRegistrations, recentEvents]) => {
    res.json({
      totalEvents,
      totalStudents,
      totalRegistrations,
      recentEvents
    });
  })
  .catch(err => {
    res.status(500).json({ error: err.message });
  });
};

module.exports = {
  getEventPopularity,
  getStudentParticipation,
  getTopStudents,
  getEventReport,
  getDashboardStats
};
