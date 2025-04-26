const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { auth } = require('../middleware/auth');
const Course = require('../models/Course');
const CourseApplication = require('../models/CourseApplication');
const User = require('../models/user');
const { insertDocument } = require('../utils/directDbInsert');

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');
    
    res.status(200).json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message
    });
  }
});

// Get courses created by the authenticated teacher
router.get('/teacher', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Verify user is a teacher
    const user = await User.findById(userId);
    if (!user || user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can access their created courses'
      });
    }
    
    const courses = await Course.find({ createdBy: userId })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching teacher courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher courses',
      error: error.message
    });
  }
});

// Get a specific course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course',
      error: error.message
    });
  }
});

// Create a new course (teacher only)
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Verify user is a teacher
    const user = await User.findById(userId);
    if (!user || user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can create courses'
      });
    }
    
    const { title, description, startDate, endDate, capacity, prerequisites } = req.body;
    
    const newCourse = new Course({
      title,
      description,
      startDate,
      endDate,
      capacity,
      prerequisites,
      createdBy: userId,
      createdByName: user.name
    });
    
    await newCourse.save();
    
    // Create activity for course creation
    try {
      const activityData = {
        userId,
        type: 'course_creation',
        title: 'Created a new course',
        description: `You created a new course: ${title}`,
        relatedItemId: newCourse._id.toString(),
        relatedItemType: 'course',
        relatedItemName: title,
        isRead: false,
        createdAt: new Date()
      };
      
      await insertDocument('activities', activityData);
    } catch (activityError) {
      console.error('Error creating course creation activity:', activityError);
      // Continue with the response even if activity creation fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: newCourse
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message
    });
  }
});

// Update a course (teacher only)
router.put('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;
    
    // Verify user is a teacher
    const user = await User.findById(userId);
    if (!user || user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can update courses'
      });
    }
    
    // Check if the course exists and belongs to the teacher
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    if (course.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own courses'
      });
    }
    
    const { title, description, startDate, endDate, capacity, prerequisites } = req.body;
    
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        title,
        description,
        startDate,
        endDate,
        capacity,
        prerequisites
      },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: error.message
    });
  }
});

// Delete a course (teacher only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;
    
    // Verify user is a teacher
    const user = await User.findById(userId);
    if (!user || user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can delete courses'
      });
    }
    
    // Check if the course exists and belongs to the teacher
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    if (course.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own courses'
      });
    }
    
    // Delete the course
    await Course.findByIdAndDelete(courseId);
    
    // Also delete all applications for this course
    await CourseApplication.deleteMany({ courseId });
    
    res.status(200).json({
      success: true,
      message: 'Course and related applications deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: error.message
    });
  }
});

// Get students enrolled in a specific course (teacher only)
router.get('/:id/students', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;
    
    // Verify user is a teacher
    const user = await User.findById(userId);
    if (!user || user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can view enrolled students'
      });
    }
    
    // Check if the course exists and belongs to the teacher
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    if (course.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view students in your own courses'
      });
    }
    
    // Get all approved applications for this course
    const applications = await CourseApplication.find({
      courseId,
      status: 'approved'
    });
    
    // Get student details for each application
    const studentPromises = applications.map(async (application) => {
      const student = await User.findById(application.userId);
      if (!student) return null;
      
      return {
        studentId: student._id,
        studentName: student.name,
        studentEmail: student.email,
        program: application.program,
        currentYear: application.currentYear,
        enrolledAt: application.updatedAt || application.createdAt,
        applicationId: application._id
      };
    });
    
    const students = (await Promise.all(studentPromises)).filter(student => student !== null);
    
    res.status(200).json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Error fetching enrolled students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrolled students',
      error: error.message
    });
  }
});

// Get all students enrolled in any of the teacher's courses
router.get('/students', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Verify user is a teacher
    const user = await User.findById(userId);
    if (!user || user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can view enrolled students'
      });
    }
    
    // Get all courses created by this teacher
    const courses = await Course.find({ createdBy: userId });
    const courseIds = courses.map(course => course._id);
    
    // Get all approved applications for these courses
    const applications = await CourseApplication.find({
      courseId: { $in: courseIds },
      status: 'approved'
    });
    
    // Group applications by course
    const courseApplications = {};
    courseIds.forEach(courseId => {
      courseApplications[courseId] = applications.filter(app => 
        app.courseId.toString() === courseId.toString()
      );
    });
    
    // Get student details for each course
    const courseStudentsPromises = Object.keys(courseApplications).map(async (courseId) => {
      const courseApps = courseApplications[courseId];
      const course = courses.find(c => c._id.toString() === courseId);
      
      const studentPromises = courseApps.map(async (application) => {
        const student = await User.findById(application.userId);
        if (!student) return null;
        
        return {
          studentId: student._id,
          studentName: student.name,
          studentEmail: student.email,
          program: application.program,
          currentYear: application.currentYear,
          enrolledAt: application.updatedAt || application.createdAt,
          applicationId: application._id,
          courseId: courseId,
          courseName: course ? course.title : 'Unknown Course'
        };
      });
      
      return {
        courseId,
        courseName: course ? course.title : 'Unknown Course',
        students: (await Promise.all(studentPromises)).filter(student => student !== null)
      };
    });
    
    const courseStudents = await Promise.all(courseStudentsPromises);
    
    res.status(200).json({
      success: true,
      data: courseStudents
    });
  } catch (error) {
    console.error('Error fetching all enrolled students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch all enrolled students',
      error: error.message
    });
  }
});

module.exports = router;
