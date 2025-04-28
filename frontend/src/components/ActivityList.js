import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getUserActivities,
  formatActivityTime,
  getActivityIcon,
  getActivityColor,
  markActivityAsRead,
  markAllActivitiesAsRead,
  createTestActivity
} from '../services/activityService';

/**
 * ActivityList component for displaying user activities
 * @param {Object} props - Component props
 * @param {number} props.limit - Maximum number of activities to display
 * @param {string} props.type - Filter by activity type
 * @param {boolean} props.showMarkAllRead - Whether to show the "Mark all as read" button
 * @param {boolean} props.showEmpty - Whether to show a message when there are no activities
 * @param {string} props.emptyMessage - Message to display when there are no activities
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} - Rendered component
 */
const ActivityList = ({
  limit = 5,
  type = null,
  showMarkAllRead = true,
  showEmpty = true,
  emptyMessage = "No recent activities",
  className = "",
}) => {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch activities - memoized with useCallback to prevent infinite loops
  const fetchActivities = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const token = await currentUser.getIdToken();
      console.log('Fetching activities with token:', token.substring(0, 10) + '...');
      console.log('Current user:', currentUser.email, currentUser.uid);

      const data = await getUserActivities(token, limit, type);
      console.log('Received activities:', data);

      if (data && data.length > 0) {
        setActivities(data);
        setError(null);
      } else {
        console.log('No activities found, trying to create a test activity');
        // Try to create a test activity if none exist
        const testActivity = await createTestActivity(token, {
          type: 'job_application',
          title: 'Welcome Activity',
          description: 'Welcome to the Recent Activities feature!',
          relatedItemType: 'job',
          relatedItemName: 'Software Developer',
          status: 'pending'
        });

        if (testActivity) {
          console.log('Created welcome activity:', testActivity);
          setActivities([testActivity]);
          setError(null);
        } else {
          setActivities([]);
          setError('No activities found. Try creating one with the button below.');
        }
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activities: ' + (err.message || 'Unknown error'));
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser, limit, type]);

  // Mark an activity as read
  const handleMarkAsRead = async (activityId) => {
    if (!currentUser) return;

    try {
      const token = await currentUser.getIdToken();
      const result = await markActivityAsRead(token, activityId);

      if (result) {
        // Update the local state
        setActivities(prevActivities =>
          prevActivities.map(activity =>
            activity._id === activityId
              ? { ...activity, isRead: true }
              : activity
          )
        );
      }
    } catch (err) {
      console.error('Error marking activity as read:', err);
      // Continue without showing an error to the user
    }
  };

  // Mark all activities as read
  const handleMarkAllAsRead = async () => {
    if (!currentUser) return;

    try {
      const token = await currentUser.getIdToken();
      const success = await markAllActivitiesAsRead(token);

      if (success) {
        // Update the local state
        setActivities(prevActivities =>
          prevActivities.map(activity => ({ ...activity, isRead: true }))
        );
      }
    } catch (err) {
      console.error('Error marking all activities as read:', err);
      // Continue without showing an error to the user

      // Optimistically update the UI anyway
      setActivities(prevActivities =>
        prevActivities.map(activity => ({ ...activity, isRead: true }))
      );
    }
  };

  // Create a test activity
  const handleCreateTestActivity = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const token = await currentUser.getIdToken();

      // Generate a random activity type
      const activityTypes = [
        'job_application',
        'job_status_change',
        'mentorship_application',
        'mentorship_status_change',
        'course_enrollment',
        'event_registration',
        'connection_request'
      ];

      const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)];

      // Create activity data based on type
      let activityData = {
        type: randomType,
        title: `Test ${randomType.replace('_', ' ')}`,
        description: `This is a test ${randomType.replace('_', ' ')} activity created at ${new Date().toLocaleTimeString()}`
      };

      // Add type-specific data
      switch (randomType) {
        case 'job_application':
          activityData.relatedItemType = 'job';
          activityData.relatedItemName = 'Software Developer';
          activityData.status = 'pending';
          break;
        case 'job_status_change':
          activityData.relatedItemType = 'job';
          activityData.relatedItemName = 'Software Developer';
          activityData.status = ['accepted', 'rejected'][Math.floor(Math.random() * 2)];
          break;
        case 'mentorship_application':
          activityData.relatedItemType = 'mentorship';
          activityData.relatedItemName = 'Career Development';
          activityData.relatedUserName = 'John Mentor';
          activityData.status = 'pending';
          break;
        case 'mentorship_status_change':
          activityData.relatedItemType = 'mentorship';
          activityData.relatedItemName = 'Career Development';
          activityData.relatedUserName = 'John Mentor';
          activityData.status = ['accepted', 'rejected'][Math.floor(Math.random() * 2)];
          break;
        case 'course_enrollment':
          activityData.relatedItemType = 'course';
          activityData.relatedItemName = 'Web Development';
          activityData.relatedUserName = 'Professor Smith';
          break;
        case 'event_registration':
          activityData.relatedItemType = 'event';
          activityData.relatedItemName = 'Tech Conference';
          break;
        case 'connection_request':
          activityData.relatedItemType = 'connection';
          activityData.relatedUserName = 'Jane Doe';
          activityData.status = 'pending';
          break;
        default:
          break;
      }

      console.log('Creating test activity with data:', activityData);
      const newActivity = await createTestActivity(token, activityData);

      if (newActivity) {
        // Add the new activity to the list
        setActivities(prevActivities => [newActivity, ...prevActivities]);
        console.log('Created test activity:', newActivity);
        setError(null);
      } else {
        setError('Failed to create test activity. Check console for details.');
      }
    } catch (err) {
      console.error('Error creating test activity:', err);
      setError('Error creating test activity: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
      // Refresh the list after a short delay
      setTimeout(fetchActivities, 1000);
    }
  };

  // Fetch activities on mount and when currentUser changes
  useEffect(() => {
    if (currentUser) {
      fetchActivities();

      // Set up a refresh interval (every 5 minutes)
      const intervalId = setInterval(fetchActivities, 300000);

      return () => clearInterval(intervalId);
    }
  }, [currentUser, limit, type, fetchActivities]);

  // Render loading state
  if (loading && activities.length === 0) {
    return (
      <div className={`activity-list ${className}`}>
        <div className="flex justify-center items-center py-4">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`activity-list ${className}`}>
        <div className="text-center py-4 text-red-500">
          <p>{error}</p>
          <button
            onClick={fetchActivities}
            className="mt-2 text-blue-500 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!loading && (!activities || activities.length === 0) && showEmpty) {
    return (
      <div className={`activity-list ${className}`}>
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <p>{emptyMessage}</p>

          {error && (
            <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex flex-col space-y-2 mt-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={handleCreateTestActivity}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Test Activity'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render activities
  return (
    <div className={`activity-list ${className}`}>
      {showMarkAllRead && activities.length > 0 && activities.some(activity => !activity.isRead) && (
        <div className="flex justify-end mb-2">
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Mark all as read
          </button>
        </div>
      )}

      {activities.length > 0 ? (
        <div className="space-y-3">
          {activities.map(activity => {
            const { border, bg } = getActivityColor(activity.type || 'default');
            const icon = getActivityIcon(activity.type || 'default');
            const time = formatActivityTime(activity.createdAt);

            return (
              <div
                key={activity._id}
                className={`
                  flex items-start p-3 rounded-lg border
                  ${activity.isRead ? 'border-gray-200 dark:border-gray-700' : `${border} dark:${border}`}
                  ${activity.isRead ? 'bg-white dark:bg-gray-800' : `${bg} dark:bg-opacity-10`}
                  transition-all duration-200
                `}
              >
                <div className="flex-shrink-0 mr-3 text-2xl">{icon}</div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.title || 'Activity'}
                  </p>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {activity.description || 'No description available'}
                  </p>

                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {time}
                    </span>

                    {!activity.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(activity._id)}
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <p>{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};

export default ActivityList;
