// API Configuration
import axios from 'axios';

// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // For production environments
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://alumni-networking.onrender.com/api';
  }
  // For development
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Extract the base URL without /api
const BASE_URL = API_BASE_URL.replace(/\/api$/, '');

const config = {
  apiUrl: BASE_URL,
  endpoints: {
    users: `${API_BASE_URL}/users`,
    events: `${API_BASE_URL}/events`,
    auth: `${API_BASE_URL}/auth`,
    courses: `${API_BASE_URL}/courses`,
    jobs: `${API_BASE_URL}/jobs`,
    profiles: `${API_BASE_URL}/profiles`,
  },
  
  // Function to check if the backend is available
  checkBackendAvailability: async () => {
    try {
      await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
      return true;
    } catch (error) {
      console.error("Backend availability check failed:", error);
      return false;
    }
  },
  
  // Default timeout for API requests
  requestTimeout: 10000,
  
  // Default image placeholder
  defaultProfileImage: '/images/default-profile.png',
  defaultEventImage: '/images/default-event.png',
};

export default config; 