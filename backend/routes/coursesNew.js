const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// Import the centralized authentication middleware
const { protect: authenticateToken, attemptAuth } = require('../middleware/authMiddleware');

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
router.get('/teacher/:teacherId', authenticateToken, async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Log detailed information for debugging
    console.log(`Accessing teacher courses with:
      - Requested teacherId: ${teacherId}
      - User in request: ${JSON.stringify(req.user)}
    `);

    // Verify the user is requesting their own courses or is an admin
    // Check both uid and id properties for compatibility
    const userIdMatches = (req.user.uid === teacherId || req.user.id === teacherId);
    const isAdmin = (req.user.role === 'admin');

    if (!userIdMatches && !isAdmin) {
      console.log(`Unauthorized access attempt:
        - Requested teacherId: ${teacherId}
        - User ID: ${req.user.id || req.user.uid}
        - User role: ${req.user.role}
      `);
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access',
        details: 'You can only view your own created courses'
      });
    }

    // For development/debugging, log the query we're about to execute
    console.log(`Searching for courses with teacherId: ${teacherId}`);

    // Find courses created by this teacher
    const courses = await Course.find({ teacherId });

    console.log(`Found ${courses.length} courses for teacher ${teacherId}`);

    // Return the courses
    res.json({
      success: true,
      count: courses.length,
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

// Get courses by student ID (enrolled courses)
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Log detailed information for debugging
    console.log(`Accessing student courses with:
      - Requested studentId: ${studentId}
      - User in request: ${JSON.stringify(req.user)}
    `);

    // Verify the user is requesting their own courses or is an admin
    // Check both uid and id properties for compatibility
    const userIdMatches = (req.user.uid === studentId || req.user.id === studentId);
    const isAdmin = (req.user.role === 'admin');

    if (!userIdMatches && !isAdmin) {
      console.log(`Unauthorized access attempt:
        - Requested studentId: ${studentId}
        - User ID: ${req.user.id || req.user.uid}
        - User role: ${req.user.role}
      `);
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access',
        details: 'You can only view your own enrolled courses'
      });
    }

    // For development/debugging, log the query we're about to execute
    console.log(`Searching for courses with students.studentId: ${studentId}`);

    // Find courses where the student is enrolled
    const courses = await Course.find({ 'students.studentId': studentId });

    console.log(`Found ${courses.length} courses for student ${studentId}`);

    // Return the courses
    res.json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    console.error('Error fetching student courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student courses',
      error: error.message
    });
  }
});

// Get all courses
router.get('/', attemptAuth, async (req, res) => {
  try {
    let courses;

    // If user is authenticated, we can show more details
    if (req.user) {
      console.log(`Fetching courses for authenticated user: ${req.user.id} with role ${req.user.role}`);

      // If user is a teacher, show their courses with full details
      if (req.user.role === 'teacher') {
        courses = await Course.find({ teacherId: req.user.id });
        console.log(`Found ${courses.length} courses for teacher ${req.user.id}`);
      }
      // If user is a student, show all courses but mark which ones they're enrolled in
      else if (req.user.role === 'student') {
        courses = await Course.find();

        // Mark courses the student is enrolled in
        courses = courses.map(course => {
          const isEnrolled = course.students.some(student => student.studentId === req.user.id);
          return {
            ...course.toObject(),
            isEnrolled
          };
        });

        console.log(`Found ${courses.length} courses, marking enrollment for student ${req.user.id}`);
      }
      // For admin or other roles, show all courses
      else {
        courses = await Course.find();
        console.log(`Found ${courses.length} courses for user with role ${req.user.role}`);
      }
    }
    // For unauthenticated users, show limited course info
    else {
      console.log('Fetching courses for unauthenticated user');
      courses = await Course.find({}, {
        title: 1,
        description: 1,
        teacherName: 1,
        startDate: 1,
        endDate: 1,
        status: 1,
        category: 1,
        tags: 1,
        thumbnail: 1
      });
      console.log(`Found ${courses.length} courses (limited info for public view)`);
    }

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

    // Notification code removed to avoid Firestore authentication issues
    console.log(`Course created: ${course.title} - Skipping Firestore notifications`);

    res.status(201).json({ success: true, course });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ success: false, message: 'Failed to create course', error: error.message });
  }
});

// ===== COURSE-SPECIFIC ROUTES =====

// Import MongoDB utilities
const { createIdQuery, isValidObjectId } = require('../utils/mongoUtils');

// Get students enrolled in a specific course (teacher only)
router.get('/:id/students', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id || req.user.uid;

    // Log detailed information for debugging
    console.log(`Fetching students for course:
      - Course ID: ${courseId}
      - User in request: ${JSON.stringify(req.user)}
    `);

    // Create a safe query that handles both ObjectId and string IDs
    const courseQuery = createIdQuery(courseId);

    // Get the course
    const course = await Course.findOne(courseQuery);

    // Check if course exists
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Verify the user is the course teacher or an admin
    // Check both uid and id properties for compatibility
    const isTeacher = (course.teacherId === req.user.uid || course.teacherId === req.user.id);
    const isAdmin = (req.user.role === 'admin');

    if (!isTeacher && !isAdmin) {
      console.log(`Unauthorized attempt to view students:
        - Course ID: ${courseId}
        - Course Teacher ID: ${course.teacherId}
        - User ID: ${userId}
        - User role: ${req.user.role}
      `);
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view students in this course',
        details: 'Only the course teacher or an admin can view enrolled students'
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

    // Log detailed information for debugging
    console.log(`Enrolling student in course:
      - Course ID: ${id}
      - Student ID: ${studentId}
      - Student Name: ${studentName}
      - User in request: ${JSON.stringify(req.user)}
    `);

    // Verify the user is enrolling themselves or is an admin
    // Check both uid and id properties for compatibility
    const userIdMatches = (req.user.uid === studentId || req.user.id === studentId);
    const isAdmin = (req.user.role === 'admin');

    if (!userIdMatches && !isAdmin) {
      console.log(`Unauthorized enrollment attempt:
        - Student ID: ${studentId}
        - User ID: ${req.user.id || req.user.uid}
        - User role: ${req.user.role}
      `);
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to enroll',
        details: 'You can only enroll yourself in courses'
      });
    }

    // Create a safe query that handles both ObjectId and string IDs
    const courseQuery = createIdQuery(id);
    const course = await Course.findOne(courseQuery);

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

    // Log detailed information for debugging
    console.log(`Unenrolling student from course:
      - Course ID: ${id}
      - Student ID: ${studentId}
      - User in request: ${JSON.stringify(req.user)}
    `);

    // Create a safe query that handles both ObjectId and string IDs
    const courseQuery = createIdQuery(id);
    const course = await Course.findOne(courseQuery);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Verify the user is unenrolling themselves, is the teacher, or is an admin
    // Check both uid and id properties for compatibility
    const isStudent = (req.user.uid === studentId || req.user.id === studentId);
    const isTeacher = (req.user.uid === course.teacherId || req.user.id === course.teacherId);
    const isAdmin = (req.user.role === 'admin');

    if (!isStudent && !isTeacher && !isAdmin) {
      console.log(`Unauthorized unenrollment attempt:
        - Student ID: ${studentId}
        - User ID: ${req.user.id || req.user.uid}
        - Teacher ID: ${course.teacherId}
        - User role: ${req.user.role}
      `);
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to unenroll',
        details: 'You can only unenroll yourself, or as a teacher/admin, unenroll students from your courses'
      });
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

    // Create a safe query that handles both ObjectId and string IDs
    const courseQuery = createIdQuery(id);
    const course = await Course.findOne(courseQuery);

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

    // Create a safe query that handles both ObjectId and string IDs
    const courseQuery = createIdQuery(id);
    const course = await Course.findOne(courseQuery);

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
    // Log detailed information for debugging
    console.log(`Updating course:
      - Course ID: ${req.params.id}
      - User in request: ${JSON.stringify(req.user)}
    `);

    // Create a safe query that handles both ObjectId and string IDs
    const courseQuery = createIdQuery(req.params.id);
    const course = await Course.findOne(courseQuery);

    // Check if course exists
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Verify the user is the course teacher or an admin
    // Check both uid and id properties for compatibility
    const isTeacher = (req.user.uid === course.teacherId || req.user.id === course.teacherId);
    const isAdmin = (req.user.role === 'admin');

    if (!isTeacher && !isAdmin) {
      console.log(`Unauthorized course update attempt:
        - Course ID: ${req.params.id}
        - Course Teacher ID: ${course.teacherId}
        - User ID: ${req.user.id || req.user.uid}
        - User role: ${req.user.role}
      `);
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this course',
        details: 'Only the course teacher or an admin can update this course'
      });
    }

    // Update the course
    // Use findOneAndUpdate with our safe query instead of findByIdAndUpdate
    const updatedCourse = await Course.findOneAndUpdate(
      courseQuery, // Use the same query we used to find the course
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
    // Create a safe query that handles both ObjectId and string IDs
    const courseQuery = createIdQuery(req.params.id);
    const course = await Course.findOne(courseQuery);

    // Check if course exists
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Verify the user is the course teacher or an admin
    if (req.user.uid !== course.teacherId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this course' });
    }

    // Use findOneAndDelete with our safe query instead of findByIdAndDelete
    await Course.findOneAndDelete(courseQuery);
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ success: false, message: 'Failed to delete course', error: error.message });
  }
});

// Get a specific course by ID (THIS MUST BE THE LAST ROUTE)
router.get('/:id', attemptAuth, async (req, res) => {
  try {
    // Create a safe query that handles both ObjectId and string IDs
    const courseQuery = createIdQuery(req.params.id);
    const course = await Course.findOne(courseQuery);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // If user is authenticated, we can show more details
    if (req.user) {
      console.log(`Fetching course ${req.params.id} for authenticated user: ${req.user.id || req.user.uid} with role ${req.user.role}`);

      // Add user-specific data
      let courseData = course.toObject();

      // If user is a student, check if they're enrolled
      // Check both id and uid properties for compatibility
      const userId = req.user.id || req.user.uid;

      if (req.user.role === 'student') {
        courseData.isEnrolled = course.students.some(student =>
          student.studentId === userId || student.studentId === req.user.id || student.studentId === req.user.uid
        );
      }

      // If user is the teacher of this course or an admin, add additional data
      // Check both id and uid properties for compatibility
      const isTeacher = (userId === course.teacherId);
      const isAdmin = (req.user.role === 'admin');

      if (isTeacher || isAdmin) {
        courseData.isTeacher = true;
      }

      return res.json({ success: true, course: courseData });
    }

    // For unauthenticated users, show limited course info
    console.log(`Fetching course ${req.params.id} for unauthenticated user`);
    const limitedCourse = {
      _id: course._id,
      title: course.title,
      description: course.description,
      teacherName: course.teacherName,
      startDate: course.startDate,
      endDate: course.endDate,
      status: course.status,
      category: course.category,
      tags: course.tags,
      thumbnail: course.thumbnail
    };

    res.json({ success: true, course: limitedCourse });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch course', error: error.message });
  }
});

module.exports = router;
