const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const admin = require('firebase-admin');
const { FieldValue } = admin.firestore;
const { verifyToken } = require('../middleware/auth');

// Route to send a message
router.post('/send', verifyToken, async (req, res) => {
  try {
    const { senderId, receiverId, content, senderRole, receiverRole } = req.body;

    if (!senderId || !receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create the message document
    const messageData = {
      senderId,
      receiverId,
      content,
      senderRole: senderRole || 'unknown',
      receiverRole: receiverRole || 'unknown',
      createdAt: FieldValue.serverTimestamp(),
      read: false,
      participants: [senderId, receiverId] // Add participants array for easier querying
    };

    const messageRef = await db.collection('messages').add(messageData);

    // Add the server-generated timestamp
    const messageDoc = await messageRef.get();

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        _id: messageRef.id,
        ...messageDoc.data(),
        createdAt: new Date() // For immediate UI display before server timestamp is available
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
});

// Route to get messages between two users
router.get('/:userId1/:userId2', verifyToken, async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;

    // Check if both users exist
    const user1Ref = db.collection('users').doc(userId1);
    const user2Ref = db.collection('users').doc(userId2);

    const user1Doc = await user1Ref.get();
    const user2Doc = await user2Ref.get();

    if (!user1Doc.exists || !user2Doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'One or both users not found'
      });
    }

    // Query messages where both users are in the participants array
    const querySnapshot = await db.collection('messages')
      .where('participants', 'array-contains', userId1)
      .get();

    // Filter in memory for messages between these two specific users
    const filteredDocs = querySnapshot.docs.filter(doc => {
      const data = doc.data();
      return (
        (data.senderId === userId1 && data.receiverId === userId2) ||
        (data.senderId === userId2 && data.receiverId === userId1)
      );
    });

    // Sort by createdAt
    filteredDocs.sort((a, b) => {
      const aTime = a.data().createdAt?.toDate?.() || new Date(0);
      const bTime = b.data().createdAt?.toDate?.() || new Date(0);
      return aTime - bTime;
    });

    const messages = [];
    filteredDocs.forEach((doc) => {
      messages.push({
        _id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date()
      });
    });

    return res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error retrieving messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving messages',
      error: error.message
    });
  }
});

// Mark messages as read
router.put('/mark-read/:senderId/:receiverId', verifyToken, async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    // Find all unread messages from sender to receiver
    // First query for messages with the receiver in participants
    const querySnapshot = await db.collection('messages')
      .where('participants', 'array-contains', receiverId)
      .get();

    // Filter for unread messages from the specific sender
    const unreadMessages = querySnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.senderId === senderId &&
             data.receiverId === receiverId &&
             data.read === false;
    });

    // Update each message to mark as read
    const updatePromises = [];
    unreadMessages.forEach((document) => {
      const messageRef = db.collection('messages').doc(document.id);
      updatePromises.push(messageRef.update({ read: true }));
    });

    await Promise.all(updatePromises);

    return res.status(200).json({
      success: true,
      message: 'Messages marked as read',
      count: updatePromises.length
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Error marking messages as read',
      error: error.message
    });
  }
});

// Get conversations list
router.get('/conversations/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Fetching conversations for user: ${userId}`);

    // Get all messages where the user is in the participants array
    try {
      console.log('Creating Firestore query...');

      console.log('Executing Firestore query...');
      const querySnapshot = await db.collection('messages')
        .where('participants', 'array-contains', userId)
        .orderBy('createdAt', 'desc')
        .get();

      console.log(`Query returned ${querySnapshot.size} messages`);

      // Map to track the latest message with each conversation partner
      const conversationsMap = new Map();

      // Track unread count per conversation partner
      const unreadCountMap = new Map();

      console.log('Processing message data...');
      querySnapshot.forEach((doc) => {
        try {
          const data = doc.data();
          const message = {
            _id: doc.id,
            ...data,
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date()
          };

          // Determine the conversation partner
          const partnerId = message.senderId === userId ? message.receiverId : message.senderId;

          // Track unread messages (only count messages received by the user)
          if (message.receiverId === userId && !message.read) {
            unreadCountMap.set(partnerId, (unreadCountMap.get(partnerId) || 0) + 1);
          }

          // Only store the most recent message per conversation partner
          if (!conversationsMap.has(partnerId)) {
            conversationsMap.set(partnerId, message);
          }
        } catch (docError) {
          console.error('Error processing message document:', docError, doc.id);
        }
      });

      console.log(`Found ${conversationsMap.size} conversation partners`);

      // Fetch user details for each conversation partner
      const conversationsWithUserDetails = [];

      for (const [partnerId, latestMessage] of conversationsMap.entries()) {
        try {
          console.log(`Fetching partner details: ${partnerId}`);
          const partnerRef = db.collection('users').doc(partnerId);
          const partnerDoc = await partnerRef.get();

          if (partnerDoc.exists) {
            const partnerData = partnerDoc.data();

            conversationsWithUserDetails.push({
              user: {
                uid: partnerId,
                name: partnerData.name || partnerData.displayName || 'Unknown User',
                role: partnerData.role || 'unknown',
                photoURL: partnerData.photoURL || null
              },
              lastMessage: latestMessage,
              unreadCount: unreadCountMap.get(partnerId) || 0
            });
          } else {
            console.log(`Partner document not found: ${partnerId}`);
            // Include even if partner details not found
            conversationsWithUserDetails.push({
              user: {
                uid: partnerId,
                name: 'Unknown User',
                role: 'unknown',
                photoURL: null
              },
              lastMessage: latestMessage,
              unreadCount: unreadCountMap.get(partnerId) || 0
            });
          }
        } catch (partnerError) {
          console.error(`Error fetching partner details for ${partnerId}:`, partnerError);
          // Include partner with error info
          conversationsWithUserDetails.push({
            user: {
              uid: partnerId,
              name: 'User (Error)',
              role: 'unknown',
              photoURL: null
            },
            lastMessage: latestMessage,
            unreadCount: unreadCountMap.get(partnerId) || 0
          });
        }
      }

      // Sort conversations by the timestamp of the latest message (most recent first)
      conversationsWithUserDetails.sort((a, b) =>
        b.lastMessage.createdAt - a.lastMessage.createdAt
      );

      console.log(`Returning ${conversationsWithUserDetails.length} conversations`);
      return res.status(200).json({
        success: true,
        data: conversationsWithUserDetails
      });
    } catch (queryError) {
      console.error('Error in Firestore query:', queryError);
      return res.status(500).json({
        success: false,
        message: 'Error querying Firestore',
        error: queryError.message
      });
    }
  } catch (error) {
    console.error('Error retrieving conversations:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving conversations',
      error: error.message
    });
  }
});

module.exports = router;