const MentorshipApplication = require('../models/MentorshipApplication');
const Mentorship = require('../models/Mentorship');
const mongoose = require('mongoose');
const activityService = require('../services/activityService');

// Apply for a mentorship
exports.applyForMentorship = async (req, res) => {
  try {
    const { mentorshipId } = req.params;
    const { whyInterested, experience, goals, availability, additionalInfo } = req.body;
    const userId = req.user.id;

    // Check if mentorship exists
    const mentorship = await Mentorship.findById(mentorshipId);
    if (!mentorship) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship not found'
      });
    }

    // Check if user has already applied
    const existingApplication = await MentorshipApplication.findOne({
      mentorshipId,
      userId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this mentorship'
      });
    }

    // Create new application
    const application = new MentorshipApplication({
      mentorshipId,
      userId,
      whyInterested,
      experience,
      goals,
      availability,
      additionalInfo,
      status: 'pending'
    });

    await application.save();

    // Create activity for the mentorship application
    try {
      await activityService.createMentorshipApplicationActivity(
        userId,
        mentorshipId,
        mentorship.title || 'Mentorship Program',
        mentorship.mentorId,
        mentorship.mentorName || 'Mentor'
      );
    } catch (activityError) {
      console.error('Error creating mentorship application activity:', activityError);
      // Continue with the response even if activity creation fails
    }

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Error applying for mentorship:', error);
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
      .populate('mentorshipId')
      .sort({ appliedAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching user mentorship applications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

// Get all mentorship applications for a specific user
exports.getMentorshipApplicationsForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const applications = await MentorshipApplication.find({ userId })
      .populate('mentorshipId')
      .sort({ appliedAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
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

// Get all mentorship applications for mentorships created by a specific mentor
exports.getMentorshipApplicationsForMentor = async (req, res) => {
  try {
    const mentorId = req.params.mentorId || req.user.id;

    console.log(`Fetching mentorship applications for mentor: ${mentorId}`);

    // First, find all mentorships created by this mentor
    const mentorships = await Mentorship.find({ mentorId });

    if (!mentorships || mentorships.length === 0) {
      console.log('No mentorships found for this mentor');
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    console.log(`Found ${mentorships.length} mentorships created by this mentor`);
    const mentorshipIds = mentorships.map(mentorship => mentorship._id);

    // Find all applications for these mentorships
    const applications = await MentorshipApplication.find({
      mentorshipId: { $in: mentorshipIds }
    }).populate({
      path: 'mentorshipId',
      select: 'title description startDate endDate'
    }).populate({
      path: 'userId',
      select: 'name email institution'
    }).sort({ appliedAt: -1 });

    console.log(`Found ${applications.length} applications for mentorships by this mentor`);

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });

  } catch (error) {
    console.error('Error fetching mentorship applications for mentor:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve applications for mentor',
      error: error.message
    });
  }
};

// Get all mentorship applications for a specific mentorship
exports.getMentorshipApplicationsForMentorship = async (req, res) => {
  try {
    const { mentorshipId } = req.params;

    // Find the mentorship first to verify it exists and the user has permission
    const mentorship = await Mentorship.findById(mentorshipId);

    if (!mentorship) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship not found'
      });
    }

    // Check if user is authorized (either the mentor or an admin)
    if (mentorship.mentorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these applications'
      });
    }

    const applications = await MentorshipApplication.find({ mentorshipId })
      .populate('userId', 'name email institution program')
      .sort({ appliedAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching mentorship applications for mentorship:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

// Get a specific mentorship application
exports.getMentorshipApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await MentorshipApplication.findById(id)
      .populate('mentorshipId')
      .populate('userId', 'name email institution program');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is authorized (either the applicant, the mentor, or an admin)
    const mentorship = await Mentorship.findById(application.mentorshipId);

    if (
      application.userId._id.toString() !== req.user.id &&
      mentorship.mentorId !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    return res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error fetching mentorship application:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch application',
      error: error.message
    });
  }
};

// Accept a mentorship application
exports.acceptMentorshipApplication = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the application
    const application = await MentorshipApplication.findById(id)
      .populate('mentorshipId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is authorized (either the mentor or an admin)
    const mentorship = application.mentorshipId;

    if (mentorship.mentorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this application'
      });
    }

    // Update the application status
    application.status = 'accepted';
    await application.save();

    // Create activity for the mentorship status change
    try {
      await activityService.createMentorshipStatusChangeActivity(
        application.userId,
        mentorship._id,
        mentorship.title || 'Mentorship Program',
        mentorship.mentorId,
        mentorship.mentorName || 'Mentor',
        'accepted'
      );
    } catch (activityError) {
      console.error('Error creating mentorship status change activity:', activityError);
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

    // Find the application
    const application = await MentorshipApplication.findById(id)
      .populate('mentorshipId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is authorized (either the mentor or an admin)
    const mentorship = application.mentorshipId;

    if (mentorship.mentorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this application'
      });
    }

    // Update the application status
    application.status = 'rejected';
    await application.save();

    // Create activity for the mentorship status change
    try {
      await activityService.createMentorshipStatusChangeActivity(
        application.userId,
        mentorship._id,
        mentorship.title || 'Mentorship Program',
        mentorship.mentorId,
        mentorship.mentorName || 'Mentor',
        'rejected'
      );
    } catch (activityError) {
      console.error('Error creating mentorship status change activity:', activityError);
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

// Update mentorship application status
exports.updateMentorshipApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value. Must be one of: pending, accepted, rejected'
      });
    }

    // Find the application
    const application = await MentorshipApplication.findById(id)
      .populate('mentorshipId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is authorized (either the mentor or an admin)
    const mentorship = application.mentorshipId;

    if (mentorship.mentorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    // Update the application status
    application.status = status;
    await application.save();

    // Create activity for the mentorship status change
    try {
      await activityService.createMentorshipStatusChangeActivity(
        application.userId,
        mentorship._id,
        mentorship.title || 'Mentorship Program',
        mentorship.mentorId,
        mentorship.mentorName || 'Mentor',
        status
      );
    } catch (activityError) {
      console.error('Error creating mentorship status change activity:', activityError);
      // Continue with the response even if activity creation fails
    }

    return res.status(200).json({
      success: true,
      message: `Application status updated to ${status} successfully`,
      data: application
    });
  } catch (error) {
    console.error('Error updating mentorship application status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error.message
    });
  }
};
