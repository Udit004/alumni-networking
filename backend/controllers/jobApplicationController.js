const JobApplication = require('../models/JobApplication');
const Job = require('../models/Job');
const mongoose = require('mongoose');

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

// Get all job applications for jobs posted by a specific employer
exports.getJobApplicationsForEmployer = async (req, res) => {
  try {
    const employerId = req.params.employerId || req.user.id;
    const excludeTestData = req.query.excludeTestData === 'true';
    
    console.log(`Fetching job applications for employer: ${employerId}`);
    
    // First, find all jobs created by this employer
    const Job = mongoose.model('Job');
    const jobs = await Job.find({ creatorId: employerId });
    
    if (!jobs || jobs.length === 0) {
      console.log('No jobs found for this employer');
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
    
    console.log(`Found ${jobs.length} jobs created by this employer`);
    const jobIds = jobs.map(job => job._id);
    
    // Find all applications for these jobs
    const applications = await JobApplication.find({
      jobId: { $in: jobIds }
    }).populate({
      path: 'jobId',
      select: 'title company location description salary requirements deadline'
    }).sort({ appliedAt: -1 });
    
    console.log(`Found ${applications.length} applications for jobs by this employer`);
    
    // Add isTestData flag to applications
    const enhancedApplications = applications.map(app => {
      const appData = app.toObject();
      
      // Add an indicator if this is a test application
      appData.isTestData = 
        (appData.name && appData.name.toLowerCase().includes('debug')) || 
        (appData.name && appData.name.toLowerCase().includes('test')) ||
        (appData.email && appData.email.toLowerCase().includes('test')) || 
        (appData.email === 'debug-test@example.com') ||
        (typeof appData.jobId === 'object' && appData.jobId.title && appData.jobId.title.toLowerCase().includes('test'));
      
      return appData;
    });
    
    // Filter out test data if requested
    const filteredApplications = excludeTestData 
      ? enhancedApplications.filter(app => !app.isTestData)
      : enhancedApplications;
    
    console.log(`Returning ${filteredApplications.length} applications (filtered out ${enhancedApplications.length - filteredApplications.length} test applications)`);
    
    res.status(200).json({
      success: true,
      count: filteredApplications.length,
      data: filteredApplications
    });
    
  } catch (error) {
    console.error('Error fetching job applications for employer:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve applications for employer', 
      error: error.message 
    });
  }
};

// Get all job applications for a specific job
exports.getJobApplicationsForJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    
    console.log(`Fetching job applications for job ID: ${jobId}`);
    
    // Find the job first to verify it exists and the user has permission
    const Job = mongoose.model('Job');
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }
    
    // Check if user is authorized (either the job creator or an admin)
    if (job.creatorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view these applications' 
      });
    }
    
    // Find all applications for this job
    const applications = await JobApplication.find({ jobId })
      .populate({
        path: 'userId',
        select: 'name email institution'
      })
      .sort({ appliedAt: -1 });
    
    console.log(`Found ${applications.length} applications for job: ${job.title || jobId}`);
    
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
    
  } catch (error) {
    console.error('Error fetching job applications for job:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve applications for job', 
      error: error.message 
    });
  }
}; 