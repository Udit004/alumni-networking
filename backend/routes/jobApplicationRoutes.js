const express = require('express');
const router = express.Router();
const jobApplicationController = require('../controllers/jobApplicationController');
const { protect } = require('../middleware/authMiddleware');

// Apply for a job
router.post('/:jobId', protect, jobApplicationController.applyForJob);

// Get all job applications for the current user
router.get('/', protect, jobApplicationController.getJobApplications);

// Get all job applications for a specific user
router.get('/user/:userId', protect, jobApplicationController.getJobApplicationsForUser);

// Get all job applications for a specific job
router.get('/job/:jobId', protect, jobApplicationController.getJobApplicationsForJob);

// Get all job applications for jobs posted by a specific employer
router.get('/employer/:employerId', protect, jobApplicationController.getJobApplicationsForEmployer);

// Debug endpoint to create and test job applications
router.post('/debug-create-and-get/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Debug - Create and Get job applications for user:', userId);
    
    // Get the MongoDB connection directly
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;
    const collection = db.collection('jobapplications');
    
    // Try to find a real job to use
    let testJobId;
    try {
      const jobCollection = db.collection('jobs');
      const job = await jobCollection.findOne({});
      if (job) {
        console.log('Found real job to use:', job._id);
        testJobId = job._id.toString();
      } else {
        // Create a valid ObjectId if no job exists
        testJobId = new mongoose.Types.ObjectId().toString();
        console.log('Created new ObjectId for test job:', testJobId);
      }
    } catch (err) {
      console.log('Error finding job, using generated ObjectId:', err.message);
      testJobId = new mongoose.Types.ObjectId().toString();
    }
    
    // Create test application data specifically with the provided userId
    const applicationData = {
      jobId: testJobId,
      userId: userId,
      name: "Debug Test User",
      email: "debug-test@example.com",
      phone: "123-456-7890",
      location: "Debug City, Test",
      education: "Computer Science",
      experience: "5 years of testing experience",
      skills: "Debugging, Testing, QA",
      coverletter: "This is a debug test cover letter",
      resumeLink: "",
      additionalInfo: "Created by debug endpoint",
      status: "pending",
      appliedAt: new Date()
    };
    
    console.log('Creating debug test job application with data:', applicationData);
    
    // Insert directly into MongoDB
    const result = await collection.insertOne(applicationData);
    console.log('Debug test job application creation result:', result);
    
    // Verify it exists immediately
    console.log('Immediately checking if job application exists');
    
    // Try both direct find and queries
    const directFind = await collection.findOne({ userId: userId });
    console.log('Direct find result:', directFind ? 'Found' : 'Not found');
    
    // Search with $or to try both fields
    const orQuery = await collection.find({ 
      $or: [
        { userId: userId },
        { userId: "4EOWySj0hHfLOCWFxi3JeJYsqTj2" }
      ]
    }).toArray();
    
    console.log(`Found ${orQuery.length} job applications with $or query`);
    
    return res.status(200).json({
      success: true,
      message: 'Debug test complete',
      created: applicationData,
      directFind: directFind ? 'Found' : 'Not found',
      orQueryResults: orQuery
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return res.status(500).json({
      success: false, 
      message: 'Debug endpoint failed',
      error: error.message
    });
  }
});

// Test endpoint to return hard-coded job applications for a user
router.get('/user-test/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(`Returning test data for user ${userId}`);
    
    // Return hard-coded job applications based on the user ID
    if (userId === '4EOWySj0hHfLOCWFxi3JeJYsqTj2') {
      // Match the data structure from the database
      const testData = [
        {
          _id: "67f65cb556f76ef5321f43d0",
          jobId: "67f133c955e741d8ab42b6cb",
          userId: "4EOWySj0hHfLOCWFxi3JeJYsqTj2",
          name: "Udit Kumar Tiwari",
          email: "udit52@gmail.com",
          phone: "08409024923",
          location: "Kolkata, India",
          education: "Computer Science",
          experience: "2 years of Experience",
          skills: "advance excel",
          coverletter: "I am best for this job",
          resumeLink: "",
          additionalInfo: "",
          status: "pending",
          appliedAt: "2025-04-09T11:40:37.369+00:00"
        },
        {
          _id: "67f7c19700974b02743f6dcd",
          jobId: "67f7c12800974b02743f6da3",
          userId: "4EOWySj0hHfLOCWFxi3JeJYsqTj2",
          name: "Udit Kumar Tiwari",
          email: "udit52@gmail.com",
          phone: "08409024923",
          location: "Kolkata, India",
          education: "Computer Science",
          experience: "1 year",
          skills: "advance python",
          coverletter: "i am best for the job with Greate skills and dedication.",
          resumeLink: "",
          additionalInfo: "",
          status: "pending",
          appliedAt: "2025-04-10T13:03:19.845+00:00"
        }
      ];
      
      return res.status(200).json({
        success: true,
        count: testData.length,
        data: testData
      });
    } else {
      // Return empty data for other users
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Error in test endpoint',
      error: error.message
    });
  }
});

// Get a specific job application
router.get('/:id', protect, jobApplicationController.getJobApplication);

module.exports = router; 