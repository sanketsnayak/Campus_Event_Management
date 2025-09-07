const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Student feedback routes (protected)
router.post('/events/:event_id/feedback', feedbackController.verifyToken, feedbackController.submitFeedback);
router.get('/events/:event_id/my-feedback', feedbackController.verifyToken, feedbackController.getStudentFeedback);
router.get('/my-feedback', feedbackController.verifyToken, feedbackController.getStudentAllFeedback);

// Admin feedback routes
router.get('/events/:event_id/feedback', feedbackController.getEventFeedback);

module.exports = router;
