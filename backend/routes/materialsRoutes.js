const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const { auth, verifyToken } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');

// Get all materials for a teacher across all their courses
router.get('/', auth, async (req, res) => {
  try {
    const teacherId = req.user.uid;
    
    // Find all courses taught by this teacher
    const courses = await Course.find({ teacherId }).lean();
    
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
    
    res.json({ success: true, materials: allMaterials });
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch materials', error: error.message });
  }
});

// Get a specific material by ID
router.get('/:materialId', auth, async (req, res) => {
  try {
    const { materialId } = req.params;
    const teacherId = req.user.uid;
    
    // Find all courses taught by this teacher
    const courses = await Course.find({ teacherId });
    
    // Find the course that contains this material
    let material = null;
    let foundCourse = null;
    
    for (const course of courses) {
      const foundMaterial = (course.materials || []).find(m => m.id === materialId);
      if (foundMaterial) {
        material = { ...foundMaterial, courseId: course._id, courseTitle: course.title };
        foundCourse = course;
        break;
      }
    }
    
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }
    
    res.json({ success: true, material, course: foundCourse });
  } catch (error) {
    console.error('Error fetching material:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch material', error: error.message });
  }
});

// Add a new material with file upload
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { courseId, title, description, type } = req.body;
    
    // Try to get user from auth token
    let teacherId = null;
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        teacherId = decodedToken.uid;
      }
    } catch (authError) {
      console.log("Authentication error:", authError.message);
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
    
    // Find the course
    const course = await Course.findById(courseId);
    
    if (!course) {
      // Remove uploaded file if course not found
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    // Verify the user is the course teacher
    if (course.teacherId !== teacherId) {
      // Remove uploaded file if unauthorized
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
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
      id: Date.now().toString(),
      createdAt: Date.now()
    };
    
    // Add file data if file was uploaded
    if (req.file) {
      // Generate server URL from request
      const protocol = req.protocol;
      const host = req.get('host');
      const baseUrl = `${protocol}://${host}`;
      
      newMaterial.fileName = req.file.originalname;
      newMaterial.fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
      newMaterial.filePath = req.file.path;
      newMaterial.fileSize = req.file.size;
      newMaterial.mimeType = req.file.mimetype;
    }
    
    // Add icon and color based on material type
    newMaterial.icon = getIconForType(newMaterial.type);
    newMaterial.color = getColorForType(newMaterial.type);
    
    // Add the material to the course
    course.materials = course.materials || [];
    course.materials.push(newMaterial);
    await course.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Material added successfully', 
      material: { ...newMaterial, courseId: course._id, courseTitle: course.title } 
    });
  } catch (error) {
    // Remove uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error adding material:', error);
    res.status(500).json({ success: false, message: 'Failed to add material', error: error.message });
  }
});

// Delete a material
router.delete('/:materialId', auth, async (req, res) => {
  try {
    const { materialId } = req.params;
    const teacherId = req.user.uid;
    
    // Find courses taught by this teacher
    const courses = await Course.find({ teacherId });
    
    // Find which course has this material
    let materialDeleted = false;
    let filePath = null;
    
    for (const course of courses) {
      const materialIndex = (course.materials || []).findIndex(m => m.id === materialId);
      if (materialIndex >= 0) {
        // Store file path if exists before removing
        if (course.materials[materialIndex].filePath) {
          filePath = course.materials[materialIndex].filePath;
        }
        
        // Remove the material
        course.materials.splice(materialIndex, 1);
        await course.save();
        materialDeleted = true;
        break;
      }
    }
    
    if (!materialDeleted) {
      return res.status(404).json({ success: false, message: 'Material not found or unauthorized' });
    }
    
    // Remove the file if it exists
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.json({ success: true, message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ success: false, message: 'Failed to delete material', error: error.message });
  }
});

// Update a material
router.put('/:materialId', auth, async (req, res) => {
  try {
    const { materialId } = req.params;
    const { updatedMaterial } = req.body;
    const teacherId = req.user.uid;
    
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
        // Update the material
        course.materials[materialIndex] = {
          ...course.materials[materialIndex],
          ...updatedMaterial,
          id: materialId, // Ensure ID doesn't change
          updatedAt: Date.now()
        };
        await course.save();
        materialUpdated = true;
        break;
      }
    }
    
    if (!materialUpdated) {
      return res.status(404).json({ success: false, message: 'Material not found or unauthorized' });
    }
    
    res.json({ success: true, message: 'Material updated successfully' });
  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({ success: false, message: 'Failed to update material', error: error.message });
  }
});

// Helper functions for material types
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