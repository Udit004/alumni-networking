const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { auth: authenticateToken } = require('../middleware/auth');

// Helper function to safely access Firestore
const safeFirestore = async (operation, fallbackData, errorMessage) => {
  try {
    // Check if Firestore is available
    if (!admin.firestore) {
      console.error('Firestore is not available');
      return { success: false, error: 'Firestore is not available', data: fallbackData };
    }

    // Execute the operation
    const result = await operation();
    return { success: true, data: result };
  } catch (error) {
    console.error(`${errorMessage}:`, error);

    // For development, return mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('Returning mock data for development');
      return { success: false, error: error.message, data: fallbackData };
    }

    throw error; // Re-throw for production
  }
};

// Get all notifications for a user from Firestore
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid || req.user.id;

    console.log(`Fetching Firestore notifications for user: ${userId}`);

    // Use the safe Firestore helper
    const result = await safeFirestore(
      async () => {
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

        return notifications;
      },
      [], // Fallback empty array
      'Error fetching Firestore notifications'
    );

    // If operation was successful
    if (result.success) {
      console.log(`Found ${result.data.length} Firestore notifications for user ${userId}`);
      return res.status(200).json({
        success: true,
        notifications: result.data
      });
    }
    // If in development and operation failed, return mock data
    else if (process.env.NODE_ENV === 'development') {
      console.log('Returning mock notifications for development');
      return res.status(200).json({
        success: true,
        notifications: [],
        mock: true,
        error: result.error
      });
    }
    // In production, return error
    else {
      throw new Error(result.error);
    }
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

    // Use the safe Firestore helper
    const result = await safeFirestore(
      async () => {
        // Get the notification to verify ownership
        const notificationRef = admin.firestore().collection('notifications').doc(id);
        const notificationDoc = await notificationRef.get();

        if (!notificationDoc.exists) {
          return { status: 404, message: 'Notification not found' };
        }

        const notificationData = notificationDoc.data();

        // Verify the notification belongs to the user
        if (notificationData.userId !== userId) {
          return { status: 403, message: 'Not authorized to update this notification' };
        }

        // Update the notification
        await notificationRef.update({
          read: true
        });

        return { status: 200, message: 'Notification marked as read' };
      },
      { status: 200, message: 'Mock: Notification marked as read' }, // Fallback for development
      `Error marking Firestore notification ${id} as read`
    );

    // If operation was successful
    if (result.success) {
      // Check if there was a special status code
      if (result.data.status !== 200) {
        return res.status(result.data.status).json({
          success: false,
          message: result.data.message
        });
      }

      return res.status(200).json({
        success: true,
        message: result.data.message
      });
    }
    // If in development and operation failed, return mock success
    else if (process.env.NODE_ENV === 'development') {
      console.log('Returning mock success for development');
      return res.status(200).json({
        success: true,
        message: 'Mock: Notification marked as read',
        mock: true,
        error: result.error
      });
    }
    // In production, return error
    else {
      throw new Error(result.error);
    }
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

    // Use the safe Firestore helper
    const result = await safeFirestore(
      async () => {
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

        return { count: snapshot.size };
      },
      { count: 0 }, // Fallback for development
      `Error marking all Firestore notifications as read for user ${userId}`
    );

    // If operation was successful
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: `Marked ${result.data.count} notifications as read`
      });
    }
    // If in development and operation failed, return mock success
    else if (process.env.NODE_ENV === 'development') {
      console.log('Returning mock success for development');
      return res.status(200).json({
        success: true,
        message: 'Mock: All notifications marked as read',
        mock: true,
        error: result.error
      });
    }
    // In production, return error
    else {
      throw new Error(result.error);
    }
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

    // Use the safe Firestore helper
    const result = await safeFirestore(
      async () => {
        // Query Firestore for unread notifications
        const notificationsRef = admin.firestore().collection('notifications');
        const snapshot = await notificationsRef
          .where('userId', '==', userId)
          .where('read', '==', false)
          .get();

        return { count: snapshot.size };
      },
      { count: 0 }, // Fallback for development
      `Error getting unread Firestore notification count for user ${userId}`
    );

    // If operation was successful
    if (result.success) {
      return res.status(200).json({
        success: true,
        count: result.data.count
      });
    }
    // If in development and operation failed, return mock data
    else if (process.env.NODE_ENV === 'development') {
      console.log('Returning mock count for development');
      return res.status(200).json({
        success: true,
        count: 0,
        mock: true,
        error: result.error
      });
    }
    // In production, return error
    else {
      throw new Error(result.error);
    }
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

    // Use the safe Firestore helper
    const result = await safeFirestore(
      async () => {
        // Add to Firestore
        const docRef = await admin.firestore().collection('notifications').add(notificationData);
        return { id: docRef.id };
      },
      { id: `mock-${Date.now()}` }, // Fallback for development
      `Error creating Firestore notification for user ${userId}`
    );

    // If operation was successful
    if (result.success) {
      return res.status(201).json({
        success: true,
        message: 'Notification created',
        notification: {
          id: result.data.id,
          ...notificationData
        }
      });
    }
    // If in development and operation failed, return mock data
    else if (process.env.NODE_ENV === 'development') {
      console.log('Returning mock notification for development');
      return res.status(201).json({
        success: true,
        message: 'Mock: Notification created',
        notification: {
          id: result.data.id,
          ...notificationData,
          mock: true
        },
        error: result.error
      });
    }
    // In production, return error
    else {
      throw new Error(result.error);
    }
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
