const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  firebaseUID: {
    type: String,
    required: false
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
  whyInterested: {
    type: String,
    required: true
  },
  additionalInfo: {
    type: String,
    default: ''
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

// Add a pre-save middleware to handle conversion of ID types
eventRegistrationSchema.pre('save', function(next) {
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

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);
