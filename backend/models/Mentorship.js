const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true, index: true },
  description: { type: String, required: true },
  expectations: { type: String, required: true },
  duration: { type: String, required: true },
  commitment: { type: String, required: true },
  skills: { type: String, required: true },
  prerequisites: { type: String },
  maxMentees: { type: Number, required: true },
  mentorId: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
  mentees: { type: Number, default: 0 },
  status: { type: String, default: 'active', enum: ['active', 'completed'], index: true }
});

// Add compound indexes for common query patterns
mentorshipSchema.index({ mentorId: 1, createdAt: -1 }); // For getting mentorships by mentor sorted by date
mentorshipSchema.index({ status: 1, category: 1 }); // For filtering active mentorships by category
mentorshipSchema.index({ skills: 'text' }); // For text search on skills

module.exports = mongoose.model('Mentorship', mentorshipSchema);