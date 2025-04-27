const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const admin = require('../config/firebase-admin'); // Use the centralized Firebase Admin SDK

// Import the auth middleware from the central location
const { auth } = require('../middleware/auth');

// Use the imported auth middleware
const authenticateToken = auth;

// ===== SPECIAL ROUTES (MUST BE DEFINED BEFORE GENERIC ROUTES) =====

// Get all courses for the authenticated teacher
router.get('/my-courses', authenticateToken, async (req, res) => {
  try {
    const teacherId = req.user.uid;

    // Verify user is a teacher
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can access their created courses'
      });
    }

    const courses = await Course.find({ teacherId });
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('Error fetching teacher courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher courses',
      error: error.message
    });
  }
});

// Get courses by teacher ID
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    // Check if request has valid auth token
    let isAuthenticated = false;
    let userRole = null;
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        isAuthenticated = true;
        userRole = decodedToken.role;
      }
    } catch (authError) {
      console.log("Authentication error:", authError.message);
      console.log("No token provided, using mock user for development");
    }
    
    // For security, in production only allow users to fetch their own courses or admin users
    if (process.env.NODE_ENV === 'production' && isAuthenticated) {
      if (req.user.uid !== teacherId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized access' });
      }
    }
    
    const courses = await Course.find({ teacherId });
    
    // Log what we're returning
    console.log(`Found ${courses.length} courses for teacher ${teacherId}`);
    
    res.json({ success: true, courses });
  } catch (error) {
    console.error('Error fetching teacher courses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch teacher courses', error: error.message });
  }
});

// Get courses by student ID (enrolled courses)
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    console.log('Development mode:', process.env.NODE_ENV === 'development');
    console.log('User requesting courses:', req.user);
    console.log('Student ID requested:', studentId);

    // In development mode, allow all authenticated requests
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Allowing access to student courses');
    }
    // In production, verify the user is requesting their own courses or is an admin
    else if (req.user.uid !== studentId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    // Find courses where the student is enrolled
    const courses = await Course.find({ 'students.studentId': studentId });
    console.log(`Found ${courses.length} courses for student ${studentId}`);

    res.json({ success: true, courses });
  } catch (error) {
    console.error('Error fetching student courses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student courses', error: error.message });
  }
});

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json({ success: true, courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch courses', error: error.message });
  }
});

// Create a new course
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('Creating course with user role:', req.user.role);

    // For development purposes, allow any authenticated user to create courses
    // In production, uncomment the role check below
    /*
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only teachers can create courses' });
    }
    */

    // Set the teacher ID and name from the authenticated user
    const courseData = {
      ...req.body,
      teacherId: req.user.uid,
      teacherName: req.body.teacherName || req.user.name || 'Teacher'
    };

    console.log('Course data:', courseData);

    const course = new Course(courseData);
    await course.save();

    // Send notification to all students about the new course using Firestore
    try {
      // Find all students
      const User = require('../models/user');
      const students = await User.find({ role: 'student' });
      console.log(`Found ${students.length} students to notify about the new course`);

      // Import the notification service
      const notificationService = require('../services/firestoreNotificationService');

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
            title: 'New Course Available',
            message: `A new course "${course.title}" has been created by ${course.teacherName}. Check it out!`,
            type: 'course',
            itemId: course._id.toString(),
            createdBy: course.teacherId
          };

          // Use the notification service to create the notification
          const result = await notificationService.createNotification(notificationData);

          if (result.success) {
            console.log(`Notification created for student ${student.firebaseUID} with ID: ${result.id}`);
          } else {
            console.log(`Failed to create notification for student ${student.firebaseUID}: ${result.message}`);
          }
        } catch (studentError) {
          console.error(`Error sending notification to student ${student.firebaseUID}:`, studentError);
          // Continue with next student even if one fails
        }
      }

      console.log(`Notifications sent to all students about the new course: ${course.title}`);
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError);
      // Continue even if notification fails
    }

    res.status(201).json({ success: true, course });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ success: false, message: 'Failed to create course', error: error.message });
  }
});

// ===== COURSE-SPECIFIC ROUTES =====

// Get students enrolled in a specific course (teacher only)
router.get('/:id/students', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    const teacherId = req.user.uid;

    // Get the course
    const course = await Course.findById(courseId);

    // Check if course exists
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Verify the user is the course teacher or an admin
    if (course.teacherId !== teacherId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view students in this course'
      });
    }

    // Get student details for each enrolled student
    const User = require('../models/user');
    const CourseApplication = require('../models/CourseApplication');

    // Get all approved applications for this course
    const applications = await CourseApplication.find({
      courseId: courseId,
      status: 'approved'
    });

    // If no applications found, check the course.students array
    if (applications.length === 0 && course.students && course.students.length > 0) {
      // Get student details from the course.students array
      const studentPromises = course.students.map(async (student) => {
        try {
          const userDoc = await User.findOne({ firebaseUID: student.studentId });
          if (!userDoc) return null;

          return {
            studentId: student.studentId,
            studentName: student.studentName || userDoc.name || 'Unknown Student',
            studentEmail: userDoc.email || 'No email available',
            program: 'Not specified',
            currentYear: 'Not specified',
            enrolledAt: student.enrolledAt || new Date(),
            performance: Math.floor(Math.random() * 30) + 70 // Random performance between 70-100 for demo
          };
        } catch (err) {
          console.error(`Error fetching student ${student.studentId}:`, err);
          return null;
        }
      });

      const students = (await Promise.all(studentPromises)).filter(student => student !== null);

      return res.json({
        success: true,
        data: students
      });
    }

    // Get student details for each application
    const studentPromises = applications.map(async (application) => {
      try {
        const userDoc = await User.findOne({ firebaseUID: application.studentId });
        if (!userDoc) return null;

        return {
          studentId: application.studentId,
          studentName: userDoc.name || 'Unknown Student',
          studentEmail: userDoc.email || 'No email available',
          program: application.program || 'Not specified',
          currentYear: application.currentYear || 'Not specified',
          enrolledAt: application.updatedAt || application.createdAt || new Date(),
          performance: Math.floor(Math.random() * 30) + 70 // Random performance between 70-100 for demo
        };
      } catch (err) {
        console.error(`Error fetching student for application ${application._id}:`, err);
        return null;
      }
    });

    const students = (await Promise.all(studentPromises)).filter(student => student !== null);

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Error fetching course students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course students',
      error: error.message
    });
  }
});

// Enroll a student in a course
router.post('/:id/enroll', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, studentName } = req.body;

    // Verify the user is enrolling themselves or is an admin
    if (req.user.uid !== studentId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to enroll' });
    }

    const course = await Course.findById(id);

    // Check if course exists
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if course is active
    if (course.status !== 'active' && course.status !== 'upcoming') {
      return res.status(400).json({ success: false, message: 'Cannot enroll in a completed course' });
    }

    // Check if course is full
    if (course.students.length >= course.maxStudents) {
      return res.status(400).json({ success: false, message: 'Course is full' });
    }

    // Check if student is already enrolled
    if (course.students.some(student => student.studentId === studentId)) {
      return res.status(400).json({ success: false, message: 'Student already enrolled' });
    }

    // Add student to the course
    course.students.push({ studentId, studentName, enrolledAt: Date.now() });
    await course.save();

    res.json({ success: true, message: 'Enrolled successfully', course });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ success: false, message: 'Failed to enroll in course', error: error.message });
  }
});

// Unenroll a student from a course
router.post('/:id/unenroll', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;

    // Verify the user is unenrolling themselves, is the teacher, or is an admin
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (req.user.uid !== studentId && req.user.uid !== course.teacherId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to unenroll' });
    }

    // Remove student from the course
    course.students = course.students.filter(student => student.studentId !== studentId);
    await course.save();

    res.json({ success: true, message: 'Unenrolled successfully', course });
  } catch (error) {
    console.error('Error unenrolling from course:', error);
    res.status(500).json({ success: false, message: 'Failed to unenroll from course', error: error.message });
  }
});

// Add course material
router.post('/:id/materials', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const material = req.body;

    const course = await Course.findById(id);

    // Check if course exists
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Verify the user is the course teacher or an admin
    if (req.user.uid !== course.teacherId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to add materials' });
    }

    // Add material to the course
    course.materials.push({
      ...material,
      id: Date.now().toString(),
      createdAt: Date.now()
    });

    await course.save();

    res.json({ success: true, message: 'Material added successfully', course });
  } catch (error) {
    console.error('Error adding course material:', error);
    res.status(500).json({ success: false, message: 'Failed to add course material', error: error.message });
  }
});

// Remove course material
router.delete('/:id/materials/:materialId', authenticateToken, async (req, res) => {
  try {
    const { id, materialId } = req.params;

    const course = await Course.findById(id);

    // Check if course exists
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Verify the user is the course teacher or an admin
    if (req.user.uid !== course.teacherId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to remove materials' });
    }

    // Remove material from the course
    course.materials = course.materials.filter(material => material.id !== materialId);
    await course.save();

    res.json({ success: true, message: 'Material removed successfully', course });
  } catch (error) {
    console.error('Error removing course material:', error);
    res.status(500).json({ success: false, message: 'Failed to remove course material', error: error.message });
  }
});

// Update a course
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    // Check if course exists
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Verify the user is the course teacher or an admin
    if (req.user.uid !== course.teacherId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this course' });
    }

    // Update the course
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.json({ success: true, course: updatedCourse });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ success: false, message: 'Failed to update course', error: error.message });
  }
});

// Delete a course
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    // Check if course exists
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Verify the user is the course teacher or an admin
    if (req.user.uid !== course.teacherId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this course' });
    }

    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ success: false, message: 'Failed to delete course', error: error.message });
  }
});

// Get a specific course by ID (THIS MUST BE THE LAST ROUTE)
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.json({ success: true, course });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch course', error: error.message });
  }
});

module.exports = router;
