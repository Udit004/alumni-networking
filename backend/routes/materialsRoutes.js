const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const admin = require('../config/firebase-admin');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Helper functions for material types
const getIconForType = (type) => {
  switch(type) {
    case 'notes': return '📝';
    case 'assignment': return '📋';
    case 'template': return '🎯';
    case 'quiz': return '✍️';
    case 'lab': return '🔬';
    case 'guide': return '📖';
    default: return '📄';
  }
};

const getColorForType = (type) => {
  switch(type) {
    case 'notes': return 'blue';
    case 'assignment': return 'green';
    case 'template': return 'purple';
    case 'quiz': return 'red';
    case 'lab': return 'yellow';
    case 'guide': return 'indigo';
    default: return 'gray';
  }
};

// Configure multer for memory storage (files stored in memory, not on disk)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB to ensure it fits in MongoDB document
  }
});

// MongoDB has a document size limit of 16MB, but we need to leave room for other fields
// and account for base64 encoding which increases size by ~33%

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    // Verify the token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Add user data to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || 'student' // Default to student if role not specified
    };

    console.log('Using token data for user:', req.user);
    console.log('User for request:', req.user);

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ success: false, message: 'Invalid or expired token', error: error.message });
  }
};

// Get all materials for a teacher
router.get('/', authenticateToken, async (req, res) => {
  try {
    const teacherId = req.user.uid;
    console.log(`Fetching materials for teacher: ${teacherId}`);

    // Find all courses taught by this teacher
    const courses = await Course.find({ teacherId });
    console.log(`Found ${courses.length} courses for teacher ${teacherId}`);

    // Extract materials from all courses
    const allMaterials = [];
    courses.forEach(course => {
      if (course.materials && course.materials.length > 0) {
        // Add course info to each material
        const courseMaterials = course.materials.map(material => ({
          ...material.toObject(),
          courseId: course._id,
          courseTitle: course.title
        }));
        allMaterials.push(...courseMaterials);
      }
    });

    console.log(`Found ${allMaterials.length} total materials across all courses`);
    res.json({ success: true, materials: allMaterials });
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch materials', error: error.message });
  }
});

// Add a new material to a course
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { courseId, title, description, type } = req.body;
    const teacherId = req.user.uid;

    console.log(`Adding material "${title}" to course ${courseId} for teacher ${teacherId}`);
    console.log('Request body:', req.body);
    console.log('File:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'No file uploaded');

    if (!courseId || !title) {
      return res.status(400).json({ success: false, message: 'Course ID and title are required' });
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      console.log(`Course ${courseId} not found`);
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Verify the teacher owns this course
    if (course.teacherId !== teacherId) {
      console.log(`Teacher ${teacherId} does not own course ${courseId} (owned by ${course.teacherId})`);
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not own this course',
        requestTeacherId: teacherId
      });
    }

    // Prepare the material object
    const newMaterial = {
      title,
      description: description || '',
      type: type || 'notes',
      id: new mongoose.Types.ObjectId().toString(), // Use MongoDB ObjectId for more uniqueness
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add file data if file was uploaded
    if (req.file) {
      console.log(`Processing uploaded file: ${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes)`);

      // Store file metadata
      newMaterial.fileName = req.file.originalname;
      newMaterial.fileSize = req.file.size;
      newMaterial.mimeType = req.file.mimetype;
      
      // Store the actual file content as base64 string
      // This allows us to store the file directly in the database
      // Check if buffer exists before trying to convert it
      if (req.file.buffer) {
        console.log(`Converting file buffer (${req.file.buffer.length} bytes) to base64`);
        newMaterial.fileContent = req.file.buffer.toString('base64');
      } else {
        console.error('No buffer found in uploaded file');
        throw new Error('File upload failed: No file data received');
      }
      
      // Generate a unique ID for the file
      const fileId = new mongoose.Types.ObjectId().toString();
      newMaterial.fileId = fileId;
      
      // Create a virtual URL for accessing the file
      // This will be handled by a special route that serves the file from the database
      const protocol = req.protocol;
      const host = req.get('host');
      
      // Always use the actual host from the request to ensure URLs work from any device
      const baseUrl = `${protocol}://${host}`;
      
      // The URL will point to a route that retrieves the file from the database
      newMaterial.fileUrl = `${baseUrl}/api/materials/file/${fileId}`;
      
      console.log(`File stored directly in database. Virtual URL: ${newMaterial.fileUrl}`);
      console.log(`File details:
        - Original name: ${req.file.originalname}
        - Size: ${req.file.size} bytes
        - Type: ${req.file.mimetype}
        - Content stored as base64 in database
        - Virtual URL: ${newMaterial.fileUrl}
      `);
    }

    // Add icon and color based on material type
    newMaterial.icon = getIconForType(newMaterial.type);
    newMaterial.color = getColorForType(newMaterial.type);

    console.log(`Adding new material "${newMaterial.title}" to course`);
    console.log('Material data:', newMaterial);

    // Add the material to the course
    if (!course.materials) {
      course.materials = [];
    }
    course.materials.push(newMaterial);
    await course.save();

    console.log(`Course saved successfully. Now has ${course.materials.length} materials`);

    res.status(201).json({
      success: true,
      message: 'Material added successfully',
      material: {
        ...newMaterial,
        courseId: course._id,
        courseTitle: course.title
      }
    });
  } catch (error) {
    // Log detailed error information
    console.error('Error adding material:', error);
    console.error('Error stack:', error.stack);
    
    // Log request information for debugging
    console.log('Request body:', req.body);
    console.log('File information:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer ? 'Buffer present' : 'No buffer'
    } : 'No file');
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add material', 
      error: error.message,
      details: error.stack
    });
  }
});

// Delete a material
router.delete('/:materialId', authenticateToken, async (req, res) => {
  try {
    const { materialId } = req.params;
    const teacherId = req.user.uid;

    console.log(`Attempting to delete material ${materialId} for teacher ${teacherId}`);

    // Find courses taught by this teacher
    const courses = await Course.find({ teacherId });

    // Find which course has this material
    let materialDeleted = false;

    for (const course of courses) {
      // First check if the material exists in this course
      const foundMaterial = course.materials.find(m => m.id === materialId);

      if (foundMaterial) {
        console.log(`Found material "${foundMaterial.title}" in course "${course.title}". Preparing to remove...`);

        // Remove the material from the course
        course.materials = course.materials.filter(m => m.id !== materialId);
        await course.save();
        materialDeleted = true;

        console.log(`Material removed from course ${course.title}`);
        break; // Exit the loop once we've found and processed the material
      }
    }

    if (!materialDeleted) {
      console.log(`Material ${materialId} not found for teacher ${teacherId}`);
      return res.status(404).json({ success: false, message: 'Material not found or unauthorized' });
    }

    // No need to delete the file separately since it's stored directly in the course document
    // When we remove the material from the course, the file content is automatically removed
    console.log('File content will be removed with the material');

    console.log('Material deleted successfully');
    res.json({ success: true, message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ success: false, message: 'Failed to delete material', error: error.message });
  }
});

// Get all materials for a specific course (for teachers)
router.get('/course/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const teacherId = req.user.uid;

    console.log(`Fetching materials for course ${courseId} (teacher ${teacherId})`);

    // Find the course
    const course = await Course.findOne({ _id: courseId, teacherId });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found or unauthorized' });
    }

    const materials = course.materials || [];
    console.log(`Found ${materials.length} materials for course ${course.title}`);

    // Add course info to each material
    const materialsWithCourseInfo = materials.map(material => ({
      ...material.toObject(),
      courseId: course._id,
      courseTitle: course.title
    }));

    res.json({ success: true, materials: materialsWithCourseInfo });
  } catch (error) {
    console.error('Error fetching course materials:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch course materials', error: error.message });
  }
});

// Get all materials for a specific course (for students)
router.get('/student/course/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.uid;

    console.log(`Fetching materials for course ${courseId} (student ${studentId})`);

    // First try to find the course with enrollment check
    let course = await Course.findOne({
      _id: courseId,
      'students.studentId': studentId
    });

    // If not found with enrollment check, try to find the course directly
    // This is more permissive for testing purposes
    if (!course) {
      console.log(`Course ${courseId} not found with student ${studentId} enrolled, trying direct lookup`);
      
      course = await Course.findById(courseId);
      
      if (course) {
        console.log(`Course found by ID: ${course.title}`);
        console.log(`Course has ${course.students.length} students.`);
        
        if (course.students.length > 0) {
          console.log(`First student in course: ${course.students[0].studentId}`);
          console.log(`All student IDs: ${course.students.map(s => s.studentId).join(', ')}`);
        }
        
        // For testing purposes, we'll allow access even if not enrolled
        console.log(`WARNING: Allowing access to course materials for testing purposes even though student is not enrolled`);
      } else {
        console.log(`Course ${courseId} does not exist at all`);
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
    }

    const materials = course.materials || [];
    console.log(`Found ${materials.length} materials for course ${course.title} for student ${studentId}`);

    // Add course info to each material and ensure icons/colors
    const materialsWithCourseInfo = materials.map(material => {
      // Convert to plain object if it's a Mongoose document
      const materialObj = material.toObject ? material.toObject() : material;
      
      // Make sure each material has an icon and color
      if (!materialObj.icon) {
        materialObj.icon = getIconForType(materialObj.type || 'notes');
      }
      if (!materialObj.color) {
        materialObj.color = getColorForType(materialObj.type || 'notes');
      }
      
      // Log file URL for debugging
      if (materialObj.fileUrl) {
        console.log(`Material ${materialObj.title} has file URL: ${materialObj.fileUrl}`);
      }
      
      return {
        ...materialObj,
        courseId: course._id,
        courseTitle: course.title
      };
    });

    res.json({ 
      success: true, 
      materials: materialsWithCourseInfo,
      course: {
        _id: course._id,
        title: course.title,
        description: course.description,
        teacherName: course.teacherName
      }
    });
  } catch (error) {
    console.error('Error fetching course materials for student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course materials',
      error: error.message
    });
  }
});

// Route to serve file content directly from the database
router.get('/file/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    console.log(`Fetching file with ID: ${fileId}`);

    // Find all courses
    const courses = await Course.find();
    let fileFound = false;

    // Search through all courses and their materials to find the file
    for (const course of courses) {
      if (!course.materials || course.materials.length === 0) continue;

      const material = course.materials.find(m => m.fileId === fileId);
      if (material && material.fileContent) {
        console.log(`Found file: ${material.fileName} in course: ${course.title}`);
        
        // Convert base64 string back to binary data
        const fileBuffer = Buffer.from(material.fileContent, 'base64');
        
        // Set appropriate headers
        res.set('Content-Type', material.mimeType || 'application/octet-stream');
        res.set('Content-Disposition', `inline; filename="${material.fileName}"`);
        res.set('Content-Length', fileBuffer.length);
        
        // Send the file data
        res.send(fileBuffer);
        fileFound = true;
        break;
      }
    }

    if (!fileFound) {
      console.log(`File with ID ${fileId} not found in any course`);
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
  } catch (error) {
    console.error('Error serving file from database:', error);
    res.status(500).json({
      success: false,
      message: 'Error serving file',
      error: error.message
    });
  }
});

module.exports = router;
