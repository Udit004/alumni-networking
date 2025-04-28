/**
 * API Helper utility for making authenticated requests
 * Provides consistent handling of authentication tokens and error handling
 */

import axios from 'axios';
import { API_URLS, DEFAULT_TIMEOUT } from '../config/apiConfig';

/**
 * Makes an authenticated API request with consistent error handling
 * 
 * @param {Object} options - Request options
 * @param {string} options.endpoint - API endpoint path (without base URL)
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} options.data - Request payload for POST/PUT requests
 * @param {Object} options.params - URL query parameters
 * @param {Function} options.getToken - Function to get the authentication token
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
    // Get authentication token
    const token = await getToken();
    
    // Create request config
    const config = {
      method,
      url: `${baseUrl}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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
    
    console.log(`Making ${method} request to ${endpoint}`);
    const response = await axios(config);
    
    // Handle different response formats
    if (response.data && response.data.success === false) {
      throw new Error(response.data.message || 'API request failed');
    }
    
    return response.data;
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    
    // Format error message for consistent handling
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    const errorStatus = error.response?.status;
    
    // Throw a standardized error object
    throw {
      message: errorMessage,
      status: errorStatus,
      isAuthError: errorStatus === 401 || errorStatus === 403,
      originalError: error
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
