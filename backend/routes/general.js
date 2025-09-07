const express = require('express');
const router = express.Router();
const generalController = require('../controllers/generalController');

// General routes
router.get('/colleges', generalController.getColleges);
router.get('/students', generalController.getStudents);
router.get('/students/:id', generalController.getStudentById);
router.post('/students', generalController.createStudent);

module.exports = router;
