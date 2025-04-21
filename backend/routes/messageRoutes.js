const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = mongoose.model('Message');
const User = mongoose.model('User');

// Get conversation history between two users
router.get('/:userId/:partnerId', async (req, res) => {
  try {
    const { userId, partnerId } = req.params;

    // Find messages where either user is sender and the other is receiver
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId }
      ]
    }).sort({ createdAt: 1 });

    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history',
      error: error.message
    });
  }
});

// Get all conversations for a user - simplified version
router.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Fetching conversations for user: ${userId}`);

    // Get all messages where the user is either sender or receiver
    const allMessages = await Message.find({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    }).sort({ createdAt: -1 });

    console.log(`Found ${allMessages.length} total messages for user ${userId}`);

    // Create a map to store the latest message for each conversation partner
    const conversationsMap = new Map();

    // Create a map to track unread counts
    const unreadCountMap = new Map();

    // Process all messages
    allMessages.forEach(message => {
      // Determine the conversation partner
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;

      // Count unread messages (only for messages received by the user)
      if (message.receiverId === userId && !message.read) {
        unreadCountMap.set(partnerId, (unreadCountMap.get(partnerId) || 0) + 1);
        console.log(`Unread message from ${partnerId} to ${userId}: ${message.content}`);
      }

      // Store only the most recent message for each partner
      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, message);
        console.log(`Added conversation with ${partnerId} to map for ${userId}`);
      }
    });

    console.log(`Found ${conversationsMap.size} unique conversation partners`);

    // Convert the map to an array of conversations
    const conversations = [];

    for (const [partnerId, lastMessage] of conversationsMap.entries()) {
      // Get partner role from the message
      const partnerRole = lastMessage.senderId === userId ?
                         lastMessage.receiverRole :
                         lastMessage.senderRole;

      conversations.push({
        user: {
          uid: partnerId,
          name: partnerId, // We'll display the ID if we can't find the name
          role: partnerRole,
          photoURL: null
        },
        lastMessage: {
          _id: lastMessage._id,
          senderId: lastMessage.senderId,
          receiverId: lastMessage.receiverId,
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          read: lastMessage.read,
          senderRole: lastMessage.senderRole,
          receiverRole: lastMessage.receiverRole
        },
        unreadCount: unreadCountMap.get(partnerId) || 0
      });
    }

    // Sort conversations by the timestamp of the latest message (most recent first)
    conversations.sort((a, b) =>
      new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    );

    console.log(`Returning ${conversations.length} conversations`);
    if (conversations.length > 0) {
      console.log('Sample conversation:', JSON.stringify(conversations[0], null, 2));
    }

    return res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message
    });
  }
});

// Send a new message
router.post('/send', async (req, res) => {
  try {
    const { senderId, receiverId, senderRole, receiverRole, content } = req.body;

    if (!senderId || !receiverId || !content || !senderRole || !receiverRole) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Always create new messages as unread for the receiver
    const newMessage = new Message({
      senderId,
      receiverId,
      senderRole,
      receiverRole,
      content,
      read: false, // This ensures the notification badge will appear
      createdAt: new Date()
    });

    console.log(`Creating message from ${senderId} to ${receiverId} with read status: false`);

    const savedMessage = await newMessage.save();
    console.log(`Message saved successfully from ${senderId} to ${receiverId}:`, JSON.stringify(savedMessage, null, 2));

    // Log the current conversations for both users to verify they're updated
    setTimeout(async () => {
      try {
        // Check sender's conversations
        const senderMessages = await Message.find({
          $or: [
            { senderId },
            { receiverId: senderId }
          ]
        }).sort({ createdAt: -1 }).limit(5);

        console.log(`Found ${senderMessages.length} recent messages for sender ${senderId}`);

        // Check receiver's conversations
        const receiverMessages = await Message.find({
          $or: [
            { senderId: receiverId },
            { receiverId }
          ]
        }).sort({ createdAt: -1 }).limit(5);

        console.log(`Found ${receiverMessages.length} recent messages for receiver ${receiverId}`);
      } catch (error) {
        console.error('Error checking conversations after message send:', error);
      }
    }, 500);

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// Mark messages as read
router.put('/mark-read/:senderId/:receiverId', async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    console.log(`Marking messages from ${senderId} to ${receiverId} as read`);

    // Find all unread messages from sender to receiver
    const unreadMessages = await Message.find({ senderId, receiverId, read: false });
    console.log(`Found ${unreadMessages.length} unread messages from ${senderId} to ${receiverId}`);

    // Update all unread messages to read
    const result = await Message.updateMany(
      { senderId, receiverId, read: false },
      { $set: { read: true } }
    );

    console.log(`Marked ${result.modifiedCount} messages as read from ${senderId} to ${receiverId}`);

    // If we updated any messages, log them for debugging
    if (result.modifiedCount > 0) {
      console.log('Updated messages from unread to read');
    }

    return res.status(200).json({
      success: true,
      message: 'Messages marked as read',
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
});

module.exports = router;