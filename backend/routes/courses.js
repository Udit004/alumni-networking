const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const admin = require('firebase-admin');
const notificationService = require('../services/notificationService');

// Authentication middleware - DEVELOPMENT VERSION (more permissive)
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // For development, if no token is provided, create a mock user
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No token provided, using mock user for development');
      req.user = {
        uid: 'dev-user-123',
        email: 'dev@example.com',
        role: 'teacher' // Default role for development
      };
      return next();
    }

    try {
      // Try to verify the token
      const token = authHeader.split(' ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);

      // Try to get user from Firestore
      try {
        const userRecord = await admin.firestore().collection('users').doc(decodedToken.uid).get();
        const userData = userRecord.data() || {};

        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email || userData.email,
          role: userData.role || decodedToken.role || 'teacher' // Default to teacher for development
        };
      } catch (firestoreError) {
        console.warn('Error getting user from Firestore:', firestoreError);
        // If Firestore fails, still allow the request with token data
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          role: 'teacher' // Default to teacher for development
        };
      }
    } catch (tokenError) {
      console.warn('Token verification failed, using mock user for development:', tokenError);
      // If token verification fails, still allow the request with mock data
      req.user = {
        uid: authHeader.split(' ')[1].substring(0, 20), // Use part of the token as UID
        email: 'dev@example.com',
        role: 'teacher' // Default role for development
      };
    }

    console.log('User for request:', req.user);
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    // For development, still allow the request even if authentication fails
    req.user = {
      uid: 'error-user-' + Date.now(),
      email: 'error@example.com',
      role: 'teacher'
    };
    console.log('Using fallback user due to error:', req.user);
    next();
  }
};

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

// Get courses by teacher ID
router.get('/teacher/:teacherId', authenticateToken, async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Verify the user is requesting their own courses or is an admin
    if (req.user.uid !== teacherId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const courses = await Course.find({ teacherId });
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

    // Verify the user is requesting their own courses or is an admin
    if (req.user.uid !== studentId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const courses = await Course.find({ 'students.studentId': studentId });
    res.json({ success: true, courses });
  } catch (error) {
    console.error('Error fetching student courses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student courses', error: error.message });
  }
});

// Get a specific course by ID
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

    // Send notification to all students about the new course
    try {
      await notificationService.notifyAllStudents(
        'New Course Available',
        `A new course "${course.title}" has been created by ${course.teacherName}. Check it out!`,
        'course',
        course._id.toString(),
        course.teacherId
      );
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

module.exports = router;
