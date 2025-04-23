const express = require('express');
const router = express.Router();
const { auth: authenticateToken } = require('../middleware/auth');
const notificationService = require('../services/notificationService');

// Test route to send notifications to all students
router.post('/test-notifications/send-to-students', async (req, res) => {
  try {
    const { title, message, type, itemId, createdBy } = req.body;

    if (!title || !message || !type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const notifications = await notificationService.notifyAllStudents(
      title,
      message,
      type,
      itemId || 'test',
      createdBy || 'system'
    );

    return res.status(200).json({
      success: true,
      message: `Successfully sent ${notifications.length} notifications`,
      notifications
    });
  } catch (error) {
    console.error('Error sending notifications to students:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send notifications to students',
      error: error.message
    });
  }
});

// Get all notifications for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;

    const notifications = await notificationService.getUserNotifications(userId, limit, skip);

    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

// Get unread notification count for the authenticated user
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const count = await notificationService.getUnreadNotificationCount(userId);

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread notification count',
      error: error.message
    });
  }
});

// Mark a notification as read
router.put('/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.notificationId;
    const notification = await notificationService.markNotificationAsRead(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

// Mark all notifications as read for the authenticated user
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const result = await notificationService.markAllNotificationsAsRead(userId);

    res.json({
      success: true,
      message: 'All notifications marked as read',
      result
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
});

// Delete a notification
router.delete('/:notificationId', authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.notificationId;
    const notification = await notificationService.deleteNotification(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
});

// Delete all notifications for the authenticated user
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const result = await notificationService.deleteAllUserNotifications(userId);

    res.json({
      success: true,
      message: 'All notifications deleted successfully',
      result
    });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete all notifications',
      error: error.message
    });
  }
});

module.exports = router;
