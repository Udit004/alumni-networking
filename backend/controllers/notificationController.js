const Notification = require('../models/Notification');
const User = require('../models/User');

// Get all notifications for a user
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.uid;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.uid;
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    if (notification.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this notification'
      });
    }
    
    notification.read = true;
    await notification.save();
    
    return res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read for a user
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );
    
    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.uid;
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    if (notification.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notification'
      });
    }
    
    await notification.deleteOne();
    
    return res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// Create a notification
exports.createNotification = async (notificationData) => {
  try {
    const notification = new Notification({
      userId: notificationData.userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      itemId: notificationData.itemId,
      read: false,
      createdBy: notificationData.createdBy,
      createdAt: new Date()
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Send notification to all students
exports.sendToAllStudents = async (req, res) => {
  try {
    const { title, message, type, itemId, createdBy } = req.body;
    
    if (!title || !message || !type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Find all users with role 'student'
    const students = await User.find({ role: 'student' });
    
    if (!students || students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No students found'
      });
    }
    
    const notifications = [];
    
    // Create a notification for each student
    for (const student of students) {
      const notification = await exports.createNotification({
        userId: student.firebaseUID,
        title,
        message,
        type,
        itemId,
        createdBy: createdBy || 'system'
      });
      
      notifications.push(notification);
    }
    
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
};

// Helper function to send event notifications to all students
exports.sendEventNotificationToAllStudents = async (event) => {
  try {
    // Find all users with role 'student'
    const students = await User.find({ role: 'student' });
    
    if (!students || students.length === 0) {
      console.log('No students found for event notification');
      return [];
    }
    
    const notifications = [];
    
    // Create a notification for each student
    for (const student of students) {
      const notification = await exports.createNotification({
        userId: student.firebaseUID,
        title: 'New Event Available',
        message: `A new event "${event.title}" has been added. Check it out!`,
        type: 'event',
        itemId: event._id.toString(),
        createdBy: event.createdBy || 'system'
      });
      
      notifications.push(notification);
    }
    
    console.log(`Successfully sent ${notifications.length} event notifications`);
    return notifications;
  } catch (error) {
    console.error('Error sending event notifications to students:', error);
    throw error;
  }
};

// Helper function to send job notifications to all students
exports.sendJobNotificationToAllStudents = async (job) => {
  try {
    // Find all users with role 'student'
    const students = await User.find({ role: 'student' });
    
    if (!students || students.length === 0) {
      console.log('No students found for job notification');
      return [];
    }
    
    const notifications = [];
    
    // Create a notification for each student
    for (const student of students) {
      const notification = await exports.createNotification({
        userId: student.firebaseUID,
        title: 'New Job Opportunity',
        message: `A new job "${job.title}" at ${job.company} has been posted. Apply now!`,
        type: 'job',
        itemId: job._id.toString(),
        createdBy: job.createdBy || 'system'
      });
      
      notifications.push(notification);
    }
    
    console.log(`Successfully sent ${notifications.length} job notifications`);
    return notifications;
  } catch (error) {
    console.error('Error sending job notifications to students:', error);
    throw error;
  }
};

// Helper function to send course notifications to all students
exports.sendCourseNotificationToAllStudents = async (course) => {
  try {
    // Find all users with role 'student'
    const students = await User.find({ role: 'student' });
    
    if (!students || students.length === 0) {
      console.log('No students found for course notification');
      return [];
    }
    
    const notifications = [];
    
    // Create a notification for each student
    for (const student of students) {
      const notification = await exports.createNotification({
        userId: student.firebaseUID,
        title: 'New Course Available',
        message: `A new course "${course.title}" by ${course.teacherName} is now available for enrollment.`,
        type: 'course',
        itemId: course._id.toString(),
        createdBy: course.teacherId || 'system'
      });
      
      notifications.push(notification);
    }
    
    console.log(`Successfully sent ${notifications.length} course notifications`);
    return notifications;
  } catch (error) {
    console.error('Error sending course notifications to students:', error);
    throw error;
  }
};

// Helper function to send mentorship notifications to all students
exports.sendMentorshipNotificationToAllStudents = async (mentorship) => {
  try {
    // Find all users with role 'student'
    const students = await User.find({ role: 'student' });
    
    if (!students || students.length === 0) {
      console.log('No students found for mentorship notification');
      return [];
    }
    
    const notifications = [];
    
    // Create a notification for each student
    for (const student of students) {
      const notification = await exports.createNotification({
        userId: student.firebaseUID,
        title: 'New Mentorship Opportunity',
        message: `A new mentorship program "${mentorship.title}" by ${mentorship.mentorName} is now available.`,
        type: 'mentorship',
        itemId: mentorship._id.toString(),
        createdBy: mentorship.mentorId || 'system'
      });
      
      notifications.push(notification);
    }
    
    console.log(`Successfully sent ${notifications.length} mentorship notifications`);
    return notifications;
  } catch (error) {
    console.error('Error sending mentorship notifications to students:', error);
    throw error;
  }
};
