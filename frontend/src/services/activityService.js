import axios from 'axios';
import { API_URLS, DEFAULT_TIMEOUT } from '../config/apiConfig';

/**
 * Get activities for the current user
 * @param {string} token - Firebase auth token
 * @param {number} limit - Maximum number of activities to return
 * @param {string} type - Filter by activity type
 * @returns {Promise<Array>} - List of activities
 */
export const getUserActivities = async (token, limit = 10, type = null) => {
  try {
    let url = `${API_URLS.activities}?limit=${limit}`;
    if (type) {
      url += `&type=${type}`;
    }

    console.log('Fetching activities from URL:', url);

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: DEFAULT_TIMEOUT
    });

    console.log('Activity API response:', response.data);

    // Handle different response formats
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    console.warn('Unexpected activity response format:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching user activities:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Status:', error.response.status);
    }
    return [];
  }
};

/**
 * Mark an activity as read
 * @param {string} token - Firebase auth token
 * @param {string} activityId - Activity ID
 * @returns {Promise<Object>} - Updated activity
 */
export const markActivityAsRead = async (token, activityId) => {
  try {
    console.log('Marking activity as read:', activityId);

    const response = await axios.put(
      `${API_URLS.activities}/${activityId}/read`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: DEFAULT_TIMEOUT
      }
    );

    console.log('Mark as read response:', response.data);

    // Handle different response formats
    if (response.data && response.data.success) {
      return response.data.data || true;
    } else if (response.data && response.data.data) {
      return response.data.data;
    } else if (response.status === 200) {
      return true;
    }

    return null;
  } catch (error) {
    console.error('Error marking activity as read:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Status:', error.response.status);
    }
    return null;
  }
};

/**
 * Mark all activities as read
 * @param {string} token - Firebase auth token
 * @returns {Promise<boolean>} - Success status
 */
export const markAllActivitiesAsRead = async (token) => {
  try {
    console.log('Marking all activities as read');

    const response = await axios.put(
      `${API_URLS.activities}/read-all`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: DEFAULT_TIMEOUT
      }
    );

    console.log('Mark all as read response:', response.data);

    // Handle different response formats
    if (response.data && response.data.success) {
      return true;
    } else if (response.status === 200) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error marking all activities as read:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Status:', error.response.status);
    }
    return false;
  }
};

/**
 * Create a test activity (for development only)
 * @param {string} token - Firebase auth token
 * @param {Object} activityData - Activity data
 * @returns {Promise<Object>} - Created activity
 */
export const createTestActivity = async (token, activityData) => {
  try {
    console.log('Creating test activity with data:', activityData);
    console.log('Using API URL:', `${API_URLS.activities}/test`);

    const response = await axios.post(
      `${API_URLS.activities}/test`,
      activityData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: DEFAULT_TIMEOUT
      }
    );

    console.log('Test activity response:', response.data);

    if (response.data && response.data.success) {
      return response.data.data;
    } else if (response.data && response.data.data) {
      return response.data.data;
    } else if (response.status === 201) {
      return activityData; // Return the original data as fallback
    }

    return null;
  } catch (error) {
    console.error('Error creating test activity:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Status:', error.response.status);
    }
    return null;
  }
};

/**
 * Format activity time
 * @param {Date} timestamp - Activity timestamp
 * @returns {string} - Formatted time
 */
export const formatActivityTime = (timestamp) => {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diff = now - activityTime;

  // Less than a minute
  if (diff < 60000) {
    return 'Just now';
  }

  // Less than an hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  // Less than a week
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  // Format as date
  return activityTime.toLocaleDateString();
};

/**
 * Get activity icon based on type
 * @param {string} type - Activity type
 * @returns {string} - Icon emoji
 */
export const getActivityIcon = (type) => {
  switch (type) {
    case 'course_enrollment':
      return '📚';
    case 'course_completion':
      return '🎓';
    case 'assignment_submission':
      return '📝';
    case 'assignment_graded':
      return '✅';
    case 'event_registration':
      return '📅';
    case 'event_attendance':
      return '🎪';
    case 'job_application':
      return '💼';
    case 'job_status_change':
      return '📋';
    case 'mentorship_application':
      return '🤝';
    case 'mentorship_status_change':
      return '📊';
    case 'connection_request':
      return '🔗';
    case 'connection_accepted':
      return '✨';
    case 'announcement_created':
      return '📢';
    case 'announcement_read':
      return '👁️';
    case 'profile_update':
      return '👤';
    case 'course_created':
      return '🧠';
    case 'job_posted':
      return '📣';
    case 'mentorship_posted':
      return '🌟';
    default:
      return '🔔';
  }
};

/**
 * Get activity color based on type
 * @param {string} type - Activity type
 * @returns {Object} - Color classes for border and background
 */
export const getActivityColor = (type) => {
  switch (type) {
    case 'course_enrollment':
    case 'course_completion':
    case 'course_created':
      return { border: 'border-blue-500', bg: 'bg-blue-100' };
    case 'assignment_submission':
    case 'assignment_graded':
      return { border: 'border-green-500', bg: 'bg-green-100' };
    case 'event_registration':
    case 'event_attendance':
      return { border: 'border-purple-500', bg: 'bg-purple-100' };
    case 'job_application':
    case 'job_status_change':
    case 'job_posted':
      return { border: 'border-yellow-500', bg: 'bg-yellow-100' };
    case 'mentorship_application':
    case 'mentorship_status_change':
    case 'mentorship_posted':
      return { border: 'border-indigo-500', bg: 'bg-indigo-100' };
    case 'connection_request':
    case 'connection_accepted':
      return { border: 'border-pink-500', bg: 'bg-pink-100' };
    case 'announcement_created':
    case 'announcement_read':
      return { border: 'border-red-500', bg: 'bg-red-100' };
    case 'profile_update':
      return { border: 'border-gray-500', bg: 'bg-gray-100' };
    default:
      return { border: 'border-gray-500', bg: 'bg-gray-100' };
  }
};
