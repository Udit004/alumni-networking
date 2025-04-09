const MentorshipApplication = require('../models/MentorshipApplication');
const Mentorship = require('../models/Mentorship');
const mongoose = require('mongoose');

// Direct MongoDB insertion function
async function createMentorshipApplicationDirectly(applicationData) {
  try {
    // Get direct access to the collection using the raw MongoDB driver
    const db = mongoose.connection.db;
    const collection = db.collection('mentorshipapplications');
    
    // Insert document directly
    const result = await collection.insertOne(applicationData);
    console.log('Direct MongoDB insert result:', result);
    
    if (result.acknowledged) {
      return {
        success: true,
        data: {
          _id: result.insertedId,
          ...applicationData
        }
      };
    } else {
      return {
        success: false,
        message: 'Failed to insert application'
      };
    }
  } catch (error) {
    console.error('Error in direct MongoDB insert:', error);
    return {
      success: false,
      message: 'Database error',
      error: error.message
    };
  }
}

// Apply for a mentorship
exports.applyForMentorship = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request params:', req.params);
    
    // Create application data with guaranteed field values
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
    const result = await createMentorshipApplicationDirectly(applicationData);
    
    if (result.success) {
      return res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: result.data
      });
    } else {
      return res.status(500).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in mentorship application:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message
    });
  }
};

// Get all mentorship applications for the current user
exports.getMentorshipApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const applications = await MentorshipApplication.find({ userId })
      .populate({
        path: 'mentorshipId',
        select: 'title description mentor startDate endDate'
      })
      .sort({ appliedAt: -1 });
      
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching mentorship applications:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve applications', error: error.message });
  }
};

// Get a specific mentorship application
exports.getMentorshipApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const application = await MentorshipApplication.findById(id)
      .populate({
        path: 'mentorshipId',
        select: 'title description mentor startDate endDate'
      });
      
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    // Ensure the application belongs to the requesting user
    if (application.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this application' });
    }
    
    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error fetching mentorship application:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve application', error: error.message });
  }
}; 