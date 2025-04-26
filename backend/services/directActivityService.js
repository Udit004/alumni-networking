const mongoose = require('mongoose');
const Activity = require('../models/Activity');

/**
 * Create an activity directly in the database
 * @param {Object} activityData - Activity data
 * @returns {Promise<Object>} - Created activity
 */
const createActivity = async (activityData) => {
  try {
    console.log('Creating activity directly with data:', activityData);
    
    // Ensure required fields are present
    if (!activityData.userId) {
      console.error('Missing required field: userId');
      return { success: false, message: 'Missing required field: userId' };
    }
    
    if (!activityData.type) {
      console.error('Missing required field: type');
      return { success: false, message: 'Missing required field: type' };
    }
    
    if (!activityData.title) {
      console.error('Missing required field: title');
      return { success: false, message: 'Missing required field: title' };
    }
    
    // Ensure createdAt and isRead are set
    const completeActivityData = {
      ...activityData,
      isRead: activityData.isRead !== undefined ? activityData.isRead : false,
      createdAt: activityData.createdAt || new Date()
    };
    
    // Get direct access to the collection
    const db = mongoose.connection.db;
    const collection = db.collection('activities');
    
    // Insert document directly
    const result = await collection.insertOne(completeActivityData);
    console.log('Direct MongoDB insert result:', result);
    
    if (result.acknowledged) {
      console.log('Activity created successfully with ID:', result.insertedId);
      
      // Verify the activity was saved by fetching it
      const verifyActivity = await collection.findOne({ _id: result.insertedId });
      if (verifyActivity) {
        console.log('Activity verified in database');
        return { 
          success: true, 
          data: {
            _id: result.insertedId,
            ...completeActivityData
          }
        };
      } else {
        console.error('Activity not found in database after direct insert!');
        return { success: false, message: 'Activity not found after insert' };
      }
    } else {
      console.error('Failed to insert activity directly');
      return { success: false, message: 'Failed to insert activity' };
    }
  } catch (error) {
    console.error('Error creating activity directly:', error);
    console.error('Error stack:', error.stack);
    return { success: false, message: error.message };
  }
};

/**
 * Create a job application activity
 * @param {String} userId - User ID
 * @param {Object} job - Job object
 * @returns {Promise<Object>} - Created activity
 */
const createJobApplicationActivity = async (userId, job) => {
  try {
    console.log('Creating job application activity for user:', userId);
    
    return await createActivity({
      userId,
      type: 'job_application',
      title: 'Applied for a job',
      description: `You applied for ${job.title} at ${job.company}`,
      relatedItemId: job._id.toString(),
      relatedItemType: 'job',
      relatedItemName: job.title,
      status: 'pending'
    });
  } catch (error) {
    console.error('Error creating job application activity:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Create a mentorship application activity
 * @param {String} userId - User ID
 * @param {Object} mentorship - Mentorship object
 * @returns {Promise<Object>} - Created activity
 */
const createMentorshipApplicationActivity = async (userId, mentorship) => {
  try {
    return await createActivity({
      userId,
      type: 'mentorship_application',
      title: 'Applied for mentorship',
      description: `You applied for ${mentorship.title}`,
      relatedItemId: mentorship._id.toString(),
      relatedItemType: 'mentorship',
      relatedItemName: mentorship.title,
      status: 'pending'
    });
  } catch (error) {
    console.error('Error creating mentorship application activity:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Create a course enrollment activity
 * @param {String} userId - User ID
 * @param {Object} course - Course object
 * @returns {Promise<Object>} - Created activity
 */
const createCourseEnrollmentActivity = async (userId, course) => {
  try {
    return await createActivity({
      userId,
      type: 'course_enrollment',
      title: 'Applied for a course',
      description: `You applied for ${course.title}`,
      relatedItemId: course._id.toString(),
      relatedItemType: 'course',
      relatedItemName: course.title,
      relatedUserId: course.createdBy,
      relatedUserName: course.createdByName || 'Teacher',
      status: 'pending'
    });
  } catch (error) {
    console.error('Error creating course enrollment activity:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Create an event registration activity
 * @param {String} userId - User ID
 * @param {Object} event - Event object
 * @returns {Promise<Object>} - Created activity
 */
const createEventRegistrationActivity = async (userId, event) => {
  try {
    return await createActivity({
      userId,
      type: 'event_registration',
      title: 'Registered for an event',
      description: `You registered for ${event.title}`,
      relatedItemId: event._id.toString(),
      relatedItemType: 'event',
      relatedItemName: event.title
    });
  } catch (error) {
    console.error('Error creating event registration activity:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Get activities for a user
 * @param {String} userId - User ID
 * @param {Number} limit - Maximum number of activities to return
 * @param {String} type - Filter by activity type
 * @returns {Promise<Array>} - List of activities
 */
const getUserActivities = async (userId, limit = 10, type = null) => {
  try {
    console.log('Getting activities for user:', userId);
    
    // Get direct access to the collection
    const db = mongoose.connection.db;
    const collection = db.collection('activities');
    
    // Build query
    let query = { userId };
    
    if (type) {
      query.type = type;
    }
    
    // Execute query
    const activities = await collection.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    console.log(`Found ${activities.length} activities for user ${userId}`);
    
    return activities;
  } catch (error) {
    console.error('Error getting user activities:', error);
    return [];
  }
};

/**
 * Mark an activity as read
 * @param {String} activityId - Activity ID
 * @returns {Promise<Object>} - Updated activity
 */
const markActivityAsRead = async (activityId) => {
  try {
    // Get direct access to the collection
    const db = mongoose.connection.db;
    const collection = db.collection('activities');
    
    // Convert string ID to ObjectId if needed
    const id = typeof activityId === 'string' && activityId.length === 24
      ? new mongoose.Types.ObjectId(activityId)
      : activityId;
    
    // Update document
    const result = await collection.updateOne(
      { _id: id },
      { $set: { isRead: true } }
    );
    
    if (result.modifiedCount > 0) {
      return { success: true, message: 'Activity marked as read' };
    } else {
      return { success: false, message: 'Activity not found or already read' };
    }
  } catch (error) {
    console.error('Error marking activity as read:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Mark all activities for a user as read
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Result of the operation
 */
const markAllActivitiesAsRead = async (userId) => {
  try {
    // Get direct access to the collection
    const db = mongoose.connection.db;
    const collection = db.collection('activities');
    
    // Update documents
    const result = await collection.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );
    
    return { 
      success: true, 
      message: `${result.modifiedCount} activities marked as read` 
    };
  } catch (error) {
    console.error('Error marking all activities as read:', error);
    return { success: false, message: error.message };
  }
};

module.exports = {
  createActivity,
  getUserActivities,
  markActivityAsRead,
  markAllActivitiesAsRead,
  createJobApplicationActivity,
  createMentorshipApplicationActivity,
  createCourseEnrollmentActivity,
  createEventRegistrationActivity
};
