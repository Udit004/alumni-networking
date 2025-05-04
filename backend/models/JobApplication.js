const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  currentYear: {
    type: String,
    required: true
  },
  program: {
    type: String,
    required: true
  },
  skills: {
    type: [String],
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  whyInterested: {
    type: String,
    required: true
  },
  additionalInfo: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
    index: true
  },
  appliedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Add compound indexes for common query patterns
jobApplicationSchema.index({ userId: 1, appliedAt: -1 }); // For getting user applications sorted by date
jobApplicationSchema.index({ jobId: 1, status: 1 }); // For filtering applications by job and status

module.exports = mongoose.model('JobApplication', jobApplicationSchema);