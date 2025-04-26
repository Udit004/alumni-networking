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

// Debug query endpoint to directly query the database for job applications by jobId
router.get('/debug-query', protect, async (req, res) => {
  try {
    const { jobId } = req.query;
    console.log(`Debug query - Looking for job applications for job ID: ${jobId}`);

    // If no jobId is provided, return all applications
    if (!jobId) {
      console.log('No jobId provided, returning all applications');

      const db = mongoose.connection.db;
      const jobApplicationsCollection = db.collection('jobapplications');

      const allApplications = await jobApplicationsCollection.find({}).toArray();
      console.log(`Found ${allApplications.length} total applications in the database`);

      return res.status(200).json({
        success: true,
        count: allApplications.length,
        data: allApplications
      });
    }

    // Get the MongoDB connection directly
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;
    const collection = db.collection('jobapplications');

    // Try different query approaches
    console.log('Trying different query approaches for jobId:', jobId);

    // Approach 1: Direct string match
    const stringMatch = await collection.find({ jobId: jobId }).toArray();
    console.log(`Approach 1 (string match): Found ${stringMatch.length} applications`);

    // Approach 2: Try with ObjectId
    let objectIdMatch = [];
    try {
      const objectId = new mongoose.Types.ObjectId(jobId);
      objectIdMatch = await collection.find({ jobId: objectId }).toArray();
      console.log(`Approach 2 (ObjectId match): Found ${objectIdMatch.length} applications`);
    } catch (err) {
      console.log('Error converting to ObjectId:', err.message);
    }

    // Approach 3: $or query with both formats
    const orMatch = await collection.find({
      $or: [
        { jobId: jobId },
        { jobId: jobId.toString() },
        { 'jobId': jobId },
        { 'jobId': jobId.toString() }
      ]
    }).toArray();
    console.log(`Approach 3 ($or query): Found ${orMatch.length} applications`);

    // Combine results and remove duplicates
    const allResults = [...stringMatch, ...objectIdMatch, ...orMatch];
    const uniqueResults = [];
    const seenIds = new Set();

    allResults.forEach(app => {
      const idString = app._id.toString();
      if (!seenIds.has(idString)) {
        seenIds.add(idString);
        uniqueResults.push(app);
      }
    });

    console.log(`Combined unique results: ${uniqueResults.length} applications`);

    // If we found applications, return them
    if (uniqueResults.length > 0) {
      return res.status(200).json({
        success: true,
        count: uniqueResults.length,
        data: uniqueResults
      });
    }

    // If no applications found, try to find all applications in the database
    const allApplications = await collection.find({}).toArray();
    console.log(`Total applications in database: ${allApplications.length}`);

    // Check if any applications have a jobId that partially matches
    const partialMatches = allApplications.filter(app => {
      const appJobId = app.jobId ? app.jobId.toString() : '';
      return appJobId.includes(jobId) || jobId.includes(appJobId);
    });

    console.log(`Partial matches: ${partialMatches.length} applications`);

    if (partialMatches.length > 0) {
      return res.status(200).json({
        success: true,
        count: partialMatches.length,
        data: partialMatches,
        note: 'These are partial matches based on jobId substring'
      });
    }

    // If still no matches, return empty result
    return res.status(200).json({
      success: true,
      count: 0,
      data: [],
      note: 'No applications found for this job ID'
    });

  } catch (error) {
    console.error('Error in debug query endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Error querying job applications',
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
        },
        {
          _id: "6802413b798e9199ece96910",
          jobId: "67f043f4e6c88c45191e2188",
          userId: "4EOWySj0hHfLOCWFxi3JeJYsqTj2",
          name: "Udit Kr Tiwari",
          email: "udit52@gmail.com",
          phone: "539485395",
          location: "Patna",
          education: "Btech CSE",
          experience: "1 Years",
          skills: "IOS",
          coverletter: "best for this job",
          resumeLink: "",
          additionalInfo: "",
          status: "pending",
          appliedAt: "2025-04-18T12:10:35.843+00:00"
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

// Accept a job application
router.put('/:id/accept', protect, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Accepting job application with ID: ${id}`);

    // Find and update the application using findByIdAndUpdate to bypass validation
    const JobApplication = require('../models/JobApplication');

    // Use findByIdAndUpdate with { new: true } to return the updated document
    // and { runValidators: false } to bypass validation
    const application = await JobApplication.findByIdAndUpdate(
      id,
      { status: 'accepted' },
      {
        new: true,
        runValidators: false
      }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Application accepted successfully',
      data: application
    });
  } catch (error) {
    console.error('Error accepting job application:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to accept application',
      error: error.message
    });
  }
});

// Reject a job application
router.put('/:id/reject', protect, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Rejecting job application with ID: ${id}`);

    // Use findByIdAndUpdate to update only the status field without triggering validation
    const JobApplication = require('../models/JobApplication');
    const application = await JobApplication.findByIdAndUpdate(
      id,
      { status: 'rejected' },
      {
        new: true,        // Return the updated document
        runValidators: false  // Skip validation
      }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Application rejected successfully',
      data: application
    });
  } catch (error) {
    console.error('Error rejecting job application:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reject application',
      error: error.message
    });
  }
});

// Update job application status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value. Must be one of: pending, accepted, rejected'
      });
    }

    console.log(`Updating job application ${id} status to: ${status}`);

    // Use findByIdAndUpdate to update only the status field without triggering validation
    const JobApplication = require('../models/JobApplication');
    const application = await JobApplication.findByIdAndUpdate(
      id,
      { status: status },
      {
        new: true,        // Return the updated document
        runValidators: false  // Skip validation
      }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Application status updated to ${status} successfully`,
      data: application
    });
  } catch (error) {
    console.error('Error updating job application status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error.message
    });
  }
});

module.exports = router;