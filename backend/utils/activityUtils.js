const Activity = require('../models/Activity');
const mongoose = require('mongoose');

/**
 * Create an activity directly in the database using the MongoDB driver
 * @param {Object} activityData - Activity data
 * @returns {Promise<Object>} - Created activity
 */
const createActivityDirectly = async (activityData) => {
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

    // Get direct access to the collection using the raw MongoDB driver
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
 * Create an activity for a user
 * @param {Object} activityData - Activity data
 * @returns {Promise<Object>} - Created activity
 */
const createActivity = async (activityData) => {
  try {
    console.log('Creating activity with data:', activityData);

    // Ensure required fields are present
    if (!activityData.userId) {
      console.error('Missing required field: userId');
      return null;
    }

    if (!activityData.type) {
      console.error('Missing required field: type');
      return null;
    }

    if (!activityData.title) {
      console.error('Missing required field: title');
      return null;
    }

    // Try direct insertion first
    const directResult = await createActivityDirectly(activityData);
    if (directResult.success) {
      console.log('Activity created successfully via direct insertion');
      return directResult.data;
    }

    console.log('Direct insertion failed, trying Mongoose model...');

    // If direct insertion fails, try using the Mongoose model
    const activity = new Activity({
      ...activityData,
      isRead: false,
      createdAt: new Date()
    });

    const savedActivity = await activity.save();
    console.log('Activity created successfully via Mongoose:', savedActivity._id);

    // Verify the activity was saved
    const verifyActivity = await Activity.findById(savedActivity._id);
    if (verifyActivity) {
      console.log('Activity verified in database');
      return savedActivity;
    } else {
      console.error('Activity not found in database after save!');
      return null;
    }
  } catch (error) {
    console.error('Error creating activity:', error);
    console.error('Error stack:', error.stack);
    return null;
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
    return null;
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
    return null;
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
    return null;
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
    return null;
  }
};

module.exports = {
  createActivity,
  createJobApplicationActivity,
  createMentorshipApplicationActivity,
  createCourseEnrollmentActivity,
  createEventRegistrationActivity
};
