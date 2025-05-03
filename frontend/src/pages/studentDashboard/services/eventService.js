import axios from 'axios';
import { getStudentEnrolledEvents } from '../../../services/firestoreFallbackService';
import { API_URLS } from '../../../config/apiConfig';

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

    // Define base URLs to try in order
    const baseUrls = [
      API_URLS.main, // From apiConfig.js
      'https://alumni-networking.onrender.com',
      'http://localhost:5000'
    ];

    // Try each base URL until one works
    for (const baseUrl of baseUrls) {
      try {
        console.log(`Trying to fetch user data from ${baseUrl}...`);

        // First try to get the MongoDB user ID
        const userRes = await axios.get(`${baseUrl}/api/users/firebase/${userId}`, {
          timeout: 5000 // Add timeout to avoid long waits
        });

        const mongoUser = userRes.data;

        if (!mongoUser || !mongoUser._id) {
          console.log(`User data from ${baseUrl} is invalid:`, mongoUser);
          continue; // Try next URL
        }

        console.log(`Successfully fetched user data from ${baseUrl}`);

        // Then fetch all events
        const response = await axios.get(`${baseUrl}/api/events`, {
          timeout: 5000 // Add timeout to avoid long waits
        });

        const allEvents = response.data;

        if (!allEvents || !Array.isArray(allEvents)) {
          console.log(`Events data from ${baseUrl} is invalid:`, allEvents);
          continue; // Try next URL
        }

        console.log(`Successfully fetched ${allEvents.length} events from ${baseUrl}`);

        // Filter events where user is registered
        const userEvents = allEvents.filter(event => {
          if (!event.registeredUsers || !Array.isArray(event.registeredUsers)) {
            return false;
          }
          return event.registeredUsers.some(ru =>
            ru && ru.userId && (
              // Check for both string IDs and object IDs
              ru.userId === mongoUser._id ||
              ru.userId._id === mongoUser._id ||
              ru.userId === userId
            )
          );
        });

        // Process events for display
        const processedEvents = userEvents.map(event => ({
          ...event,
          id: event._id || event.id, // Ensure we have both id and _id for compatibility
          _id: event._id || event.id,
          date: new Date(event.date), // Convert date string to Date object
          isRegistered: true
        }));

        // Sort events by date
        processedEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

        console.log(`Found ${processedEvents.length} enrolled events for user ${userId}`);
        return processedEvents;
      } catch (urlErr) {
        console.log(`Failed to fetch events from ${baseUrl}:`, urlErr.message);
        // Continue to next URL
      }
    }

    // If all API attempts fail, try Firestore fallback
    console.log('All API attempts failed, using Firestore fallback for events...');
    const firestoreEvents = await getStudentEnrolledEvents(userId);
    console.log(`Found ${firestoreEvents.length} enrolled events from Firestore fallback`);

    // Process events from Firestore
    const processedEvents = firestoreEvents.map(event => ({
      ...event,
      id: event._id || event.id,
      _id: event._id || event.id,
      date: event.date instanceof Date ? event.date : new Date(event.date),
      isRegistered: true
    }));

    // Sort events by date
    processedEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    return processedEvents;
  } catch (err) {
    console.error('Error fetching enrolled events:', err);
    // Return empty array as last resort
    return [];
  }
};
