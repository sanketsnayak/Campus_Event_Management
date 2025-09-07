const db = require('../database/db');

// Get all colleges
const getColleges = (req, res) => {
  db.all('SELECT * FROM colleges ORDER BY name', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

// Get all students
const getStudents = (req, res) => {
  const { college_id } = req.query;
  
  let query = `
    SELECT s.*, c.name as college_name
    FROM students s
    JOIN colleges c ON s.college_id = c.college_id
  `;
  
  const params = [];
  
  if (college_id) {
    query += ' WHERE s.college_id = ?';
    params.push(college_id);
  }
  
  query += ' ORDER BY s.name';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

// Get student by ID
const getStudentById = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT s.*, c.name as college_name
    FROM students s
    JOIN colleges c ON s.college_id = c.college_id
    WHERE s.student_id = ?
  `;

  db.get(query, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(row);
  });
};

// Create student
const createStudent = (req, res) => {
  const { name, email, roll_no, college_id } = req.body;

  if (!name || !email || !roll_no || !college_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `
    INSERT INTO students (name, email, roll_no, college_id)
    VALUES (?, ?, ?, ?)
  `;

  db.run(query, [name, email, roll_no, college_id], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      message: 'Student created successfully',
      student_id: this.lastID
    });
  });
};

module.exports = {
  getColleges,
  getStudents,
  getStudentById,
  createStudent
};
