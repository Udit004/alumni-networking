const mongoose = require('mongoose');
const MentorshipApplication = require('../models/MentorshipApplication');
const Mentorship = require('../models/Mentorship');
const User = require('../models/user');
const activityService = require('../services/activityService');

// Get all mentorship applications for a specific user
exports.getMentorshipApplicationsForUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const firebaseUID = req.query.firebaseUID || userId;
    const excludeTestData = req.query.excludeTestData === 'true';

    console.log(`Looking for mentorship applications with:
    - Params userId: ${userId}
    - Query firebaseUID: ${req.query.firebaseUID}
    - Final firebaseUID: ${firebaseUID}
    - User object id: ${req.user?.id}
    - Exclude test data: ${excludeTestData}
    `);

    // MongoDB query tailored to find applications by userId
    console.log('Performing MongoDB query for applications');

    // The main query - use an $or to try multiple possible user ID formats
    const query = {
      $or: [
        { userId: userId },
        { userId: firebaseUID },
        { firebaseUID: userId },
        { firebaseUID: firebaseUID }
      ]
    };

    // Special case handling for the known user with specific ID
    if (userId === 'e9AMLzvvdjhL28f534BsWqCixnN2') {
      // Add the specific ID we know exists in the database to our query
      query.$or.push({ userId: "4EOWySj0hHfLOCWFxi3JeJYsqTj2" });
      console.log('Adding special case query for known user ID: 4EOWySj0hHfLOCWFxi3JeJYsqTj2');
    }

    console.log('Final query:', JSON.stringify(query));

    // Find applications where the user is the mentor
    const mentorships = await Mentorship.find({ mentorId: userId });
    console.log(`Found ${mentorships.length} mentorships created by this user`);
    
    const mentorshipIds = mentorships.map(m => m._id.toString());
    console.log('Mentorship IDs:', mentorshipIds);

    // Find applications for mentorships created by this mentor
    const mentorApplicationsQuery = {
      mentorshipId: { $in: mentorshipIds }
    };
    
    console.log('Mentor applications query:', JSON.stringify(mentorApplicationsQuery));
    
    const mentorApplications = await MentorshipApplication.find(mentorApplicationsQuery)
      .populate({
        path: 'mentorshipId',
        select: 'title description mentor startDate endDate expectations duration commitment'
      });
    
    console.log(`Found ${mentorApplications.length} applications for mentorships created by this mentor`);

    // Return the applications
    return res.status(200).json({
      success: true,
      count: mentorApplications.length,
      data: mentorApplications
    });
  } catch (error) {
    console.error('Error fetching mentorship applications for user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

// Accept a mentorship application
exports.acceptMentorshipApplication = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Accepting mentorship application with ID: ${id}`);
    console.log('User making the request:', req.user?.id);
    
    // Find the application
    const application = await MentorshipApplication.findById(id);
    
    if (!application) {
      console.log(`Application with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    console.log('Found application:', {
      id: application._id,
      mentorshipId: application.mentorshipId,
      userId: application.userId,
      status: application.status
    });
    
    // Find the mentorship
    const mentorship = await Mentorship.findById(application.mentorshipId);
    
    if (!mentorship) {
      console.log(`Mentorship with ID ${application.mentorshipId} not found`);
      return res.status(404).json({
        success: false,
        message: 'Mentorship not found'
      });
    }
    
    console.log('Found mentorship:', {
      id: mentorship._id,
      title: mentorship.title,
      mentorId: mentorship.mentorId
    });
    
    // Check if the user is the mentor
    if (mentorship.mentorId !== req.user.id && req.user.role !== 'admin') {
      console.log(`User ${req.user.id} is not the mentor of this mentorship`);
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this application'
      });
    }
    
    // Update the application status
    application.status = 'accepted';
    await application.save();
    
    console.log(`Application ${id} status updated to 'accepted'`);
    
    // Increment the mentees count
    mentorship.mentees = (mentorship.mentees || 0) + 1;
    await mentorship.save();
    
    console.log(`Mentorship ${mentorship._id} mentees count updated to ${mentorship.mentees}`);
    
    // Create activity for accepting the application
    try {
      await activityService.createMentorshipApplicationStatusActivity(
        application.userId,
        mentorship._id.toString(),
        mentorship.title,
        'accepted',
        req.user.id
      );
      console.log('Activity created for accepting application');
    } catch (activityError) {
      console.error('Error creating activity:', activityError);
      // Continue with the response even if activity creation fails
    }
    
    return res.status(200).json({
      success: true,
      message: 'Application accepted successfully',
      data: application
    });
  } catch (error) {
    console.error('Error accepting mentorship application:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to accept application',
      error: error.message
    });
  }
};

// Reject a mentorship application
exports.rejectMentorshipApplication = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Rejecting mentorship application with ID: ${id}`);
    console.log('User making the request:', req.user?.id);
    
    // Find the application
    const application = await MentorshipApplication.findById(id);
    
    if (!application) {
      console.log(`Application with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    console.log('Found application:', {
      id: application._id,
      mentorshipId: application.mentorshipId,
      userId: application.userId,
      status: application.status
    });
    
    // Find the mentorship
    const mentorship = await Mentorship.findById(application.mentorshipId);
    
    if (!mentorship) {
      console.log(`Mentorship with ID ${application.mentorshipId} not found`);
      return res.status(404).json({
        success: false,
        message: 'Mentorship not found'
      });
    }
    
    console.log('Found mentorship:', {
      id: mentorship._id,
      title: mentorship.title,
      mentorId: mentorship.mentorId
    });
    
    // Check if the user is the mentor
    if (mentorship.mentorId !== req.user.id && req.user.role !== 'admin') {
      console.log(`User ${req.user.id} is not the mentor of this mentorship`);
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this application'
      });
    }
    
    // Update the application status
    application.status = 'rejected';
    await application.save();
    
    console.log(`Application ${id} status updated to 'rejected'`);
    
    // Create activity for rejecting the application
    try {
      await activityService.createMentorshipApplicationStatusActivity(
        application.userId,
        mentorship._id.toString(),
        mentorship.title,
        'rejected',
        req.user.id
      );
      console.log('Activity created for rejecting application');
    } catch (activityError) {
      console.error('Error creating activity:', activityError);
      // Continue with the response even if activity creation fails
    }
    
    return res.status(200).json({
      success: true,
      message: 'Application rejected successfully',
      data: application
    });
  } catch (error) {
    console.error('Error rejecting mentorship application:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reject application',
      error: error.message
    });
  }
};
