const express = require('express');
const router = express.Router();
const mentorshipApplicationController = require('../controllers/mentorshipApplicationController');
const { protect } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// Direct test endpoint that bypasses Mongoose validation completely
router.post('/direct-test/:mentorshipId', protect, async (req, res) => {
  try {
    console.log('DIRECT TEST endpoint accessed');
    console.log('Request body:', req.body);
    console.log('Request params:', req.params);
    console.log('User:', req.user);
    
    // Get the MongoDB connection directly
    const db = mongoose.connection.db;
    const collection = db.collection('mentorshipapplications');
    
    // Create application data with all required fields
    const applicationData = {
      mentorshipId: req.body.mentorshipId || req.params.mentorshipId,
      userId: req.user.id,
      name: req.body.name || "Test User",
      email: req.body.email || "test@example.com",
      phone: req.body.phone || "123-456-7890",
      currentYear: req.body.currentYear || "3rd Year",
      program: req.body.program || req.body.currentYear || "Computer Science",
      skills: Array.isArray(req.body.skills) ? req.body.skills : ["JavaScript", "React"],
      experience: req.body.experience || "Test experience",
      whyInterested: req.body.whyInterested || "Test interest reason",
      additionalInfo: req.body.additionalInfo || "",
      status: "pending",
      appliedAt: new Date()
    };
    
    console.log('Using application data:', applicationData);
    
    // Insert directly into MongoDB
    const result = await collection.insertOne(applicationData);
    console.log('Direct MongoDB insert result:', result);
    
    if (result.acknowledged) {
      return res.status(201).json({
        success: true,
        message: 'Test application submitted successfully via direct endpoint',
        data: {
          _id: result.insertedId,
          ...applicationData
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to insert test application into database'
      });
    }
  } catch (error) {
    console.error('Error in direct test endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit test application',
      error: error.message
    });
  }
});

// Apply for a mentorship
router.post('/:mentorshipId', protect, mentorshipApplicationController.applyForMentorship);

// Get all mentorship applications for the current user
router.get('/', protect, mentorshipApplicationController.getMentorshipApplications);

// Get a specific mentorship application
router.get('/:id', protect, mentorshipApplicationController.getMentorshipApplication);

module.exports = router; 