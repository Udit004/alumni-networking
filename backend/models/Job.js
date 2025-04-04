const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  requirements: { type: String, required: true },
  salary: { type: String },
  contactEmail: { type: String, required: true },
  applicationDeadline: { type: Date, required: true },
  creatorId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  applicants: { type: Number, default: 0 }
});

module.exports = mongoose.model('Job', jobSchema); 