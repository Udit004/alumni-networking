/**
 * API Configuration
 *
 * This file contains configuration for API endpoints and timeouts.
 */

// Always use the deployed URL
const getApiBaseUrl = () => {
  // Always use the deployed URL regardless of environment
  return 'https://alumni-networking.onrender.com';
};

// Base URL for API requests
const BASE_URL = getApiBaseUrl();

// Default timeout for API requests (in milliseconds)
export const DEFAULT_TIMEOUT = 30000; // Increased to 30 seconds for better reliability

// Debug logging for API configuration
console.log('🔧 API Configuration:', {
  environment: process.env.NODE_ENV,
  BASE_URL,
  note: 'Using deployed API URL for all environments'
});

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
  courseApplications: `${BASE_URL}/api/course-applications`,

  // Mentorship endpoints
  mentorships: `${BASE_URL}/api/mentorships`,
  mentorshipApplications: `${BASE_URL}/api/mentorship-applications`,

  // Job endpoints
  jobs: `${BASE_URL}/api/jobs`,
  jobApplications: `${BASE_URL}/api/job-applications`,

  // Notification endpoints
  notifications: `${BASE_URL}/api/notifications`,

  // Connection endpoints
  connections: `${BASE_URL}/api/connections`,

  // Announcement endpoints
  announcements: `${BASE_URL}/api/announcements`,

  // Activity endpoints (deprecated)
  activities: `${BASE_URL}/api/activities`
};

// Specific endpoint functions
export const ENDPOINTS = {
  // Auth
  login: '/api/auth/login',
  register: '/api/auth/register',

  // User
  userProfile: '/api/users/profile',

  // Events
  events: '/api/events',
  eventsByUser: (userId) => `/api/events/user/${userId}`,
  eventById: (eventId) => `/api/events/${eventId}`,

  // Jobs
  jobs: '/api/jobs',
  jobsByUser: (userId) => `/api/jobs/user/${userId}`,
  jobById: (jobId) => `/api/jobs/${jobId}`,
  jobApplications: '/api/job-applications',
  jobApplicationsByUser: (userId) => `/api/job-applications/user/${userId}`,

  // Mentorships
  mentorships: '/api/mentorships',
  mentorshipsByUser: (userId) => `/api/mentorships/user/${userId}`,
  mentorshipById: (mentorshipId) => `/api/mentorships/${mentorshipId}`,
  mentorshipApplications: '/api/mentorship-applications',
  mentorshipApplicationsByUser: (userId) => `/api/mentorship-applications/user/${userId}`,

  // Courses
  courses: '/api/courses',
  coursesByUser: (userId) => `/api/courses/user/${userId}`,
  courseById: (courseId) => `/api/courses/${courseId}`,
  courseApplications: '/api/course-applications',
  courseApplicationsByUser: (userId) => `/api/course-applications/user/${userId}`,

  // Announcements
  announcements: '/api/announcements',
  announcementsByUser: (userId) => `/api/announcements/user/${userId}`,

  // Connections
  connections: '/api/connections',
  connectionsByUser: (userId) => `/api/connections/user/${userId}`,

  // Notifications
  notifications: '/api/notifications',
  notificationsByUser: (userId) => `/api/notifications/user/${userId}`,
};

export default {
  API_URLS,
  DEFAULT_TIMEOUT,
  ENDPOINTS
};
