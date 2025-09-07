const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Event routes - Order matters! More specific routes should come first
router.post('/', eventController.createEvent);
router.get('/', eventController.getEvents);
router.post('/:id/register', eventController.verifyToken, eventController.registerForEvent);
router.delete('/:id/unregister', eventController.verifyToken, eventController.unregisterFromEvent);
router.get('/my-registrations', eventController.verifyToken, eventController.getStudentRegistrations);
router.get('/:id/registrations', eventController.getEventRegistrations);
router.get('/:id/attendance', eventController.getEventAttendance);
router.post('/:id/attendance', eventController.markEventAttendance);
router.get('/:id', eventController.getEventById);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

module.exports = router;
