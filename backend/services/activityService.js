const Activity = require('../models/Activity');
const User = require('../models/user');

/**
 * Create a new activity
 * @param {Object} activityData - Activity data
 * @returns {Promise<Object>} - Created activity
 */
const createActivity = async (activityData) => {
  try {
    const activity = new Activity(activityData);
    await activity.save();
    return activity;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
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
    let query = { userId };
    
    if (type) {
      query.type = type;
    }
    
    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);
      
    return activities;
  } catch (error) {
    console.error('Error getting user activities:', error);
    throw error;
  }
};

/**
 * Mark an activity as read
 * @param {String} activityId - Activity ID
 * @returns {Promise<Object>} - Updated activity
 */
const markActivityAsRead = async (activityId) => {
  try {
    const activity = await Activity.findByIdAndUpdate(
      activityId,
      { isRead: true },
      { new: true }
    );
    return activity;
  } catch (error) {
    console.error('Error marking activity as read:', error);
    throw error;
  }
};

/**
 * Mark all activities for a user as read
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Result of the operation
 */
const markAllActivitiesAsRead = async (userId) => {
  try {
    const result = await Activity.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
    return result;
  } catch (error) {
    console.error('Error marking all activities as read:', error);
    throw error;
  }
};

/**
 * Delete an activity
 * @param {String} activityId - Activity ID
 * @returns {Promise<Object>} - Result of the operation
 */
const deleteActivity = async (activityId) => {
  try {
    const result = await Activity.findByIdAndDelete(activityId);
    return result;
  } catch (error) {
    console.error('Error deleting activity:', error);
    throw error;
  }
};

/**
 * Create a course enrollment activity
 * @param {String} userId - User ID
 * @param {String} courseId - Course ID
 * @param {String} courseName - Course name
 * @param {String} teacherId - Teacher ID
 * @param {String} teacherName - Teacher name
 * @returns {Promise<Object>} - Created activity
 */
const createCourseEnrollmentActivity = async (userId, courseId, courseName, teacherId, teacherName) => {
  return createActivity({
    userId,
    type: 'course_enrollment',
    title: 'Enrolled in a new course',
    description: `You have enrolled in ${courseName}`,
    relatedItemId: courseId,
    relatedItemType: 'course',
    relatedItemName: courseName,
    relatedUserId: teacherId,
    relatedUserName: teacherName
  });
};

/**
 * Create a job application activity
 * @param {String} userId - User ID
 * @param {String} jobId - Job ID
 * @param {String} jobTitle - Job title
 * @param {String} companyName - Company name
 * @returns {Promise<Object>} - Created activity
 */
const createJobApplicationActivity = async (userId, jobId, jobTitle, companyName) => {
  return createActivity({
    userId,
    type: 'job_application',
    title: 'Applied for a job',
    description: `You have applied for ${jobTitle} at ${companyName}`,
    relatedItemId: jobId,
    relatedItemType: 'job',
    relatedItemName: jobTitle,
    status: 'pending'
  });
};

/**
 * Create a job status change activity
 * @param {String} userId - User ID
 * @param {String} jobId - Job ID
 * @param {String} jobTitle - Job title
 * @param {String} companyName - Company name
 * @param {String} status - New status
 * @returns {Promise<Object>} - Created activity
 */
const createJobStatusChangeActivity = async (userId, jobId, jobTitle, companyName, status) => {
  let title = 'Job application status updated';
  let description = `Your application for ${jobTitle} at ${companyName} has been ${status}`;
  
  return createActivity({
    userId,
    type: 'job_status_change',
    title,
    description,
    relatedItemId: jobId,
    relatedItemType: 'job',
    relatedItemName: jobTitle,
    status
  });
};

/**
 * Create a mentorship application activity
 * @param {String} userId - User ID
 * @param {String} mentorshipId - Mentorship ID
 * @param {String} mentorshipTitle - Mentorship title
 * @param {String} mentorId - Mentor ID
 * @param {String} mentorName - Mentor name
 * @returns {Promise<Object>} - Created activity
 */
const createMentorshipApplicationActivity = async (userId, mentorshipId, mentorshipTitle, mentorId, mentorName) => {
  return createActivity({
    userId,
    type: 'mentorship_application',
    title: 'Applied for mentorship',
    description: `You have applied for ${mentorshipTitle} with ${mentorName}`,
    relatedItemId: mentorshipId,
    relatedItemType: 'mentorship',
    relatedItemName: mentorshipTitle,
    relatedUserId: mentorId,
    relatedUserName: mentorName,
    status: 'pending'
  });
};

/**
 * Create a mentorship status change activity
 * @param {String} userId - User ID
 * @param {String} mentorshipId - Mentorship ID
 * @param {String} mentorshipTitle - Mentorship title
 * @param {String} mentorId - Mentor ID
 * @param {String} mentorName - Mentor name
 * @param {String} status - New status
 * @returns {Promise<Object>} - Created activity
 */
const createMentorshipStatusChangeActivity = async (userId, mentorshipId, mentorshipTitle, mentorId, mentorName, status) => {
  let title = 'Mentorship application status updated';
  let description = `Your application for ${mentorshipTitle} with ${mentorName} has been ${status}`;
  
  return createActivity({
    userId,
    type: 'mentorship_status_change',
    title,
    description,
    relatedItemId: mentorshipId,
    relatedItemType: 'mentorship',
    relatedItemName: mentorshipTitle,
    relatedUserId: mentorId,
    relatedUserName: mentorName,
    status
  });
};

/**
 * Create an event registration activity
 * @param {String} userId - User ID
 * @param {String} eventId - Event ID
 * @param {String} eventTitle - Event title
 * @param {String} eventDate - Event date
 * @returns {Promise<Object>} - Created activity
 */
const createEventRegistrationActivity = async (userId, eventId, eventTitle, eventDate) => {
  return createActivity({
    userId,
    type: 'event_registration',
    title: 'Registered for an event',
    description: `You have registered for ${eventTitle} on ${eventDate}`,
    relatedItemId: eventId,
    relatedItemType: 'event',
    relatedItemName: eventTitle
  });
};

/**
 * Create an announcement read activity
 * @param {String} userId - User ID
 * @param {String} announcementId - Announcement ID
 * @param {String} announcementTitle - Announcement title
 * @param {String} courseId - Course ID
 * @param {String} courseName - Course name
 * @returns {Promise<Object>} - Created activity
 */
const createAnnouncementReadActivity = async (userId, announcementId, announcementTitle, courseId, courseName) => {
  return createActivity({
    userId,
    type: 'announcement_read',
    title: 'Read an announcement',
    description: `You have read the announcement "${announcementTitle}" for ${courseName}`,
    relatedItemId: announcementId,
    relatedItemType: 'announcement',
    relatedItemName: announcementTitle,
    metadata: {
      courseId,
      courseName
    }
  });
};

/**
 * Create a connection request activity
 * @param {String} userId - User ID
 * @param {String} targetUserId - Target user ID
 * @param {String} targetUserName - Target user name
 * @returns {Promise<Object>} - Created activity
 */
const createConnectionRequestActivity = async (userId, targetUserId, targetUserName) => {
  return createActivity({
    userId,
    type: 'connection_request',
    title: 'Sent a connection request',
    description: `You have sent a connection request to ${targetUserName}`,
    relatedUserId: targetUserId,
    relatedUserName: targetUserName,
    relatedItemType: 'connection',
    status: 'pending'
  });
};

/**
 * Create a connection accepted activity
 * @param {String} userId - User ID
 * @param {String} targetUserId - Target user ID
 * @param {String} targetUserName - Target user name
 * @returns {Promise<Object>} - Created activity
 */
const createConnectionAcceptedActivity = async (userId, targetUserId, targetUserName) => {
  return createActivity({
    userId,
    type: 'connection_accepted',
    title: 'Connection request accepted',
    description: `${targetUserName} has accepted your connection request`,
    relatedUserId: targetUserId,
    relatedUserName: targetUserName,
    relatedItemType: 'connection',
    status: 'accepted'
  });
};

module.exports = {
  createActivity,
  getUserActivities,
  markActivityAsRead,
  markAllActivitiesAsRead,
  deleteActivity,
  createCourseEnrollmentActivity,
  createJobApplicationActivity,
  createJobStatusChangeActivity,
  createMentorshipApplicationActivity,
  createMentorshipStatusChangeActivity,
  createEventRegistrationActivity,
  createAnnouncementReadActivity,
  createConnectionRequestActivity,
  createConnectionAcceptedActivity
};
