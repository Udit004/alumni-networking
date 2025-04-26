const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const CourseApplication = require('../models/CourseApplication');
const Course = require('../models/Course');
const { auth: authenticateToken } = require('../middleware/auth');
const { insertDocument } = require('../utils/directDbInsert');

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

    // Create activity for the course application using direct DB insert
    try {
      console.log('Creating course application activity for user:', uid);
      console.log('Course details:', {
        id: course._id,
        title: course.title,
        createdBy: course.createdBy,
        createdByName: course.createdByName
      });

      // Create activity data
      const activityData = {
        userId: uid,
        type: 'course_enrollment',
        title: 'Applied for a course',
        description: `You applied for ${course.title}`,
        relatedItemId: courseId,
        relatedItemType: 'course',
        relatedItemName: course.title,
        relatedUserId: course.createdBy,
        relatedUserName: course.createdByName || 'Teacher',
        status: 'pending',
        isRead: false,
        createdAt: new Date()
      };

      // Insert directly into the activities collection
      const result = await insertDocument('activities', activityData);

      if (result.success) {
        console.log('Course application activity created successfully via direct insert:', result.id);
      } else {
        console.error('Failed to create course application activity:', result.message);

        // Try a more direct approach as fallback
        try {
          const db = mongoose.connection.db;
          const collection = db.collection('activities');
          const insertResult = await collection.insertOne(activityData);

          if (insertResult.acknowledged) {
            console.log('Course application activity created successfully via raw MongoDB:', insertResult.insertedId);
          } else {
            console.error('Failed to create activity via raw MongoDB');
          }
        } catch (mongoError) {
          console.error('Error with raw MongoDB insert:', mongoError);
        }
      }
    } catch (activityError) {
      console.error('Error creating course application activity:', activityError);
      console.error('Error stack:', activityError.stack);
      // Continue with the response even if activity creation fails
    }

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
    let course;
    if (status === 'approved') {
      course = await Course.findById(application.courseId);

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
    } else if (!course) {
      // If not approved, we still need the course for the activity
      course = await Course.findById(application.courseId);
    }

    // Create activity for the course application status change
    try {
      const Activity = require('../models/Activity');
      const activityData = {
        userId: application.studentId,
        type: 'course_enrollment',
        title: status === 'approved' ? 'Course application approved' : 'Course application rejected',
        description: status === 'approved'
          ? `Your application for ${course?.title || 'the course'} has been approved`
          : `Your application for ${course?.title || 'the course'} has been rejected`,
        relatedItemId: application.courseId,
        relatedItemType: 'course',
        relatedItemName: course?.title || 'Course',
        relatedUserId: uid,
        relatedUserName: 'Teacher',
        status: status,
        isRead: false,
        createdAt: new Date()
      };

      const activity = new Activity(activityData);
      await activity.save();
      console.log('Created course application status change activity:', activity._id);
    } catch (activityError) {
      console.error('Error creating course application status change activity:', activityError);
      // Continue with the response even if activity creation fails
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
