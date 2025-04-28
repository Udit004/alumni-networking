const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  teacherId: {
    type: String,
    required: true,
    trim: true
  },
  teacherName: {
    type: String,
    required: true,
    trim: true
  },
  schedule: {
    type: String,
    required: true,
    trim: true
  },
  room: {
    type: String,
    required: true,
    trim: true
  },
  thumbnail: {
    type: String,
    default: 'https://source.unsplash.com/random/800x600/?course'
  },
  students: {
    type: Array,
    default: []
  },
  maxStudents: {
    type: Number,
    default: 50
  },
  progress: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'upcoming'],
    default: 'active'
  },
  term: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  nextClass: {
    type: Date
  },
  upcomingDeadline: {
    title: {
      type: String
    },
    due: {
      type: Date
    }
  },
  materials: {
    type: Array,
    default: []
    // Each material can have:
    // - id: String (unique identifier)
    // - title: String (title of the material)
    // - description: String (description of the material)
    // - type: String (type of material: notes, assignment, etc.)
    // - driveLink: String (Google Drive or other cloud storage link)
    // - icon: String (icon for the material type)
    // - color: String (color for the material type)
    // - createdAt: Date (when the material was created)
    // - updatedAt: Date (when the material was last updated)
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add a method to add materials to a course
courseSchema.methods.addMaterial = async function(material) {
  // Add the material to the materials array
  this.materials.push(material);

  // Save the course
  return this.save();
};

module.exports = mongoose.model('Course', courseSchema);
