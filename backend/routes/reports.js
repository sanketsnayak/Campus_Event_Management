const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Report routes
router.get('/popularity', reportController.getEventPopularity);
router.get('/student/:studentId', reportController.getStudentParticipation);
router.get('/top-students', reportController.getTopStudents);
router.get('/event/:id', reportController.getEventReport);
router.get('/dashboard', reportController.getDashboardStats);

module.exports = router;
