const mongoose = require('mongoose');

const mentorshipApplicationSchema = new mongoose.Schema({
  mentorshipId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
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
    default: 'pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

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
  
  next();
});

module.exports = mongoose.model('MentorshipApplication', mentorshipApplicationSchema); 