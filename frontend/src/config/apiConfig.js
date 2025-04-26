/**
 * API Configuration
 *
 * This file contains configuration for API endpoints and timeouts.
 */

// Base URL for API requests
const BASE_URL = 'http://localhost:5000';

// Default timeout for API requests (in milliseconds)
export const DEFAULT_TIMEOUT = 10000;

// API endpoints
export const API_URLS = {
  // Main API endpoint
  main: BASE_URL,

  // Auth endpoints
  auth: `${BASE_URL}/api/auth`,

  // User endpoints
  users: `${BASE_URL}/api/users`,

  // Event endpoints
  events: `${BASE_URL}/api/events`,

  // Course endpoints
  courses: `${BASE_URL}/api/courses`,

  // Mentorship endpoints
  mentorships: `${BASE_URL}/api/mentorships`,

  // Job endpoints
  jobs: `${BASE_URL}/api/jobs`,

  // Notification endpoints
  notifications: `${BASE_URL}/api/notifications`,

  // Connection endpoints
  connections: `${BASE_URL}/api/connections`,

  // Announcement endpoints
  announcements: `${BASE_URL}/api/announcements`,

  // Activity endpoints
  activities: `${BASE_URL}/api/activities`
};

export default API_URLS;
