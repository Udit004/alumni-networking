const express = require('express');
const router = express.Router();
const jobApplicationController = require('../controllers/jobApplicationController');
const auth = require('../middleware/auth');

// Apply for a job
router.post('/:jobId', auth, jobApplicationController.applyForJob);

// Get all job applications for the current user
router.get('/', auth, jobApplicationController.getJobApplications);

// Get a specific job application
router.get('/:id', auth, jobApplicationController.getJobApplication);

module.exports = router; 