const config = {
  apiUrl: process.env.REACT_APP_API_URL,
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // API endpoints with error handling
  endpoints: {
    users: `${process.env.REACT_APP_API_URL}/api/users`,
    events: `${process.env.REACT_APP_API_URL}/api/events`,
  },
  
  // Firebase config
  firebase: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
  },

  // Helper function to check if backend is available
  checkBackendAvailability: async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}`);
      return response.ok;
    } catch (error) {
      console.error('Backend availability check failed:', error);
      return false;
    }
  }
};

export default config; 