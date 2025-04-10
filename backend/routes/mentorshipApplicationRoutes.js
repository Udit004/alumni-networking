const express = require('express');
const router = express.Router();
const mentorshipApplicationController = require('../controllers/mentorshipApplicationController');
const { protect } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// Quick test endpoint to create a test application for the current user
router.post('/create-test-for-current-user', protect, async (req, res) => {
  try {
    console.log('Creating test application specifically for current user');
    console.log('User info:', req.user);
    console.log('Query params:', req.query);
    
    const firebaseUID = req.query.firebaseUID || req.user?.firebaseUid || req.user?.id;
    console.log(`Using Firebase UID: ${firebaseUID}`);
    
    // Get the MongoDB connection directly
    const db = mongoose.connection.db;
    const collection = db.collection('mentorshipapplications');
    
    // Create test application data with the current user's ID
    const applicationData = {
      mentorshipId: "test-mentorship-id-123",
      userId: req.user.id,
      firebaseUID: firebaseUID,
      name: req.user.name || "Test User",
      email: req.user.email || "test@example.com",
      phone: "123-456-7890",
      currentYear: "3rd Year",
      program: "Computer Science",
      skills: ["JavaScript", "React", "Node.js"],
      experience: "3 years of development experience",
      whyInterested: "Looking to expand my skills and network",
      additionalInfo: "Available weekends for mentoring sessions",
      status: "pending",
      appliedAt: new Date()
    };
    
    console.log('Creating test application with data:', applicationData);
    
    // Insert directly into MongoDB
    const result = await collection.insertOne(applicationData);
    console.log('Test application creation result:', result);
    
    // Get all applications for this user to verify
    const allUserApps = await collection.find({
      $or: [
        { userId: req.user.id },
        { firebaseUID: firebaseUID }
      ]
    }).toArray();
    
    console.log(`Found ${allUserApps.length} total applications for this user`);
    
    return res.status(201).json({
      success: true,
      message: 'Test application created successfully for current user',
      data: {
        _id: result.insertedId,
        ...applicationData
      },
      allUserApplications: allUserApps
    });
  } catch (error) {
    console.error('Error creating test application:', error);
    return res.status(500).json({
      success: false, 
      message: 'Failed to create test application',
      error: error.message
    });
  }
});

// Direct test endpoint that bypasses Mongoose validation completely
router.post('/direct-test/:mentorshipId', protect, async (req, res) => {
  try {
    console.log('DIRECT TEST endpoint accessed');
    console.log('Request body:', req.body);
    console.log('Request params:', req.params);
    console.log('Request query:', req.query);
    console.log('User:', req.user);
    
    // Get the MongoDB connection directly
    const db = mongoose.connection.db;
    const collection = db.collection('mentorshipapplications');
    
    // Create application data with all required fields
    const applicationData = {
      mentorshipId: req.body.mentorshipId || req.params.mentorshipId,
      userId: req.user.id,
      firebaseUID: req.query.firebaseUID || req.body.firebaseUID || req.user.id,
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

// Get all mentorship applications for a specific mentor
router.get('/mentor/:mentorId', protect, mentorshipApplicationController.getMentorshipApplicationsForMentor);

// Get all mentorship applications for a specific user
router.get('/user/:userId', protect, (req, res, next) => {
  console.log('Debug - Accessing /user/:userId route with:');
  console.log('Params:', req.params);
  console.log('Query:', req.query);
  console.log('User in request:', req.user?.id);
  next();
}, mentorshipApplicationController.getMentorshipApplicationsForUser);

// Get a specific mentorship application
router.get('/:id', protect, mentorshipApplicationController.getMentorshipApplication);

// Create test application and immediately retrieve
router.post('/debug-create-and-get/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Debug - Create and Get for user:', userId);
    
    // Get the MongoDB connection directly
    const db = mongoose.connection.db;
    const collection = db.collection('mentorshipapplications');
    
    // Try to find a real mentorship to use
    let testMentorshipId;
    try {
      const mentorshipCollection = db.collection('mentorships');
      const mentorship = await mentorshipCollection.findOne({});
      if (mentorship) {
        console.log('Found real mentorship to use:', mentorship._id);
        testMentorshipId = mentorship._id.toString();
      } else {
        // Create a valid ObjectId if no mentorship exists
        testMentorshipId = new mongoose.Types.ObjectId().toString();
        console.log('Created new ObjectId for test mentorship:', testMentorshipId);
      }
    } catch (err) {
      console.log('Error finding mentorship, using generated ObjectId:', err.message);
      testMentorshipId = new mongoose.Types.ObjectId().toString();
    }
    
    // Create test application data specifically with the provided userId and firebaseUID
    const applicationData = {
      mentorshipId: testMentorshipId,
      userId: userId,
      firebaseUID: userId,
      name: "Debug Test User",
      email: "debug-test@example.com",
      phone: "123-456-7890",
      currentYear: "Debug Year",
      program: "Debug Program",
      skills: ["Debug", "Testing"],
      experience: "Debug experience",
      whyInterested: "Debug testing",
      additionalInfo: "Created by debug endpoint",
      status: "pending",
      appliedAt: new Date()
    };
    
    console.log('Creating debug test application with data:', applicationData);
    
    // Insert directly into MongoDB
    const result = await collection.insertOne(applicationData);
    console.log('Debug test application creation result:', result);
    
    // Verify it exists immediately
    console.log('Immediately checking if application exists');
    
    // Try both direct find and Mongoose find
    const directFind = await collection.findOne({ userId: userId });
    console.log('Direct find result:', directFind ? 'Found' : 'Not found');
    
    // Try various other queries to find the application
    const byFirebaseUID = await collection.findOne({ firebaseUID: userId });
    console.log('Find by firebaseUID:', byFirebaseUID ? 'Found' : 'Not found');
    
    // Search with $or to try both fields
    const orQuery = await collection.find({ 
      $or: [
        { userId: userId },
        { firebaseUID: userId }
      ]
    }).toArray();
    
    console.log(`Found ${orQuery.length} applications with $or query`);
    
    return res.status(200).json({
      success: true,
      message: 'Debug test complete',
      created: applicationData,
      directFind: directFind ? 'Found' : 'Not found',
      byFirebaseUID: byFirebaseUID ? 'Found' : 'Not found',
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

module.exports = router; 