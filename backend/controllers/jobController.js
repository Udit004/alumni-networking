const Job = require('../models/Job');
const admin = require('firebase-admin');

// Get all jobs
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's jobs
exports.getUserJobs = async (req, res) => {
  try {
    const userId = req.params.userId;
    const jobs = await Job.find({ creatorId: userId });
    res.status(200).json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create job
exports.createJob = async (req, res) => {
  try {
    const newJob = new Job(req.body);
    await newJob.save();

    // Send notification to all students about the new job using Firestore
    try {
      // Find all students
      const User = require('../models/user');
      const students = await User.find({ role: 'student' });
      console.log(`Found ${students.length} students to notify about the new job`);

      // Send notification to each student
      for (const student of students) {
        try {
          if (!student.firebaseUID) {
            console.log(`Skipping notification for student ${student._id} - no Firebase UID`);
            continue;
          }

          // Create notification data
          const notificationData = {
            userId: student.firebaseUID,
            title: 'New Job Opportunity',
            message: `A new job "${newJob.title}" has been posted. Check it out!`,
            type: 'job',
            itemId: newJob._id.toString(),
            createdBy: newJob.creatorId || 'system',
            read: false,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: new Date().toISOString()
          };

          // Add to Firestore
          const docRef = await admin.firestore().collection('notifications').add(notificationData);
          console.log(`Notification created for student ${student.firebaseUID} with ID: ${docRef.id}`);
        } catch (studentError) {
          console.error(`Error sending notification to student ${student.firebaseUID}:`, studentError);
          // Continue with next student even if one fails
        }
      }

      console.log(`Notifications sent to all students about the new job: ${newJob.title}`);
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError);
      // Continue even if notification fails
    }

    res.status(201).json(newJob);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get single job
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update job
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Check if user is creator
    if (job.creatorId !== req.query.firebaseUID) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedJob);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete job
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Check if user is creator
    if (job.creatorId !== req.query.firebaseUID) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};