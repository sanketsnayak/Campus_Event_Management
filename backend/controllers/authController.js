const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Student Signup
const studentSignup = async (req, res) => {
  try {
    const { name, email, password, student_id, university, department, year, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password || !student_id || !university || !department || !year) {
      return res.status(400).json({ 
        error: 'All fields are required: name, email, password, student_id, university, department, year' 
      });
    }

    // Check if student already exists
    db.get('SELECT * FROM students WHERE email = ? OR student_id = ?', [email, student_id], async (err, existingStudent) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (existingStudent) {
        return res.status(400).json({ error: 'Student with this email or student ID already exists' });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert new student
      const query = `
        INSERT INTO students (name, email, password, student_id, university, department, year, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.run(query, [name, email, hashedPassword, student_id, university, department, year, phone || null], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Generate JWT token
        const token = jwt.sign(
          { id: this.lastID, email, type: 'student' },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.status(201).json({
          message: 'Student registered successfully',
          token,
          user: {
            id: this.lastID,
            name,
            email,
            student_id,
            university,
            department,
            year,
            type: 'student'
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Student Login
const studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find student
    db.get('SELECT * FROM students WHERE email = ?', [email], async (err, student) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!student) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, student.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: student.id, email: student.email, type: 'student' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: student.id,
          name: student.name,
          email: student.email,
          student_id: student.student_id,
          university: student.university,
          department: student.department,
          year: student.year,
          type: 'student'
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin Signup
const adminSignup = async (req, res) => {
  try {
    const { username, email, password, full_name } = req.body;

    if (!username || !email || !password || !full_name) {
      return res.status(400).json({ 
        error: 'All fields are required: username, email, password, full_name' 
      });
    }

    // Check if admin already exists
    db.get('SELECT * FROM admins WHERE email = ? OR username = ?', [email, username], async (err, existingAdmin) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (existingAdmin) {
        return res.status(400).json({ error: 'Admin with this email or username already exists' });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert new admin
      const query = `
        INSERT INTO admins (username, email, password, full_name)
        VALUES (?, ?, ?, ?)
      `;

      db.run(query, [username, email, hashedPassword, full_name], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Generate JWT token
        const token = jwt.sign(
          { id: this.lastID, email, type: 'admin' },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.status(201).json({
          message: 'Admin registered successfully',
          token,
          user: {
            id: this.lastID,
            username,
            email,
            full_name,
            type: 'admin'
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find admin
    db.get('SELECT * FROM admins WHERE email = ?', [email], async (err, admin) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!admin) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: admin.id, email: admin.email, type: 'admin' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          full_name: admin.full_name,
          type: 'admin'
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  studentSignup,
  studentLogin,
  adminSignup,
  adminLogin
};
