const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');

// Test endpoint to send a notification to all students
router.post('/send-to-students', async (req, res) => {
  try {
    console.log('Received request to send test notification to all students');
    const { title, message, type, itemId, createdBy } = req.body;
    
    // Validate required fields
    if (!title || !message || !type || !itemId || !createdBy) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['title', 'message', 'type', 'itemId', 'createdBy'],
        received: { title, message, type, itemId, createdBy }
      });
    }
    
    console.log('Sending test notification with data:', { title, message, type, itemId, createdBy });
    
    // Send notification to all students
    const notifications = await notificationService.notifyAllStudents(
      title,
      message,
      type,
      itemId,
      createdBy
    );
    
    console.log(`Successfully sent ${notifications.length} notifications`);
    
    res.status(200).json({
      success: true,
      message: `Successfully sent ${notifications.length} notifications`,
      notifications
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: error.message
    });
  }
});

// Test endpoint to get all notifications for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Fetching notifications for user: ${userId}`);
    
    const notifications = await notificationService.getUserNotifications(userId);
    
    console.log(`Found ${notifications.length} notifications for user ${userId}`);
    
    res.status(200).json({
      success: true,
      count: notifications.length,
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

module.exports = router;
