/**
 * API Helper utility for making authenticated requests
 * Provides consistent handling of authentication tokens and error handling
 */

import axios from 'axios';
import { API_URLS, DEFAULT_TIMEOUT } from '../config/apiConfig';
import { getAuthToken } from './tokenManager';

/**
 * Makes an authenticated API request with consistent error handling
 *
 * @param {Object} options - Request options
 * @param {string} options.endpoint - API endpoint path (without base URL)
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} options.data - Request payload for POST/PUT requests
 * @param {Object} options.params - URL query parameters
 * @param {Function} options.getToken - Function to get the authentication token (optional, uses centralized token manager if not provided)
 * @param {string} options.baseUrl - Base URL override (optional)
 * @param {number} options.timeout - Request timeout override (optional)
 * @returns {Promise} - Promise resolving to the API response data
 */
export const makeAuthenticatedRequest = async ({
  endpoint,
  method = 'GET',
  data = null,
  params = {},
  getToken,
  baseUrl = API_URLS.main,
  timeout = DEFAULT_TIMEOUT
}) => {
  try {
    // Use provided token function or fall back to centralized token manager
    const tokenFn = getToken || getAuthToken;

    // Get authentication token with refresh logic
    const token = await tokenFn();

    if (!token) {
      console.warn('🔴 No authentication token available for request to', endpoint);
    } else {
      console.log(`🔑 Using token for ${endpoint} (length: ${token.length}, first 10 chars: ${token.substring(0, 10)}...)`);
    }

    // Create request config
    const config = {
      method,
      url: `${baseUrl}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      timeout,
      credentials: 'include',
      withCredentials: true
    };

    // Add data or params if provided
    if (data) {
      config.data = data;
    }

    if (Object.keys(params).length > 0) {
      config.params = params;
    }

    console.log(`🌐 Making ${method} request to ${baseUrl}${endpoint}`);

    // Try with retries for network issues
    let retries = 0;
    const maxRetries = 2;

    while (retries <= maxRetries) {
      try {
        const response = await axios(config);
        console.log(`✅ ${method} request to ${endpoint} successful:`,
          response.status,
          typeof response.data === 'object' ? 'data received' : response.data
        );

        // Handle different response formats
        if (response.data && response.data.success === false) {
          throw new Error(response.data.message || 'API request failed');
        }

        return response.data;
      } catch (retryError) {
        retries++;

        // Only retry on network errors or 5xx server errors
        if (
          retries <= maxRetries &&
          (!retryError.response || retryError.response.status >= 500)
        ) {
          console.log(`🔄 Retry ${retries}/${maxRetries} for ${endpoint} after error:`,
            retryError.message
          );
          await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
          continue;
        }

        // If we get here, either we've exhausted retries or it's a non-retryable error
        throw retryError;
      }
    }
  } catch (error) {
    console.error(`❌ API request to ${endpoint} failed:`, error);

    // Format error message for consistent handling
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    const errorStatus = error.response?.status;

    // Log detailed error information based on error type
    if (errorStatus === 401 || errorStatus === 403) {
      console.error(`🔒 Authentication error (${errorStatus}) for ${endpoint}:`, {
        message: errorMessage,
        responseData: error.response?.data,
        config: error.config ? {
          url: error.config.url,
          method: error.config.method,
          hasAuthHeader: !!error.config.headers?.Authorization
        } : 'No config available'
      });

      // For auth errors, suggest token refresh
      console.log('💡 Suggestion: Try refreshing the token or logging in again');
    } else if (error.code === 'ECONNABORTED') {
      console.error(`⏱️ Request timeout for ${endpoint}:`, {
        timeout: timeout,
        url: `${baseUrl}${endpoint}`
      });
    } else if (!error.response) {
      console.error(`🌐 Network error for ${endpoint}:`, {
        message: error.message,
        url: `${baseUrl}${endpoint}`
      });

      // Check if the API is available
      try {
        console.log(`🔍 Checking if API at ${baseUrl} is available...`);
        const isLocalhost = baseUrl.includes('localhost');

        // For deployed environments, try to check the API health
        if (!isLocalhost) {
          console.log(`💡 This appears to be a deployed environment (${baseUrl})`);
          console.log('💡 Suggestion: Check if the backend service is running and accessible');
        } else {
          console.log(`💡 This appears to be a local environment (${baseUrl})`);
          console.log('💡 Suggestion: Make sure your local backend server is running');
        }
      } catch (checkError) {
        console.error('Failed to check API availability:', checkError);
      }
    }

    // Throw a standardized error object with more details
    throw {
      message: errorMessage,
      status: errorStatus,
      isAuthError: errorStatus === 401 || errorStatus === 403,
      isNetworkError: !error.response,
      isTimeout: error.code === 'ECONNABORTED',
      originalError: error,
      endpoint: endpoint,
      baseUrl: baseUrl,
      url: `${baseUrl}${endpoint}`
    };
  }
};

/**
 * Makes a GET request with authentication
 */
export const getWithAuth = (options) => {
  return makeAuthenticatedRequest({ ...options, method: 'GET' });
};

/**
 * Makes a POST request with authentication
 */
export const postWithAuth = (options) => {
  return makeAuthenticatedRequest({ ...options, method: 'POST' });
};

/**
 * Makes a PUT request with authentication
 */
export const putWithAuth = (options) => {
  return makeAuthenticatedRequest({ ...options, method: 'PUT' });
};

/**
 * Makes a DELETE request with authentication
 */
export const deleteWithAuth = (options) => {
  return makeAuthenticatedRequest({ ...options, method: 'DELETE' });
};

export default {
  makeAuthenticatedRequest,
  getWithAuth,
  postWithAuth,
  putWithAuth,
  deleteWithAuth
};
