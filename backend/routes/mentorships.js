const express = require('express');
const router = express.Router();
const mentorshipController = require('../controllers/mentorshipController');

// Get all mentorships
router.get('/', mentorshipController.getAllMentorships);

// Create mentorship
router.post('/', mentorshipController.createMentorship);

// Get user's mentorships
router.get('/user/:userId', mentorshipController.getUserMentorships);

// Get, update, and delete a specific mentorship
router.get('/:id', mentorshipController.getMentorship);
router.put('/:id', mentorshipController.updateMentorship);
router.delete('/:id', mentorshipController.deleteMentorship);

// Complete a mentorship
router.put('/:id/complete', mentorshipController.completeMentorship);

module.exports = router; 