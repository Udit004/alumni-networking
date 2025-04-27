const express = require('express');
const router = express.Router();
const admin = require('../config/firebase-admin');
const { auth: authenticateToken } = require('../middleware/auth');

// Import the safeFirestore helper from the notification service
const { safeFirestore } = require('../services/firestoreNotificationService');

// Initialize Firestore with settings
let firestoreDb;
try {
  firestoreDb = admin.firestore();

  // Configure Firestore settings
  firestoreDb.settings({
    ignoreUndefinedProperties: true,
    timestampsInSnapshots: true
  });

  console.log('Firestore initialized in notifications route');
} catch (error) {
  console.error('Error initializing Firestore in notifications route:', error);
  firestoreDb = null;
}

// Helper function to create mock notifications
const createMockNotifications = (userId) => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);

  return [
    {
      id: 'mock-notification-1',
      userId,
      type: 'event',
      title: 'New Event Available',
      message: 'A new event "Career Fair 2023" has been added. Check it out!',
      itemId: 'mock-event-1',
      createdBy: 'system',
      timestamp: now.toISOString(),
      createdAt: now.toISOString(),
      read: false
    },
    {
      id: 'mock-notification-2',
      userId,
      type: 'job',
      title: 'New Job Opportunity',
      message: 'A new job "Software Engineer" at Google has been posted. Apply now!',
      itemId: 'mock-job-1',
      createdBy: 'system',
      timestamp: yesterday.toISOString(),
      createdAt: yesterday.toISOString(),
      read: false
    },
    {
      id: 'mock-notification-3',
      userId,
      type: 'course',
      title: 'New Course Available',
      message: 'A new course "Advanced Web Development" is now available for enrollment.',
      itemId: 'mock-course-1',
      createdBy: 'system',
      timestamp: lastWeek.toISOString(),
      createdAt: lastWeek.toISOString(),
      read: true
    },
    {
      id: 'mock-notification-4',
      userId,
      type: 'mentorship',
      title: 'New Mentorship Opportunity',
      message: 'A new mentorship program "Career Guidance" is now available.',
      itemId: 'mock-mentorship-1',
      createdBy: 'system',
      timestamp: lastWeek.toISOString(),
      createdAt: lastWeek.toISOString(),
      read: true
    }
  ];
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
        const notificationsRef = firestoreDb.collection('notifications');
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
      createMockNotifications(userId), // Use mock notifications as fallback
      'Error fetching Firestore notifications'
    );

    // If operation was successful
    if (result.success) {
      console.log(`Found ${result.data.length} Firestore notifications for user ${userId}`);
      return res.status(200).json({
        success: true,
        notifications: result.data,
        mock: result.mock || false
      });
    }
    // If in development and operation failed, return mock data
    else if (process.env.NODE_ENV === 'development') {
      console.log('Returning mock notifications for development');
      return res.status(200).json({
        success: true,
        notifications: createMockNotifications(userId),
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

    // For development, return mock data even on error
    if (process.env.NODE_ENV === 'development') {
      console.log('Error occurred, returning mock notifications for development');
      return res.status(200).json({
        success: true,
        notifications: createMockNotifications(req.user?.uid || 'mock-user-id'),
        mock: true,
        error: error.message
      });
    }

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
        const notificationRef = firestoreDb.collection('notifications').doc(id);
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
        const notificationsRef = firestoreDb.collection('notifications');
        const snapshot = await notificationsRef
          .where('userId', '==', userId)
          .where('read', '==', false)
          .get();

        // Use a batch to update all notifications
        const batch = firestoreDb.batch();
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
        const notificationsRef = firestoreDb.collection('notifications');
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
      timestamp: admin.firestore ? admin.firestore.FieldValue.serverTimestamp() : new Date(),
      createdAt: new Date().toISOString()
    };

    // Use the safe Firestore helper
    const result = await safeFirestore(
      async () => {
        // Add to Firestore
        const docRef = await firestoreDb.collection('notifications').add(notificationData);
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
