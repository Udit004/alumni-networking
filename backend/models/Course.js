const mongoose = require('mongoose');

// Define a schema for material items with strict validation
const materialSchema = new mongoose.Schema({
  id: { 
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['notes', 'assignment', 'template', 'quiz', 'lab', 'guide'],
    default: 'notes'
  },
  fileName: String,
  fileUrl: String,
  filePath: String,
  fileSize: Number,
  mimeType: String,
  icon: String,
  color: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { 
  _id: false, // Don't add _id to each material since we use our own id
  strict: true // Enforce schema validation
});

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
  students: [{
    type: Object
  }],
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
    type: [materialSchema], // Use the defined material schema for the array
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Add createdAt and updatedAt timestamps automatically
  strict: true // Enforce schema validation
});

// Add a specific method to add a material to ensure it's saved correctly
courseSchema.methods.addMaterial = function(materialData) {
  if (!this.materials) {
    this.materials = [];
  }
  this.materials.push(materialData);
  return this.save();
};

// Update the updatedAt field before saving
courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Ensure materials have all required fields
  if (this.materials && this.materials.length > 0) {
    this.materials.forEach(material => {
      if (!material.id) {
        material.id = new mongoose.Types.ObjectId().toString();
      }
      
      if (!material.createdAt) {
        material.createdAt = new Date();
      }
      
      material.updatedAt = new Date();
    });
  }
  
  next();
});

module.exports = mongoose.model('Course', courseSchema);
