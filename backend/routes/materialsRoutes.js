const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const admin = require('../config/firebase-admin');
const path = require('path');
const fs = require('fs');

// Try to load multer, but don't fail if it's not available
let upload;
try {
  const multer = require('multer');
  const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      const uploadDir = path.join(__dirname, '../uploads');
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  });
  upload = multer({ storage: storage });
  console.log('Multer loaded successfully');
} catch (err) {
  console.warn('Multer not available, file uploads will be disabled:', err.message);
  // Create a mock upload middleware that does nothing
  upload = {
    single: () => (req, res, next) => {
      console.log('Mock upload middleware called - file uploads are disabled');
      next();
    }
  };
}

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // If no token is provided, create a mock user for development
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No token provided, using mock user for development');
      req.user = {
        uid: 'dev-user-123',
        email: 'dev@example.com',
        role: 'teacher'
      };
      return next();
    }

    // Extract token from Authorization header
    const token = authHeader.split(' ')[1];

    try {
      // Verify the token with Firebase
      const decodedToken = await admin.auth().verifyIdToken(token);

      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role || 'teacher'
      };

      next();
    } catch (tokenError) {
      console.warn('Token verification failed:', tokenError);

      // For development, still allow the request with a mock user
      if (process.env.NODE_ENV !== 'production') {
        req.user = {
          uid: 'dev-user-123',
          email: 'dev@example.com',
          role: 'teacher'
        };
        return next();
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token'
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);

    // For development, still allow the request
    if (process.env.NODE_ENV !== 'production') {
      req.user = {
        uid: 'dev-user-123',
        email: 'dev@example.com',
        role: 'teacher'
      };
      return next();
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Get all materials for a teacher across all their courses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const teacherId = req.user.uid;
    console.log('Fetching materials for teacher:', teacherId);

    // Find all courses taught by this teacher
    const courses = await Course.find({ teacherId }).lean();

    console.log(`Found ${courses.length} courses for teacher ${teacherId}`);

    if (!courses || courses.length === 0) {
      return res.json({ success: true, materials: [] });
    }

    // Extract and flatten all materials from all courses
    const allMaterials = courses.reduce((materials, course) => {
      const courseMaterials = (course.materials || []).map(material => ({
        ...material,
        courseId: course._id,
        courseTitle: course.title
      }));
      return [...materials, ...courseMaterials];
    }, []);

    console.log(`Found ${allMaterials.length} total materials across all courses`);

    res.json({ success: true, materials: allMaterials });
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch materials', error: error.message });
  }
});

// Get a specific material by ID
router.get('/:materialId', authenticateToken, async (req, res) => {
  try {
    const { materialId } = req.params;
    const teacherId = req.user.uid;

    console.log(`Fetching material ${materialId} for teacher ${teacherId}`);

    // Find all courses taught by this teacher
    const courses = await Course.find({ teacherId });

    // Find the course that contains this material
    let material = null;
    let foundCourse = null;

    for (const course of courses) {
      const foundMaterial = (course.materials || []).find(m => m.id === materialId);
      if (foundMaterial) {
        material = { ...foundMaterial.toObject(), courseId: course._id, courseTitle: course.title };
        foundCourse = course;
        break;
      }
    }

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    console.log('Found material:', material.title);

    res.json({ success: true, material, course: foundCourse });
  } catch (error) {
    console.error('Error fetching material:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch material', error: error.message });
  }
});

// Add a new material with file upload
router.post('/', upload.single('file'), async (req, res) => {
  try {
    console.log('Adding new material, request body:', req.body);
    console.log('File upload:', req.file ? req.file.originalname : 'No file uploaded');

    const { courseId, title, description, type } = req.body;

    // Try to get user from auth token
    let teacherId = null;
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split('Bearer ')[1];
        console.log('Got authorization token, verifying...');
        const decodedToken = await admin.auth().verifyIdToken(token);
        teacherId = decodedToken.uid;
        console.log('Verified token for teacher:', teacherId);
      }
    } catch (authError) {
      console.error("Authentication error:", authError);
    }

    // Fallback for development - get teacher ID from query params
    if (!teacherId && req.query.firebaseUID) {
      teacherId = req.query.firebaseUID;
      console.log("Using teacher ID from query parameter:", teacherId);
    }

    if (!teacherId) {
      // Remove uploaded file if no teacher ID available
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid token or firebaseUID in development mode.'
      });
    }

    if (!courseId || !title) {
      // Remove uploaded file if request is invalid
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ success: false, message: 'Course ID and material title are required' });
    }

    console.log(`Validated request. Finding course ${courseId} for teacher ${teacherId}`);

    // Find the course
    const course = await Course.findById(courseId);

    if (!course) {
      // Remove uploaded file if course not found
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      console.log(`Course ${courseId} not found`);
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    console.log(`Found course: ${course.title}`);

    // Verify the user is the course teacher
    if (course.teacherId !== teacherId) {
      // Remove uploaded file if unauthorized
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      console.log(`Unauthorized: Course teacher is ${course.teacherId}, request teacher is ${teacherId}`);
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to add materials to this course',
        courseTeacherId: course.teacherId,
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

      // Generate server URL from request
      const protocol = req.protocol;
      const host = req.get('host');
      const baseUrl = `${protocol}://${host}`;

      newMaterial.fileName = req.file.originalname;
      newMaterial.fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
      newMaterial.filePath = req.file.path;
      newMaterial.fileSize = req.file.size;
      newMaterial.mimeType = req.file.mimetype;

      console.log(`File URL will be: ${newMaterial.fileUrl}`);
    }

    // Add icon and color based on material type
    newMaterial.icon = getIconForType(newMaterial.type);
    newMaterial.color = getColorForType(newMaterial.type);

    console.log(`Adding new material "${newMaterial.title}" to course using addMaterial method`);
    console.log('Material data:', newMaterial);

    // Use the new addMaterial method instead of directly modifying the array
    try {
      await course.addMaterial(newMaterial);

      // Fetch the updated course to ensure the material was added
      const updatedCourse = await Course.findById(courseId);
      const materials = updatedCourse.materials || [];

      console.log(`Course saved successfully. Now has ${materials.length} materials`);
      if (materials.length > 0) {
        console.log(`Last material in array: ${materials[materials.length-1].title}`);
      }

      // Find the added material to return it
      const addedMaterial = materials.find(m => m.id === newMaterial.id);
      if (!addedMaterial) {
        console.warn("Warning: Material was not found in the course after saving");
      }

      res.status(201).json({
        success: true,
        message: 'Material added successfully',
        material: {
          ...addedMaterial?.toObject() || newMaterial,
          courseId: course._id,
          courseTitle: course.title
        }
      });
    } catch (saveError) {
      console.error("Error saving course with new material:", saveError);

      // Check if it's a validation error
      if (saveError.name === 'ValidationError') {
        // Remove uploaded file if validation fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          success: false,
          message: 'Validation error: ' + saveError.message,
          validationErrors: saveError.errors
        });
      }

      throw saveError; // Rethrow for the outer catch block
    }
  } catch (error) {
    // Remove uploaded file if error occurs
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error removing file after failed upload:', unlinkError);
      }
    }
    console.error('Error adding material:', error);
    res.status(500).json({ success: false, message: 'Failed to add material', error: error.message });
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
    let filePath = null;
    let courseSaved = null;

    for (const course of courses) {
      // First check if the material exists in this course
      const foundMaterial = course.materials.find(m => m.id === materialId);

      if (foundMaterial) {
        console.log(`Found material "${foundMaterial.title}" in course "${course.title}". Preparing to remove...`);

        // Store file path if exists before removing
        if (foundMaterial.filePath) {
          filePath = foundMaterial.filePath;
        }

        // Use MongoDB's atomic operations for more reliable updates
        try {
          // Find the material by id and pull it from the array
          const updateResult = await Course.updateOne(
            { _id: course._id },
            { $pull: { materials: { id: materialId } } }
          );

          console.log('MongoDB update result:', updateResult);

          if (updateResult.modifiedCount > 0) {
            materialDeleted = true;
            courseSaved = course._id;
            console.log(`Material removed from course ${course.title} (MongoDB atomic operation)`);
          } else {
            console.warn(`Material not found in course or not removed (MongoDB atomic operation)`);
          }
        } catch (updateError) {
          console.error('Error using atomic operation to remove material:', updateError);

          // Fallback to traditional approach
          console.log('Falling back to traditional approach...');
          const materialIndex = course.materials.findIndex(m => m.id === materialId);

          if (materialIndex >= 0) {
            // Remove the material
            course.materials.splice(materialIndex, 1);
            await course.save();
            materialDeleted = true;
            courseSaved = course._id;
            console.log(`Material removed from course ${course.title} (traditional approach)`);
          }
        }

        break; // Exit the loop once we've found and processed the material
      }
    }

    if (!materialDeleted) {
      console.log(`Material ${materialId} not found for teacher ${teacherId}`);
      return res.status(404).json({ success: false, message: 'Material not found or unauthorized' });
    }

    // Fetch the updated course to verify deletion
    if (courseSaved) {
      const updatedCourse = await Course.findById(courseSaved);
      console.log(`Course now has ${updatedCourse.materials.length} materials`);
    }

    // Remove the file if it exists
    if (filePath && fs.existsSync(filePath)) {
      console.log(`Removing file: ${filePath}`);
      fs.unlinkSync(filePath);
    }

    console.log('Material deleted successfully');
    res.json({ success: true, message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ success: false, message: 'Failed to delete material', error: error.message });
  }
});

// Update a material
router.put('/:materialId', authenticateToken, async (req, res) => {
  try {
    const { materialId } = req.params;
    const { updatedMaterial } = req.body;
    const teacherId = req.user.uid;

    console.log(`Updating material ${materialId} for teacher ${teacherId}`);
    console.log('Update data:', updatedMaterial);

    if (!updatedMaterial) {
      return res.status(400).json({ success: false, message: 'Updated material data is required' });
    }

    // Find courses taught by this teacher
    const courses = await Course.find({ teacherId });

    // Find which course has this material
    let materialUpdated = false;

    for (const course of courses) {
      const materialIndex = (course.materials || []).findIndex(m => m.id === materialId);
      if (materialIndex >= 0) {
        console.log(`Found material in course ${course.title}. Updating...`);

        // Update the material
        course.materials[materialIndex] = {
          ...course.materials[materialIndex].toObject(),
          ...updatedMaterial,
          id: materialId, // Ensure ID doesn't change
          updatedAt: new Date()
        };
        await course.save();
        materialUpdated = true;

        console.log('Material updated successfully');
        break;
      }
    }

    if (!materialUpdated) {
      console.log(`Material ${materialId} not found for teacher ${teacherId}`);
      return res.status(404).json({ success: false, message: 'Material not found or unauthorized' });
    }

    res.json({ success: true, message: 'Material updated successfully' });
  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({ success: false, message: 'Failed to update material', error: error.message });
  }
});

// Get all materials for a specific course
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

// Helper function to get icon for material type
function getIconForType(type) {
  switch(type) {
    case 'notes': return '📝';
    case 'assignment': return '📋';
    case 'template': return '🎯';
    case 'quiz': return '✍️';
    case 'lab': return '🔬';
    case 'guide': return '📖';
    default: return '📄';
  }
}

// Helper function to get color for material type
function getColorForType(type) {
  switch(type) {
    case 'notes': return 'blue';
    case 'assignment': return 'purple';
    case 'template': return 'yellow';
    case 'quiz': return 'red';
    case 'lab': return 'indigo';
    case 'guide': return 'teal';
    default: return 'gray';
  }
}

module.exports = router;