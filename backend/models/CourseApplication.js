const mongoose = require('mongoose');

const courseApplicationSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true
  },
  teacherId: {
    type: String,
    required: true
  },
  teacherName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reason: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  expectations: {
    type: String,
    required: true
  },
  commitment: {
    type: String,
    required: true
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewNotes: {
    type: String
  }
}, { timestamps: true });

// Create a compound index to ensure a student can only apply once for a course
courseApplicationSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

const CourseApplication = mongoose.model('CourseApplication', courseApplicationSchema);

module.exports = CourseApplication;
