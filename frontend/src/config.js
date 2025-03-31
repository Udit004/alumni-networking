// API Configuration
import axios from 'axios';

// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // For production environments
  if (process.env.NODE_ENV === 'production') {
    return 'https://alumni-networking.onrender.com';
  }
  // For development
  return 'http://localhost:5000';
};

const API_BASE_URL = getApiBaseUrl();

// Debug logging for API configuration
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API Configuration:', {
    environment: process.env.NODE_ENV,
    API_BASE_URL
  });
}

const config = {
  apiUrl: API_BASE_URL,
  endpoints: {
    users: `${API_BASE_URL}/api/users`,
    events: `${API_BASE_URL}/api/events`,
    // Direct endpoint that skips population for fallback
    eventsNoPopulate: `${API_BASE_URL}/api/events?nopopulate=true`,
    // Firebase-specific endpoint that completely avoids ObjectId casting
    eventsFirebase: `${API_BASE_URL}/api/events-firebase`,
    auth: `${API_BASE_URL}/api/auth`,
    courses: `${API_BASE_URL}/api/courses`,
    jobs: `${API_BASE_URL}/api/jobs`,
    profiles: `${API_BASE_URL}/api/profiles`,
    health: `${API_BASE_URL}/api/health`
  },
  
  // Function to check if the backend is available
  checkBackendAvailability: async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Checking backend availability at:', config.endpoints.health);
      }
      const response = await axios.get(config.endpoints.health, { 
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      if (process.env.NODE_ENV === 'development') {
        console.log('Backend health check response:', {
          status: response.status,
          data: response.data
        });
      }
      return response.status === 200;
    } catch (error) {
      console.error("Backend availability check failed:", error);
      if (process.env.NODE_ENV === 'development') {
        console.log('Full error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: error.config,
          url: error.config?.url
        });
      }
      return false;
    }
  },
  
  // Default timeout for API requests
  requestTimeout: 10000,
  
  // Default image placeholder
  defaultProfileImage: '/images/default-profile.png',
  defaultEventImage: '/images/default-event.png',
};

// Debug logging for endpoints
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API Endpoints:', config.endpoints);
}

export default config; 