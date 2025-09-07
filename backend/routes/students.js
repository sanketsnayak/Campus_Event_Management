const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Basic CRUD routes for students
router.get('/', studentController.getAllStudents);
router.get('/:id', studentController.getStudentById);
router.post('/', studentController.createStudent);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

// Event-related student routes
router.post('/register/:eventId', studentController.registerForEvent);
router.delete('/register/:eventId', studentController.unregisterFromEvent);
router.post('/attendance/:eventId', studentController.markAttendance);
router.post('/feedback/:eventId', studentController.submitFeedback);
router.get('/:studentId/events', studentController.getStudentEvents);

module.exports = router;
