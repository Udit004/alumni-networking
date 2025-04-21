const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  senderRole: { type: String, enum: ['student', 'teacher', 'alumni'], required: true },
  receiverRole: { type: String, enum: ['student', 'teacher', 'alumni'], required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Create a compound index to optimize queries for chat history
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ receiverId: 1, senderId: 1 });

module.exports = mongoose.model('Message', messageSchema); 