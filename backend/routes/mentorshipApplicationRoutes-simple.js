const express = require('express');
const router = express.Router();
const mentorshipApplicationController = require('../controllers/mentorshipApplicationController');
const { auth } = require('../middleware/auth-simple');

// Apply for a mentorship
router.post('/:mentorshipId', auth, mentorshipApplicationController.applyForMentorship);

// Get all mentorship applications for the current user
router.get('/', auth, mentorshipApplicationController.getMentorshipApplications);

// Get a specific mentorship application
router.get('/:id', auth, mentorshipApplicationController.getMentorshipApplication);

// Get all mentorship applications for mentorships created by a specific mentor
router.get('/mentor/:mentorId', auth, mentorshipApplicationController.getMentorshipApplicationsForMentor);

// Get all mentorship applications for a specific user
router.get('/user/:userId', auth, mentorshipApplicationController.getMentorshipApplicationsForUser);

module.exports = router;
