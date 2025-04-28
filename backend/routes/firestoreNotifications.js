const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { auth: authenticateToken } = require('../middleware/auth');

// Get all notifications for a user from Firestore
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid || req.user.id;
    
    console.log(`Fetching Firestore notifications for user: ${userId}`);
    
    // Query Firestore for notifications
    const notificationsRef = admin.firestore().collection('notifications');
    const snapshot = await notificationsRef
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();
    
    // Convert to array of notification objects
    const notifications = [];
    snapshot.forEach(doc => {
      notifications.push({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamp to ISO string for consistent API
        timestamp: doc.data().timestamp ? doc.data().timestamp.toDate().toISOString() : null
      });
    });
    
    console.log(`Found ${notifications.length} Firestore notifications for user ${userId}`);
    
    return res.status(200).json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Error fetching Firestore notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

// Mark a notification as read in Firestore
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid || req.user.id;
    
    console.log(`Marking Firestore notification ${id} as read for user ${userId}`);
    
    // Get the notification to verify ownership
    const notificationRef = admin.firestore().collection('notifications').doc(id);
    const notificationDoc = await notificationRef.get();
    
    if (!notificationDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    const notificationData = notificationDoc.data();
    
    // Verify the notification belongs to the user
    if (notificationData.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this notification'
      });
    }
    
    // Update the notification
    await notificationRef.update({
      read: true
    });
    
    return res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking Firestore notification as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

// Mark all notifications as read for a user in Firestore
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid || req.user.id;
    
    console.log(`Marking all Firestore notifications as read for user ${userId}`);
    
    // Get all unread notifications for the user
    const notificationsRef = admin.firestore().collection('notifications');
    const snapshot = await notificationsRef
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get();
    
    // Use a batch to update all notifications
    const batch = admin.firestore().batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });
    
    // Commit the batch
    await batch.commit();
    
    return res.status(200).json({
      success: true,
      message: `Marked ${snapshot.size} notifications as read`
    });
  } catch (error) {
    console.error('Error marking all Firestore notifications as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
});

// Get unread notification count for a user from Firestore
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid || req.user.id;
    
    console.log(`Getting unread Firestore notification count for user ${userId}`);
    
    // Query Firestore for unread notifications
    const notificationsRef = admin.firestore().collection('notifications');
    const snapshot = await notificationsRef
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get();
    
    return res.status(200).json({
      success: true,
      count: snapshot.size
    });
  } catch (error) {
    console.error('Error getting unread Firestore notification count:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get unread notification count',
      error: error.message
    });
  }
});

// Create a notification in Firestore (for testing)
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { userId, title, message, type, itemId } = req.body;
    
    if (!userId || !title || !message || !type || !itemId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['userId', 'title', 'message', 'type', 'itemId']
      });
    }
    
    console.log(`Creating Firestore notification for user ${userId}: ${title}`);
    
    // Create notification data
    const notificationData = {
      userId,
      title,
      message,
      type,
      itemId,
      createdBy: req.user.uid || req.user.id || 'system',
      read: false,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString()
    };
    
    // Add to Firestore
    const docRef = await admin.firestore().collection('notifications').add(notificationData);
    
    return res.status(201).json({
      success: true,
      message: 'Notification created',
      notification: {
        id: docRef.id,
        ...notificationData
      }
    });
  } catch (error) {
    console.error('Error creating Firestore notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
});

module.exports = router;
