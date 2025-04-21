const Notification = require('../models/Notification');
const User = require('../models/user');
const admin = require('firebase-admin');

/**
 * Create a notification for a specific user
 * @param {string} userId - The user ID to send the notification to
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {string} type - The notification type (event, job, course, mentorship)
 * @param {string} itemId - The ID of the related item (event, job, course, mentorship)
 * @param {string} createdBy - The user ID of who created the notification
 * @returns {Promise<Object>} - The created notification
 */
const createNotification = async (userId, title, message, type, itemId, createdBy) => {
  try {
    console.log(`Creating notification for user ${userId}: ${title}`);

    // Validate inputs
    if (!userId || !title || !message || !type || !itemId) {
      console.error('Missing required fields for notification:', { userId, title, message, type, itemId });
      throw new Error('Missing required fields for notification');
    }

    const notification = new Notification({
      userId,
      title,
      message,
      type,
      itemId,
      createdBy: createdBy || 'system',
      read: false,
      createdAt: new Date()
    });

    console.log('Saving notification to database...');
    await notification.save();
    console.log(`Notification saved with ID: ${notification._id}`);

    // If we have Firebase set up, we could send a push notification here
    // This would require the user to have a device token stored
    try {
      console.log(`Looking up user ${userId} for push notification`);
      const userDoc = await User.findById(userId);
      if (userDoc && userDoc.fcmToken) {
        console.log(`Sending push notification to user ${userId} with token ${userDoc.fcmToken}`);
        await admin.messaging().send({
          token: userDoc.fcmToken,
          notification: {
            title: title,
            body: message
          },
          data: {
            type: type,
            itemId: itemId
          }
        });
        console.log('Push notification sent successfully');
      } else {
        console.log(`No FCM token found for user ${userId}, skipping push notification`);
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
      // Continue even if push notification fails
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Create notifications for all users with a specific role
 * @param {string} role - The role of users to notify (student, teacher, alumni)
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {string} type - The notification type (event, job, course, mentorship)
 * @param {string} itemId - The ID of the related item (event, job, course, mentorship)
 * @param {string} createdBy - The user ID of who created the notification
 * @returns {Promise<Array>} - Array of created notifications
 */
const notifyUsersByRole = async (role, title, message, type, itemId, createdBy) => {
  try {
    console.log(`Finding users with role: ${role}`);
    const users = await User.find({ role: role });
    console.log(`Found ${users.length} users with role ${role}`);

    const notifications = [];
    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        console.log(`Creating notification for user: ${user._id}`);
        const notification = await createNotification(
          user._id,
          title,
          message,
          type,
          itemId,
          createdBy
        );
        notifications.push(notification);
        successCount++;
      } catch (notificationError) {
        console.error(`Error creating notification for user ${user._id}:`, notificationError);
        errorCount++;
        // Continue with next user even if one fails
      }
    }

    console.log(`Notification summary for ${role}s: ${successCount} succeeded, ${errorCount} failed`);
    return notifications;
  } catch (error) {
    console.error(`Error notifying ${role}s:`, error);
    // Return empty array instead of throwing to prevent breaking the main functionality
    return [];
  }
};

/**
 * Create notifications for all students
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {string} type - The notification type (event, job, course, mentorship)
 * @param {string} itemId - The ID of the related item (event, job, course, mentorship)
 * @param {string} createdBy - The user ID of who created the notification
 * @returns {Promise<Array>} - Array of created notifications
 */
const notifyAllStudents = async (title, message, type, itemId, createdBy) => {
  return notifyUsersByRole('student', title, message, type, itemId, createdBy);
};

/**
 * Create notifications for all teachers
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {string} type - The notification type (event, job, course, mentorship)
 * @param {string} itemId - The ID of the related item (event, job, course, mentorship)
 * @param {string} createdBy - The user ID of who created the notification
 * @returns {Promise<Array>} - Array of created notifications
 */
const notifyAllTeachers = async (title, message, type, itemId, createdBy) => {
  return notifyUsersByRole('teacher', title, message, type, itemId, createdBy);
};

/**
 * Create notifications for all alumni
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {string} type - The notification type (event, job, course, mentorship)
 * @param {string} itemId - The ID of the related item (event, job, course, mentorship)
 * @param {string} createdBy - The user ID of who created the notification
 * @returns {Promise<Array>} - Array of created notifications
 */
const notifyAllAlumni = async (title, message, type, itemId, createdBy) => {
  return notifyUsersByRole('alumni', title, message, type, itemId, createdBy);
};

/**
 * Create notifications for all users
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {string} type - The notification type (event, job, course, mentorship)
 * @param {string} itemId - The ID of the related item (event, job, course, mentorship)
 * @param {string} createdBy - The user ID of who created the notification
 * @returns {Promise<Array>} - Array of created notifications
 */
const notifyAllUsers = async (title, message, type, itemId, createdBy) => {
  try {
    const users = await User.find({});
    const notifications = [];

    for (const user of users) {
      const notification = await createNotification(
        user._id,
        title,
        message,
        type,
        itemId,
        createdBy
      );
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error('Error notifying all users:', error);
    throw error;
  }
};

/**
 * Get all notifications for a user
 * @param {string} userId - The user ID
 * @param {number} limit - The maximum number of notifications to return
 * @param {number} skip - The number of notifications to skip (for pagination)
 * @returns {Promise<Array>} - Array of notifications
 */
const getUserNotifications = async (userId, limit = 50, skip = 0) => {
  try {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    return notifications;
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - The notification ID
 * @returns {Promise<Object>} - The updated notification
 */
const markNotificationAsRead = async (notificationId) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications for a user as read
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - The result of the update operation
 */
const markAllNotificationsAsRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    return result;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Delete a notification
 * @param {string} notificationId - The notification ID
 * @returns {Promise<Object>} - The deleted notification
 */
const deleteNotification = async (notificationId) => {
  try {
    const notification = await Notification.findByIdAndDelete(notificationId);
    return notification;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Delete all notifications for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - The result of the delete operation
 */
const deleteAllUserNotifications = async (userId) => {
  try {
    const result = await Notification.deleteMany({ userId });
    return result;
  } catch (error) {
    console.error('Error deleting all user notifications:', error);
    throw error;
  }
};

/**
 * Get the count of unread notifications for a user
 * @param {string} userId - The user ID
 * @returns {Promise<number>} - The count of unread notifications
 */
const getUnreadNotificationCount = async (userId) => {
  try {
    const count = await Notification.countDocuments({ userId, read: false });
    return count;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  notifyUsersByRole,
  notifyAllStudents,
  notifyAllTeachers,
  notifyAllAlumni,
  notifyAllUsers,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllUserNotifications,
  getUnreadNotificationCount
};
