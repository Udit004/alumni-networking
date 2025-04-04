const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  expectations: { type: String, required: true },
  duration: { type: String, required: true },
  commitment: { type: String, required: true },
  skills: { type: String, required: true },
  prerequisites: { type: String },
  maxMentees: { type: Number, required: true },
  mentorId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  mentees: { type: Number, default: 0 },
  status: { type: String, default: 'active', enum: ['active', 'completed'] }
});

module.exports = mongoose.model('Mentorship', mentorshipSchema); 