/**
 * API Configuration
 * 
 * This file centralizes all API endpoint configurations and provides
 * fallback mechanisms for when backend services are unavailable.
 */

// Base URLs for different services
const API_URLS = {
  // Main backend API
  main: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  
  // Chat service
  chat: process.env.REACT_APP_CHAT_API_URL || 'http://localhost:5001/api',
  
  // MongoDB direct access
  mongodb: process.env.REACT_APP_MONGODB_API_URL || 'http://localhost:5001/api/messages-db',
  
  // Notification service
  notifications: process.env.REACT_APP_NOTIFICATIONS_API_URL || 'http://localhost:5000/api/notifications',
  
  // Events service
  events: process.env.REACT_APP_EVENTS_API_URL || 'http://localhost:5000/api/events',
  
  // Courses service
  courses: process.env.REACT_APP_COURSES_API_URL || 'http://localhost:5000/api/courses',
};

// Health check endpoints
const HEALTH_CHECK_URLS = {
  main: process.env.REACT_APP_API_HEALTH_URL || 'http://localhost:5000/healthcheck',
  chat: process.env.REACT_APP_CHAT_HEALTH_URL || 'http://localhost:5001/healthcheck',
};

// Default timeout for API requests (in milliseconds)
const DEFAULT_TIMEOUT = 3000;

// Maximum number of retries for API requests
const MAX_RETRIES = 1;

// Whether to use Firestore as fallback when backend is unavailable
const USE_FIRESTORE_FALLBACK = true;

// Export configuration
export {
  API_URLS,
  HEALTH_CHECK_URLS,
  DEFAULT_TIMEOUT,
  MAX_RETRIES,
  USE_FIRESTORE_FALLBACK
};

/**
 * Helper function to check if a backend service is available
 * @param {string} healthCheckUrl - URL to check
 * @returns {Promise<boolean>} - Whether the service is available
 */
export const isBackendAvailable = async (healthCheckUrl) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(healthCheckUrl, { 
      signal: controller.signal,
      method: 'GET'
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn(`Backend service at ${healthCheckUrl} is unavailable:`, error.message);
    return false;
  }
};
