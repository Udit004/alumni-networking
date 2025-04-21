const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Test endpoint to create a message and verify it's saved
router.post('/create-test-message', async (req, res) => {
  try {
    const { senderId, receiverId, senderRole, receiverRole, content } = req.body;
    
    console.log(`Creating test message from ${senderId} to ${receiverId}`);
    
    if (!senderId || !receiverId || !content || !senderRole || !receiverRole) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Create and save the message
    const newMessage = new Message({
      senderId,
      receiverId,
      senderRole,
      receiverRole,
      content,
      read: false,
      createdAt: new Date()
    });
    
    const savedMessage = await newMessage.save();
    console.log(`Test message saved successfully:`, JSON.stringify(savedMessage, null, 2));
    
    // Verify the message was saved by fetching it back
    const fetchedMessage = await Message.findById(savedMessage._id);
    
    if (!fetchedMessage) {
      return res.status(500).json({
        success: false,
        message: 'Message was saved but could not be retrieved'
      });
    }
    
    // Check if the message appears in sender's conversations
    const senderMessages = await Message.find({
      $or: [
        { senderId },
        { receiverId: senderId }
      ]
    }).sort({ createdAt: -1 }).limit(10);
    
    console.log(`Found ${senderMessages.length} messages for sender ${senderId}`);
    
    // Check if the message appears in receiver's conversations
    const receiverMessages = await Message.find({
      $or: [
        { senderId: receiverId },
        { receiverId }
      ]
    }).sort({ createdAt: -1 }).limit(10);
    
    console.log(`Found ${receiverMessages.length} messages for receiver ${receiverId}`);
    
    // Return success with verification data
    return res.status(201).json({
      success: true,
      message: 'Test message created and verified successfully',
      data: {
        savedMessage,
        senderMessagesCount: senderMessages.length,
        receiverMessagesCount: receiverMessages.length
      }
    });
  } catch (error) {
    console.error('Error creating test message:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create test message',
      error: error.message
    });
  }
});

// Get all messages in the database (for testing)
router.get('/all-messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    console.log(`Found ${messages.length} total messages in the database`);
    
    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching all messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

// Delete all messages (for testing)
router.delete('/clear-all-messages', async (req, res) => {
  try {
    const result = await Message.deleteMany({});
    console.log(`Deleted ${result.deletedCount} messages from the database`);
    
    return res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} messages from the database`
    });
  } catch (error) {
    console.error('Error deleting messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete messages',
      error: error.message
    });
  }
});

module.exports = router;
