const JobApplication = require('../models/JobApplication');
const Job = require('../models/Job');
const mongoose = require('mongoose');
const activityService = require('../services/activityService');

exports.applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { name, email, phone, currentYear, program, skills, experience, whyInterested, additionalInfo } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user has already applied
    const existingApplication = await JobApplication.findOne({
      jobId,
      userId: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Create new application
    const application = new JobApplication({
      jobId,
      userId: req.user._id,
      name,
      email,
      phone,
      currentYear,
      program,
      skills,
      experience,
      whyInterested,
      additionalInfo
    });

    await application.save();

    // Create activity for the job application
    try {
      await activityService.createJobApplicationActivity(
        req.user.id,
        jobId,
        job.title || 'Job Position',
        job.company || 'Company'
      );
    } catch (activityError) {
      console.error('Error creating job application activity:', activityError);
      // Continue with the response even if activity creation fails
    }

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ message: 'Error applying for job' });
  }
};

exports.getJobApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find({ userId: req.user._id })
      .populate('jobId')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({ message: 'Error fetching job applications' });
  }
};

exports.getJobApplication = async (req, res) => {
  try {
    const application = await JobApplication.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('jobId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    console.error('Error fetching job application:', error);
    res.status(500).json({ message: 'Error fetching job application' });
  }
};

// Get all job applications for a specific user
exports.getJobApplicationsForUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(`Looking for job applications for user: ${userId}`);

    // Direct approach - find all applications with matching userId as a string
    const applications = await JobApplication.find({
      userId: userId
    });

    console.log(`Found ${applications.length} job applications for user ${userId}`);

    // Log the applications for debugging
    if (applications.length > 0) {
      applications.forEach((app, index) => {
        console.log(`Application ${index+1}:`, {
          id: app._id,
          jobId: app.jobId,
          name: app.name,
          skills: app.skills,
          status: app.status
        });
      });
    } else {
      console.log('No applications found for this user');
    }

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching job applications for user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve job applications for user',
      error: error.message
    });
  }
};

// Update job application status with activity tracking
exports.updateJobApplicationStatus = async (req, res) => {
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
    const application = await JobApplication.findByIdAndUpdate(
      id,
      { status: status },
      {
        new: true,        // Return the updated document
        runValidators: false  // Skip validation
      }
    ).populate('jobId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Create activity for the job status change
    try {
      const job = application.jobId;
      const jobTitle = job && typeof job === 'object' ? job.title : 'Job Position';
      const companyName = job && typeof job === 'object' ? job.company : 'Company';

      await activityService.createJobStatusChangeActivity(
        application.userId,
        application.jobId._id || application.jobId,
        jobTitle,
        companyName,
        status
      );
    } catch (activityError) {
      console.error('Error creating job status change activity:', activityError);
      // Continue with the response even if activity creation fails
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
};

// Accept a job application with activity tracking
exports.acceptJobApplication = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Accepting job application with ID: ${id}`);

    // Find and update the application using findByIdAndUpdate to bypass validation
    const application = await JobApplication.findByIdAndUpdate(
      id,
      { status: 'accepted' },
      {
        new: true,
        runValidators: false
      }
    ).populate('jobId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Create activity for the job status change
    try {
      const job = application.jobId;
      const jobTitle = job && typeof job === 'object' ? job.title : 'Job Position';
      const companyName = job && typeof job === 'object' ? job.company : 'Company';

      await activityService.createJobStatusChangeActivity(
        application.userId,
        application.jobId._id || application.jobId,
        jobTitle,
        companyName,
        'accepted'
      );
    } catch (activityError) {
      console.error('Error creating job status change activity:', activityError);
      // Continue with the response even if activity creation fails
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
};

// Reject a job application with activity tracking
exports.rejectJobApplication = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Rejecting job application with ID: ${id}`);

    // Use findByIdAndUpdate to update only the status field without triggering validation
    const application = await JobApplication.findByIdAndUpdate(
      id,
      { status: 'rejected' },
      {
        new: true,        // Return the updated document
        runValidators: false  // Skip validation
      }
    ).populate('jobId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Create activity for the job status change
    try {
      const job = application.jobId;
      const jobTitle = job && typeof job === 'object' ? job.title : 'Job Position';
      const companyName = job && typeof job === 'object' ? job.company : 'Company';

      await activityService.createJobStatusChangeActivity(
        application.userId,
        application.jobId._id || application.jobId,
        jobTitle,
        companyName,
        'rejected'
      );
    } catch (activityError) {
      console.error('Error creating job status change activity:', activityError);
      // Continue with the response even if activity creation fails
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
};

// Export other functions from the original controller
exports.getJobApplicationsForEmployer = require('./jobApplicationController').getJobApplicationsForEmployer;
exports.getJobApplicationsForJob = require('./jobApplicationController').getJobApplicationsForJob;
exports.createTestApplication = require('./jobApplicationController').createTestApplication;
