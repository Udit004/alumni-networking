/**
 * Token Manager
 * 
 * Centralized utility for managing authentication tokens
 * Provides consistent token handling across the application
 */

import { getAuth } from 'firebase/auth';

/**
 * Get the current Firebase authentication token with refresh logic
 * @returns {Promise<string|null>} The Firebase ID token or null if not available
 */
export const getAuthToken = async () => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.warn('⚠️ No authenticated user found');
      return null;
    }
    
    console.log('🔄 Getting token for user:', currentUser.uid);
    
    try {
      // Get token with expiration info
      const tokenResult = await currentUser.getIdTokenResult();
      const expirationTime = new Date(tokenResult.expirationTime).getTime();
      const now = Date.now();
      const minutesRemaining = Math.floor((expirationTime - now) / 60000);
      
      // If token expires in less than 5 minutes, force refresh
      if (expirationTime - now < 5 * 60 * 1000) {
        console.log(`🔄 Token expires soon (${minutesRemaining} minutes), refreshing...`);
        const newToken = await currentUser.getIdToken(true); // Force refresh
        console.log(`✅ Token refreshed successfully, new length: ${newToken.length}`);
        return newToken;
      }
      
      console.log(`🔑 Using valid token (expires in ${minutesRemaining} minutes), length: ${tokenResult.token.length}`);
      return tokenResult.token;
    } catch (error) {
      console.error('❌ Error getting token:', error);
      
      // Try one more time with force refresh
      try {
        console.log('🔄 Attempting force refresh after error...');
        const forceToken = await currentUser.getIdToken(true);
        console.log(`✅ Force refresh successful, token length: ${forceToken.length}`);
        return forceToken;
      } catch (retryError) {
        console.error('❌ Force refresh failed:', retryError);
        return null;
      }
    }
  } catch (error) {
    console.error('❌ Unexpected error in getAuthToken:', error);
    return null;
  }
};

/**
 * Add authentication headers to a request config object
 * @param {Object} config - The request configuration object
 * @returns {Promise<Object>} - The updated configuration with auth headers
 */
export const addAuthHeaders = async (config = {}) => {
  const token = await getAuthToken();
  
  // Create headers if they don't exist
  if (!config.headers) {
    config.headers = {};
  }
  
  // Add authorization header if token exists
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    console.log(`🔑 Added token to request (length: ${token.length})`);
  } else {
    console.warn('⚠️ No token available for request');
  }
  
  // Add other common headers
  config.headers['Content-Type'] = 'application/json';
  config.headers['Accept'] = 'application/json';
  config.headers['Cache-Control'] = 'no-cache';
  
  return config;
};

/**
 * Create a complete request config with authentication
 * @param {Object} options - Request options
 * @returns {Promise<Object>} - Complete request configuration
 */
export const createAuthConfig = async (options = {}) => {
  const { url, method = 'GET', data, params, timeout } = options;
  
  const config = {
    url,
    method,
    timeout,
    withCredentials: true
  };
  
  if (data) {
    config.data = data;
  }
  
  if (params) {
    config.params = params;
  }
  
  return addAuthHeaders(config);
};

export default {
  getAuthToken,
  addAuthHeaders,
  createAuthConfig
};
