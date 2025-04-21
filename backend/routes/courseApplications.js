const express = require('express');
const router = express.Router();
const CourseApplication = require('../models/CourseApplication');
const Course = require('../models/Course');
const { auth: authenticateToken } = require('../middleware/auth');

// Submit a new course application
router.post('/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { uid } = req.user;

    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if the student is already enrolled in the course
    const isEnrolled = course.students.some(student => student.studentId === uid);
    if (isEnrolled) {
      return res.status(400).json({ success: false, message: 'You are already enrolled in this course' });
    }

    // Check if the student has already applied for this course
    const existingApplication = await CourseApplication.findOne({
      courseId,
      studentId: uid,
      status: 'pending'
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this course. Your application is pending review.'
      });
    }

    // Create a new application
    const application = new CourseApplication({
      ...req.body,
      courseId: courseId, // Ensure courseId is set from the URL parameter
      studentId: uid, // Ensure the studentId is from the authenticated user
      status: 'pending'
    });

    console.log('Creating application with data:', {
      ...req.body,
      courseId,
      studentId: uid,
      status: 'pending'
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Error submitting course application:', error);

    // Handle duplicate key error (student already applied)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this course'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message
    });
  }
});

// Get all applications for a teacher
router.get('/teacher', authenticateToken, async (req, res) => {
  try {
    const { uid } = req.user;

    // Get all applications for courses taught by this teacher
    const applications = await CourseApplication.find({ teacherId: uid })
      .sort({ appliedAt: -1 });

    res.json({ success: true, applications });
  } catch (error) {
    console.error('Error fetching teacher applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
});

// Get all applications for a student
router.get('/student', authenticateToken, async (req, res) => {
  try {
    const { uid } = req.user;

    // Get all applications submitted by this student
    const applications = await CourseApplication.find({ studentId: uid })
      .sort({ appliedAt: -1 });

    res.json({ success: true, applications });
  } catch (error) {
    console.error('Error fetching student applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
});

// Approve or reject an application
router.put('/:applicationId', authenticateToken, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, reviewNotes } = req.body;
    const { uid } = req.user;

    // Find the application
    const application = await CourseApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Verify that the current user is the teacher for this course
    if (application.teacherId !== uid) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to review this application'
      });
    }

    // Update the application status
    application.status = status;
    application.reviewNotes = reviewNotes || '';
    application.reviewedAt = new Date();

    await application.save();

    // If approved, add the student to the course
    if (status === 'approved') {
      const course = await Course.findById(application.courseId);

      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      // Check if student is already enrolled
      const isEnrolled = course.students.some(student => student.studentId === application.studentId);

      if (!isEnrolled) {
        // Add student to the course
        course.students.push({
          studentId: application.studentId,
          studentName: application.studentName,
          studentEmail: application.studentEmail,
          enrolledAt: new Date()
        });

        await course.save();
      }
    }

    res.json({
      success: true,
      message: `Application ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      application
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application',
      error: error.message
    });
  }
});

module.exports = router;
