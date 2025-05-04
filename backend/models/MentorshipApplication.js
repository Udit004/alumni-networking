const mongoose = require('mongoose');

const mentorshipApplicationSchema = new mongoose.Schema({
  mentorshipId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  firebaseUID: {
    type: String,
    required: false,
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
    type: Array,
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
    type: String,
    default: ''
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
mentorshipApplicationSchema.index({ userId: 1, appliedAt: -1 }); // For getting user applications sorted by date
mentorshipApplicationSchema.index({ mentorshipId: 1, status: 1 }); // For filtering applications by mentorship and status
mentorshipApplicationSchema.index({ firebaseUID: 1, appliedAt: -1 }); // For getting user applications by firebaseUID

// Add a pre-save middleware to handle conversion of ID types
mentorshipApplicationSchema.pre('save', function(next) {
  // Ensure program is set if not provided
  if (!this.program && this.currentYear) {
    this.program = this.currentYear;
  }

  // Ensure additionalInfo is set to empty string if not provided
  if (this.additionalInfo === undefined || this.additionalInfo === null) {
    this.additionalInfo = '';
  }

  // If firebaseUID is not set but userId is provided, use it as fallback
  if (!this.firebaseUID && this.userId) {
    this.firebaseUID = this.userId;
  }

  next();
});

module.exports = mongoose.model('MentorshipApplication', mentorshipApplicationSchema);