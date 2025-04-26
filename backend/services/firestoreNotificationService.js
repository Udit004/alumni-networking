const admin = require('firebase-admin');

/**
 * Create a notification for a specific user in Firestore
 * @param {string} userId - The user ID to send the notification to
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {string} type - The notification type (event, job, course, mentorship, announcement)
 * @param {string} itemId - The ID of the related item (event, job, course, mentorship, announcement)
 * @param {string} createdBy - The user ID of who created the notification
 * @returns {Promise<Object>} - The created notification
 */
const createNotification = async (userId, title, message, type, itemId, createdBy) => {
  try {
    console.log(`Creating Firestore notification for user ${userId}: ${title}`);

    // Validate inputs
    if (!userId || !title || !message || !type || !itemId) {
      console.error('Missing required fields for notification:', { userId, title, message, type, itemId });
      throw new Error('Missing required fields for notification');
    }

    // Create notification data
    const notificationData = {
      userId,
      title,
      message,
      type,
      itemId,
      createdBy: createdBy || 'system',
      read: false,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString() // Backup readable timestamp
    };

    console.log('Saving notification to Firestore:', notificationData);

    // Check if Firestore is initialized
    if (!admin.firestore) {
      console.error('Firestore is not initialized!');
      throw new Error('Firestore is not initialized');
    }

    console.log('Firestore instance:', admin.firestore() ? 'Available' : 'Not available');

    // Add the notification to Firestore
    const docRef = await admin.firestore().collection('notifications').add(notificationData);
    console.log(`Notification created with ID: ${docRef.id}`);

    // Return the created notification
    return {
      id: docRef.id,
      ...notificationData,
      timestamp: new Date() // Use a JavaScript Date for immediate use
    };
  } catch (error) {
    console.error('Error creating Firestore notification:', error);
    throw error;
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
 * @returns {Promise<Array>} - Array of created notifications
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
        const notification = await createNotification(
          student.studentId,
          title,
          message,
          type,
          itemId,
          createdBy
        );
        notifications.push(notification);
        successCount++;
      } catch (notificationError) {
        console.error(`Error creating notification for student ${student.studentId}:`, notificationError);
        errorCount++;
        // Continue with next student even if one fails
      }
    }

    console.log(`Notification summary: ${successCount} succeeded, ${errorCount} failed`);
    return notifications;
  } catch (error) {
    console.error('Error notifying course students:', error);
    // Return empty array instead of throwing to prevent breaking the main functionality
    return [];
  }
};

module.exports = {
  createNotification,
  notifyCourseStudents
};
