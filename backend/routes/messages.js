const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  orderBy,
  Timestamp,
  or,
  and,
  serverTimestamp
} = require('firebase/firestore');
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
      createdAt: serverTimestamp(),
      read: false
    };

    const messageRef = await addDoc(collection(db, 'messages'), messageData);
    
    // Add the server-generated timestamp
    const messageDoc = await getDoc(messageRef);
    
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
    const user1Ref = doc(db, 'users', userId1);
    const user2Ref = doc(db, 'users', userId2);
    
    const user1Doc = await getDoc(user1Ref);
    const user2Doc = await getDoc(user2Ref);
    
    if (!user1Doc.exists() || !user2Doc.exists()) {
      return res.status(404).json({
        success: false,
        message: 'One or both users not found'
      });
    }
    
    // Query messages where either user is sender and the other is receiver
    const q = query(
      collection(db, 'messages'),
      or(
        and(where('senderId', '==', userId1), where('receiverId', '==', userId2)),
        and(where('senderId', '==', userId2), where('receiverId', '==', userId1))
      ),
      orderBy('createdAt', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const messages = [];
    querySnapshot.forEach((doc) => {
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
    const q = query(
      collection(db, 'messages'),
      where('senderId', '==', senderId),
      where('receiverId', '==', receiverId),
      where('read', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Update each message to mark as read
    const updatePromises = [];
    querySnapshot.forEach((document) => {
      const messageRef = doc(db, 'messages', document.id);
      updatePromises.push(updateDoc(messageRef, { read: true }));
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
    
    // Get all messages where the user is either sender or receiver
    try {
      console.log('Creating Firestore query...');
      const q = query(
        collection(db, 'messages'),
        or(
          where('senderId', '==', userId),
          where('receiverId', '==', userId)
        ),
        orderBy('createdAt', 'desc')
      );
      
      console.log('Executing Firestore query...');
      const querySnapshot = await getDocs(q);
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
          const partnerRef = doc(db, 'users', partnerId);
          const partnerDoc = await getDoc(partnerRef);
          
          if (partnerDoc.exists()) {
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