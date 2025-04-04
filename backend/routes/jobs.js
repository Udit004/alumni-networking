const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// Get all jobs
router.get('/', jobController.getAllJobs);

// Create job
router.post('/', jobController.createJob);

// Get user's jobs
router.get('/user/:userId', jobController.getUserJobs);

// Get, update, and delete a specific job
router.get('/:id', jobController.getJob);
router.put('/:id', jobController.updateJob);
router.delete('/:id', jobController.deleteJob);

module.exports = router; 