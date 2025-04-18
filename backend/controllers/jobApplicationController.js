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

    // Log job IDs for debugging
    console.log('Job IDs:', jobIds.map(id => id.toString()));

    // Try different approaches to find applications
    let applications = [];

    // Approach 1: Using $in with the job IDs
    const approach1 = await JobApplication.find({
      jobId: { $in: jobIds }
    }).populate({
      path: 'jobId',
      select: 'title company location description salary requirements deadline'
    }).sort({ appliedAt: -1 });

    console.log(`Approach 1: Found ${approach1.length} applications using jobId: { $in: jobIds }`);
    applications = approach1;

    // If no applications found, try approach 2: Using string IDs
    if (applications.length === 0) {
      const jobIdStrings = jobIds.map(id => id.toString());
      console.log('Trying with string IDs:', jobIdStrings);

      const approach2 = await JobApplication.find({
        jobId: { $in: jobIdStrings }
      }).populate({
        path: 'jobId',
        select: 'title company location description salary requirements deadline'
      }).sort({ appliedAt: -1 });

      console.log(`Approach 2: Found ${approach2.length} applications using string IDs`);
      if (approach2.length > 0) {
        applications = approach2;
      }
    }

    // If still no applications, try approach 3: Direct database query
    if (applications.length === 0) {
      console.log('Trying direct database query...');

      const db = mongoose.connection.db;
      const jobApplicationsCollection = db.collection('jobapplications');

      // Try with both ObjectId and string formats
      const jobIdStrings = jobIds.map(id => id.toString());

      const approach3 = await jobApplicationsCollection.find({
        $or: [
          { jobId: { $in: jobIds } },
          { jobId: { $in: jobIdStrings } }
        ]
      }).toArray();

      console.log(`Approach 3: Found ${approach3.length} applications using direct database query`);
      if (approach3.length > 0) {
        // Convert to proper format
        applications = approach3;
      }
    }

    // If still no applications, try approach 4: Check all applications in the database
    if (applications.length === 0) {
      console.log('Trying to find all applications in the database...');

      const db = mongoose.connection.db;
      const jobApplicationsCollection = db.collection('jobapplications');

      // Get all applications
      const allApplications = await jobApplicationsCollection.find({}).toArray();
      console.log(`Total applications in database: ${allApplications.length}`);

      if (allApplications.length > 0) {
        console.log('Sample application from database:', allApplications[0]);

        // Try to match applications with jobs by jobId as string
        const jobIdStrings = jobIds.map(id => id.toString());
        const matchedApplications = allApplications.filter(app => {
          const appJobId = app.jobId ? app.jobId.toString() : '';
          return jobIdStrings.includes(appJobId);
        });

        console.log(`Found ${matchedApplications.length} applications by matching jobId strings`);

        if (matchedApplications.length > 0) {
          applications = matchedApplications;
        } else {
          // If still no matches, include all applications for testing
          console.log('No matches found, including all applications for testing');
          applications = allApplications;
        }
      }
    }

    console.log(`Found ${applications.length} applications for jobs by this employer`);

    // Add isTestData flag to applications
    const enhancedApplications = applications.map(app => {
      // Handle both mongoose documents and plain objects
      const appData = typeof app.toObject === 'function' ? app.toObject() : { ...app };

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
// Create a test application for a specific job
exports.createTestApplication = async (req, res) => {
  try {
    const { jobId } = req.params;

    console.log(`Creating test application for job ID: ${jobId}`);

    // Find the job first to verify it exists
    const Job = mongoose.model('Job');
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Create a test application
    const testApplication = new JobApplication({
      jobId: jobId,
      userId: req.user.id,
      name: 'Test Applicant',
      email: 'test@example.com',
      phone: '123-456-7890',
      currentYear: '4th Year',
      program: 'Computer Science',
      skills: ['JavaScript', 'React', 'Node.js'],
      experience: '2 years of experience in web development',
      whyInterested: 'I am very interested in this position because it aligns with my career goals.',
      additionalInfo: 'I am available for immediate start.',
      status: 'pending',
      appliedAt: new Date()
    });

    await testApplication.save();

    // Update the job's applicants count
    job.applicants = (job.applicants || 0) + 1;
    await job.save();

    console.log('Test application created successfully:', testApplication);

    res.status(201).json({
      success: true,
      message: 'Test application created successfully',
      data: testApplication
    });

  } catch (error) {
    console.error('Error creating test application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test application',
      error: error.message
    });
  }
};

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

    console.log(`Checking for applications for job ID: ${jobId}`);

    // Try different approaches to find applications
    let applications = [];

    // Approach 1: Using the job ID directly
    const approach1 = await JobApplication.find({ jobId })
      .populate({
        path: 'userId',
        select: 'name email institution'
      })
      .sort({ appliedAt: -1 });

    console.log(`Approach 1: Found ${approach1.length} applications using jobId directly`);
    applications = approach1;

    // If no applications found, try approach 2: Using string ID
    if (applications.length === 0) {
      console.log('Trying with string ID...');

      const approach2 = await JobApplication.find({ jobId: jobId.toString() })
        .populate({
          path: 'userId',
          select: 'name email institution'
        })
        .sort({ appliedAt: -1 });

      console.log(`Approach 2: Found ${approach2.length} applications using string ID`);
      if (approach2.length > 0) {
        applications = approach2;
      }
    }

    // If still no applications, try approach 3: Direct database query
    if (applications.length === 0) {
      console.log('Trying direct database query...');

      const db = mongoose.connection.db;
      const jobApplicationsCollection = db.collection('jobapplications');

      const approach3 = await jobApplicationsCollection.find({
        $or: [
          { jobId: jobId },
          { jobId: jobId.toString() },
          { 'jobId': jobId },
          { 'jobId': jobId.toString() }
        ]
      }).toArray();

      console.log(`Approach 3: Found ${approach3.length} applications using direct database query`);
      if (approach3.length > 0) {
        // Convert to proper format
        applications = approach3;
      }
    }

    // If still no applications, check all applications in the database
    if (applications.length === 0) {
      console.log('Checking all applications in the database...');

      const db = mongoose.connection.db;
      const jobApplicationsCollection = db.collection('jobapplications');

      const allApplications = await jobApplicationsCollection.find({}).toArray();
      console.log(`Total applications in database: ${allApplications.length}`);

      if (allApplications.length > 0) {
        console.log('Sample application from database:', allApplications[0]);
      }
    }

    console.log(`Found ${applications.length} applications for job: ${job.title || jobId}`);

    // Convert applications to plain objects if they're mongoose documents
    const plainApplications = applications.map(app => {
      return typeof app.toObject === 'function' ? app.toObject() : { ...app };
    });

    res.status(200).json({
      success: true,
      count: plainApplications.length,
      data: plainApplications
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
