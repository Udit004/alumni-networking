const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Course = mongoose.model('Course');
const { auth } = require('../middleware/auth');

// Get teacher profile by ID
router.get('/:teacherId', auth, async (req, res) => {
  try {
    const { teacherId } = req.params;
    console.log(`Fetching teacher profile for ID: ${teacherId}`);

    // In development mode, create a mock response
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Returning mock teacher data');
      return res.json({
        success: true,
        teacher: {
          _id: teacherId,
          name: 'Demo Teacher',
          email: 'teacher@example.com',
          role: 'teacher',
          department: 'Computer Science',
          institution: 'Demo University',
          designation: 'Professor',
          expertise: ['Web Development', 'Machine Learning', 'Data Science'],
          bio: 'Experienced educator with a passion for teaching technology.',
          officeHours: ['Monday 10-12', 'Wednesday 2-4'],
          officeLocation: 'Building A, Room 101',
          researchInterests: 'AI, Web Technologies, Education',
          coursesTaught: 'Web Development, Data Structures, Algorithms',
          certifications: ['Certified Educator', 'Web Development Expert']
        }
      });
    }

    // Find the teacher in the database
    const teacher = await User.findOne({ firebaseUID: teacherId, role: 'teacher' });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Return the teacher profile
    res.json({
      success: true,
      teacher: {
        _id: teacher._id,
        firebaseUID: teacher.firebaseUID,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role,
        department: teacher.department,
        institution: teacher.institution,
        designation: teacher.designation,
        expertise: teacher.expertise || [],
        bio: teacher.bio,
        officeHours: teacher.officeHours || [],
        officeLocation: teacher.officeLocation,
        researchInterests: teacher.researchInterests,
        coursesTaught: teacher.coursesTaught,
        certifications: teacher.certifications || []
      }
    });
  } catch (error) {
    console.error('Error fetching teacher profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher profile',
      error: error.message
    });
  }
});

// Get all courses for a teacher
router.get('/:teacherId/courses', auth, async (req, res) => {
  try {
    const { teacherId } = req.params;
    console.log(`Fetching courses for teacher ID: ${teacherId}`);

    // In development mode, create a mock response
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Returning mock courses data');
      return res.json({
        success: true,
        courses: [
          {
            _id: '1',
            title: 'Web Development Fundamentals',
            description: 'Learn the basics of web development',
            startDate: new Date(),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            capacity: 30,
            enrolledStudents: 15
          },
          {
            _id: '2',
            title: 'Advanced JavaScript',
            description: 'Master JavaScript programming',
            startDate: new Date(),
            endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            capacity: 25,
            enrolledStudents: 20
          }
        ]
      });
    }

    // Find all courses created by this teacher
    const courses = await Course.find({ teacherId });

    res.json({
      success: true,
      courses
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

module.exports = router;
