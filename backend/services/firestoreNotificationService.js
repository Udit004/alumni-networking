const admin = require('../config/firebase-admin');

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

    return { success: false, error: error.message };
  }
};

/**
 * Create a notification for a specific user in Firestore
 * @param {Object} notificationData - The notification data object
 * @returns {Promise<Object>} - The created notification
 */
const createNotification = async (notificationData) => {
  try {
    // Support both object and individual parameters
    let data = notificationData;

    // If individual parameters were passed instead of an object
    if (arguments.length > 1) {
      const [userId, title, message, type, itemId, createdBy] = arguments;
      data = { userId, title, message, type, itemId, createdBy };
    }

    console.log(`Creating Firestore notification for user ${data.userId}: ${data.title}`);

    // Validate inputs
    if (!data.userId || !data.title || !data.message || !data.type || !data.itemId) {
      console.error('Missing required fields for notification:', data);
      return {
        success: false,
        message: 'Missing required fields for notification'
      };
    }

    // Create complete notification data
    const completeNotificationData = {
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      itemId: data.itemId,
      createdBy: data.createdBy || 'system',
      read: false,
      timestamp: admin.firestore?.FieldValue?.serverTimestamp?.() || new Date(),
      createdAt: new Date().toISOString() // Backup readable timestamp
    };

    console.log('Saving notification to Firestore:', completeNotificationData);

    // Use the safe Firestore helper
    const result = await safeFirestore(
      async () => {
        // Add the notification to Firestore
        const docRef = await admin.firestore().collection('notifications').add(completeNotificationData);
        return docRef.id;
      },
      `mock-${Date.now()}`, // Fallback mock ID
      `Error creating Firestore notification for user ${data.userId}`
    );

    if (result.success) {
      console.log(`Notification created with ID: ${result.data}`);

      // Return the created notification
      return {
        success: true,
        id: result.data,
        ...completeNotificationData,
        timestamp: new Date() // Use a JavaScript Date for immediate use
      };
    } else {
      // For development, return mock success
      if (process.env.NODE_ENV === 'development') {
        console.log('Returning mock notification for development');
        return {
          success: true,
          id: result.data,
          ...completeNotificationData,
          timestamp: new Date(),
          mock: true
        };
      }

      return {
        success: false,
        message: result.error || 'Failed to create notification'
      };
    }
  } catch (error) {
    console.error('Error creating Firestore notification:', error);

    // For development, return mock success
    if (process.env.NODE_ENV === 'development') {
      return {
        success: true,
        id: `mock-${Date.now()}`,
        ...notificationData,
        timestamp: new Date(),
        mock: true,
        error: error.message
      };
    }

    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Create notifications for all students enrolled in a course
 * @param {Array} students - Array of student objects with studentId property
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {string} type - The notification type (announcement)
 * @param {string} itemId - The ID of the announcement
 * @param {string} createdBy - The user ID of who created the notification
 * @returns {Promise<Object>} - Result object with success status and notifications array
 */
const notifyCourseStudents = async (students, title, message, type, itemId, createdBy) => {
  try {
    console.log(`Creating notifications for ${students.length} students`);

    const notifications = [];
    let successCount = 0;
    let errorCount = 0;

    // Create a notification for each student
    for (const student of students) {
      try {
        console.log(`Creating notification for student: ${student.studentId}`);

        // Create notification data
        const notificationData = {
          userId: student.studentId,
          title,
          message,
          type,
          itemId,
          createdBy
        };

        // Use the improved createNotification function
        const result = await createNotification(notificationData);

        if (result.success) {
          notifications.push(result);
          successCount++;
        } else {
          console.log(`Failed to create notification for student ${student.studentId}: ${result.message}`);
          errorCount++;
        }
      } catch (notificationError) {
        console.error(`Error creating notification for student ${student.studentId}:`, notificationError);
        errorCount++;
        // Continue with next student even if one fails
      }
    }

    console.log(`Notification summary: ${successCount} succeeded, ${errorCount} failed`);

    return {
      success: true,
      notifications,
      summary: {
        total: students.length,
        success: successCount,
        error: errorCount
      }
    };
  } catch (error) {
    console.error('Error notifying course students:', error);

    // For development, return mock success
    if (process.env.NODE_ENV === 'development') {
      return {
        success: true,
        notifications: [],
        mock: true,
        error: error.message,
        summary: {
          total: students.length,
          success: 0,
          error: students.length
        }
      };
    }

    // Return error object instead of empty array
    return {
      success: false,
      message: error.message,
      notifications: []
    };
  }
};

module.exports = {
  createNotification,
  notifyCourseStudents
};
