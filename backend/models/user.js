const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firebaseUID: { type: String, required: true, unique: true }, // Store Firebase UID separately
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['student', 'teacher', 'alumni'], required: true }
});

module.exports = mongoose.model('User', UserSchema);
