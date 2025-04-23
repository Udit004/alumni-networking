import axios from 'axios';

/**
 * Fetches enrolled events data for a user
 * @param {string} userId - The user's Firebase UID
 * @returns {Promise<Array>} - Array of enrolled events
 */
export const fetchEnrolledEventsData = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // First try to get the MongoDB user ID
    const userRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/users/firebase/${userId}`);
    const mongoUser = userRes.data;

    if (!mongoUser || !mongoUser._id) {
      throw new Error('User data not found');
    }

    // Then fetch enrolled events
    const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/events`);
    const allEvents = response.data;

    // Filter events where user is registered
    const userEvents = allEvents.filter(event => {
      if (!event.registeredUsers || !Array.isArray(event.registeredUsers)) {
        return false;
      }
      return event.registeredUsers.some(ru =>
        ru && ru.userId && ru.userId._id === mongoUser._id
      );
    });

    // Process events for display
    const processedEvents = userEvents.map(event => ({
      ...event,
      id: event._id, // Ensure we have both id and _id for compatibility
      date: new Date(event.date), // Convert date string to Date object
      isRegistered: true
    }));

    // Sort events by date
    processedEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    return processedEvents;
  } catch (err) {
    console.error('Error fetching enrolled events:', err);
    return [];
  }
};
