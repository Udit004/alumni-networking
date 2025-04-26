const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'course_enrollment',      // Enrolled in a course
      'course_completion',      // Completed a course
      'assignment_submission',  // Submitted an assignment
      'assignment_graded',      // Assignment was graded
      'event_registration',     // Registered for an event
      'event_attendance',       // Attended an event
      'job_application',        // Applied for a job
      'job_status_change',      // Job application status changed
      'mentorship_application', // Applied for mentorship
      'mentorship_status_change', // Mentorship application status changed
      'connection_request',     // Sent a connection request
      'connection_accepted',    // Connection request accepted
      'announcement_created',   // Created an announcement
      'announcement_read',      // Read an announcement
      'profile_update',         // Updated profile
      'course_created',         // Created a course (teacher)
      'job_posted',             // Posted a job (alumni)
      'mentorship_posted'       // Posted a mentorship opportunity (alumni)
    ]
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  relatedUserId: {
    type: String,
    required: false
  },
  relatedUserName: {
    type: String,
    required: false
  },
  relatedItemId: {
    type: String,
    required: false
  },
  relatedItemType: {
    type: String,
    required: false,
    enum: ['course', 'event', 'job', 'mentorship', 'assignment', 'announcement', 'connection', 'profile']
  },
  relatedItemName: {
    type: String,
    required: false
  },
  status: {
    type: String,
    required: false
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Add compound index for faster queries
ActivitySchema.index({ userId: 1, createdAt: -1 });
ActivitySchema.index({ relatedItemId: 1, type: 1 });

module.exports = mongoose.model('Activity', ActivitySchema);
