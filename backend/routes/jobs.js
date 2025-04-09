const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const mongoose = require('mongoose');
const { protect } = require('../middleware/authMiddleware');

// Get all jobs
router.get('/', jobController.getAllJobs);

// Create job
router.post('/', jobController.createJob);

// Get user's jobs
router.get('/user/:userId', jobController.getUserJobs);

// Apply for a job - added auth middleware
router.post('/:id/apply', protect, async (req, res) => {
  try {
    console.log('📝 Job application received');
    console.log('Request body:', req.body);
    console.log('Request params:', req.params);
    console.log('User object:', req.user);
    
    // Get jobId from path params and userId from auth middleware
    const jobId = req.params.id;
    const userId = req.user.id; // From auth middleware
    
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: jobId'
      });
    }
    
    console.log(`Processing application for job ${jobId} by user ${userId}`);
    
    // Insert directly into MongoDB
    const db = mongoose.connection.db;
    const collection = db.collection('jobapplications');
    
    // Create application data with all required fields
    const applicationData = {
      jobId: jobId,
      userId: userId,
      name: req.body.name || "Unnamed Applicant",
      email: req.body.email || "no-email@example.com",
      phone: req.body.phone || "000-000-0000",
      location: req.body.location || "Unknown",
      education: req.body.education || "Not specified",
      experience: req.body.experience || "No experience provided",
      skills: req.body.skills || "No skills provided",
      coverletter: req.body.coverletter || "No cover letter provided",
      resumeLink: req.body.resumeLink || "",
      additionalInfo: req.body.additionalInfo || "",
      status: "pending",
      appliedAt: new Date()
    };
    
    console.log('Saving job application data:', applicationData);
    
    const result = await collection.insertOne(applicationData);
    console.log('MongoDB insert result:', result);
    
    if (result.acknowledged) {
      return res.status(201).json({
        success: true,
        message: 'Job application submitted successfully',
        data: {
          _id: result.insertedId,
          jobId: jobId,
          userId: userId
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to submit job application'
      });
    }
  } catch (error) {
    console.error('❌ Error applying for job:', error);
    return res.status(500).json({
      success: false, 
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get, update, and delete a specific job
router.get('/:id', jobController.getJob);
router.put('/:id', jobController.updateJob);
router.delete('/:id', jobController.deleteJob);

module.exports = router; 