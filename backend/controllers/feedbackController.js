const db = require('../database/db');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.substring(7);
  
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Submit feedback for an event
const submitFeedback = (req, res) => {
  const { event_id } = req.params;
  const { rating, comment } = req.body;
  const student_id = req.user.id;

  // Validate input
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  if (!comment || comment.trim().length === 0) {
    return res.status(400).json({ error: 'Comment is required' });
  }

  // Check if student was registered for this event
  db.get(
    'SELECT * FROM registrations WHERE student_id = ? AND event_id = ?',
    [student_id, event_id],
    (err, registration) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!registration) {
        return res.status(403).json({ error: 'You can only provide feedback for events you registered for' });
      }

      // Check if feedback already exists
      db.get(
        'SELECT * FROM feedback WHERE student_id = ? AND event_id = ?',
        [student_id, event_id],
        (err, existingFeedback) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          if (existingFeedback) {
            // Update existing feedback
            db.run(
              'UPDATE feedback SET rating = ?, comment = ?, submitted_at = CURRENT_TIMESTAMP WHERE student_id = ? AND event_id = ?',
              [rating, comment.trim(), student_id, event_id],
              function(err) {
                if (err) {
                  return res.status(500).json({ error: err.message });
                }
                res.json({
                  message: 'Feedback updated successfully',
                  feedback_id: existingFeedback.id,
                  rating,
                  comment: comment.trim()
                });
              }
            );
          } else {
            // Create new feedback
            db.run(
              'INSERT INTO feedback (student_id, event_id, rating, comment) VALUES (?, ?, ?, ?)',
              [student_id, event_id, rating, comment.trim()],
              function(err) {
                if (err) {
                  return res.status(500).json({ error: err.message });
                }
                res.status(201).json({
                  message: 'Feedback submitted successfully',
                  feedback_id: this.lastID,
                  rating,
                  comment: comment.trim()
                });
              }
            );
          }
        }
      );
    }
  );
};

// Get feedback for a specific event (admin use)
const getEventFeedback = (req, res) => {
  const { event_id } = req.params;

  const query = `
    SELECT 
      f.id,
      f.rating,
      f.comment,
      f.submitted_at,
      s.name as student_name,
      s.student_id,
      s.department
    FROM feedback f
    JOIN students s ON f.student_id = s.id
    WHERE f.event_id = ?
    ORDER BY f.submitted_at DESC
  `;

  db.all(query, [event_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Calculate average rating
    const totalRatings = rows.length;
    const averageRating = totalRatings > 0 
      ? (rows.reduce((sum, feedback) => sum + feedback.rating, 0) / totalRatings).toFixed(1)
      : 0;

    res.json({
      feedback: rows,
      summary: {
        total_feedback: totalRatings,
        average_rating: parseFloat(averageRating),
        rating_distribution: {
          5: rows.filter(f => f.rating === 5).length,
          4: rows.filter(f => f.rating === 4).length,
          3: rows.filter(f => f.rating === 3).length,
          2: rows.filter(f => f.rating === 2).length,
          1: rows.filter(f => f.rating === 1).length
        }
      }
    });
  });
};

// Get student's own feedback for an event
const getStudentFeedback = (req, res) => {
  const { event_id } = req.params;
  const student_id = req.user.id;

  db.get(
    'SELECT * FROM feedback WHERE student_id = ? AND event_id = ?',
    [student_id, event_id],
    (err, feedback) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!feedback) {
        return res.status(404).json({ error: 'No feedback found' });
      }

      res.json(feedback);
    }
  );
};

// Get all feedback submitted by a student
const getStudentAllFeedback = (req, res) => {
  const student_id = req.user.id;

  const query = `
    SELECT 
      f.id,
      f.rating,
      f.comment,
      f.submitted_at,
      e.title as event_title,
      e.date as event_date
    FROM feedback f
    JOIN events e ON f.event_id = e.id
    WHERE f.student_id = ?
    ORDER BY f.submitted_at DESC
  `;

  db.all(query, [student_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

module.exports = {
  submitFeedback,
  getEventFeedback,
  getStudentFeedback,
  getStudentAllFeedback,
  verifyToken
};
