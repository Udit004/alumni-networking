const express = require('express');
const router = express.Router();
const mentorshipController = require('../controllers/mentorshipController');
const mongoose = require('mongoose');
const { protect } = require('../middleware/authMiddleware');

// Get all mentorships
router.get('/', mentorshipController.getAllMentorships);

// Create mentorship
router.post('/', mentorshipController.createMentorship);

// Get user's mentorships
router.get('/user/:userId', mentorshipController.getUserMentorships);

// Apply for a mentorship - added auth middleware
router.post('/:id/apply', protect, async (req, res) => {
  try {
    console.log('📝 Mentorship application received');
    console.log('Request body:', req.body);
    console.log('Request params:', req.params);
    console.log('User object:', req.user);
    
    // Get mentorshipId from path params and userId from auth middleware
    const mentorshipId = req.params.id;
    const userId = req.user.id; // From auth middleware
    
    if (!mentorshipId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: mentorshipId'
      });
    }
    
    console.log(`Processing application for mentorship ${mentorshipId} by user ${userId}`);
    
    // Insert directly into MongoDB
    const db = mongoose.connection.db;
    const collection = db.collection('mentorshipapplications');
    
    // Create application data with all required fields
    const applicationData = {
      mentorshipId: mentorshipId,
      userId: userId,
      name: req.body.name || "Unnamed Applicant",
      email: req.body.email || "no-email@example.com",
      phone: req.body.phone || "000-000-0000",
      currentYear: req.body.currentYear || "Unknown",
      program: req.body.program || req.body.currentYear || "Unknown",
      skills: Array.isArray(req.body.skills) ? req.body.skills : ["No skills provided"],
      experience: req.body.experience || "No experience provided",
      whyInterested: req.body.whyInterested || "No reason provided",
      additionalInfo: req.body.additionalInfo || "",
      status: "pending",
      appliedAt: new Date()
    };
    
    console.log('Saving application data:', applicationData);
    
    const result = await collection.insertOne(applicationData);
    console.log('MongoDB insert result:', result);
    
    if (result.acknowledged) {
      return res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: {
          _id: result.insertedId,
          mentorshipId: mentorshipId,
          userId: userId
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to submit application'
      });
    }
  } catch (error) {
    console.error('❌ Error applying for mentorship:', error);
    return res.status(500).json({
      success: false, 
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get, update, and delete a specific mentorship
router.get('/:id', mentorshipController.getMentorship);
router.put('/:id', mentorshipController.updateMentorship);
router.delete('/:id', mentorshipController.deleteMentorship);

// Complete a mentorship
router.put('/:id/complete', mentorshipController.completeMentorship);

module.exports = router; 