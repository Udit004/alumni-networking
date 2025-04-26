const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  createdByName: {
    type: String,
    required: true
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

// Add index for faster queries
announcementSchema.index({ courseId: 1, createdAt: -1 });

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
