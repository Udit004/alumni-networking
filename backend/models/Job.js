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
  creatorId: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
  applicants: { type: Number, default: 0 }
});

// Add indexes for frequently queried fields
jobSchema.index({ creatorId: 1, createdAt: -1 }); // For getting jobs by creator sorted by date
jobSchema.index({ applicationDeadline: 1 }); // For querying by deadline
jobSchema.index({ type: 1, location: 1 }); // For filtering by type and location

module.exports = mongoose.model('Job', jobSchema);