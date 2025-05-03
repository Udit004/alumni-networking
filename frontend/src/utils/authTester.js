/**
 * Utility for testing authentication with the backend
 */
import axios from 'axios';
import { API_URLS } from '../config/apiConfig';
import { getAuthToken } from './tokenManager';

/**
 * Tests authentication with the backend
 * @param {Function} getToken - Function to get the authentication token (optional, uses centralized token manager if not provided)
 * @returns {Promise<Object>} - Promise resolving to the test result
 */
export const testAuthentication = async (getToken) => {
  try {
    console.log('🔍 Testing authentication with backend...');

    // Get token using provided function or centralized token manager
    const tokenFn = getToken || getAuthToken;
    const token = await tokenFn();
    if (!token) {
      console.error('❌ No token available for authentication test');
      return {
        success: false,
        message: 'No token available',
        tokenInfo: null
      };
    }

    console.log(`🔑 Got token for auth test (length: ${token.length})`);
    console.log(`🔑 Token first 10 chars: ${token.substring(0, 10)}...`);

    // Test with deployed backend
    try {
      console.log(`🌐 Testing with deployed backend: ${API_URLS.main}`);
      const deployedResponse = await axios.get(`${API_URLS.main}/api/auth-test`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Deployed backend authentication successful:', deployedResponse.data);
      return {
        success: true,
        message: 'Authentication successful with deployed backend',
        tokenInfo: deployedResponse.data.tokenInfo,
        user: deployedResponse.data.user,
        backend: 'deployed'
      };
    } catch (deployedError) {
      console.error('❌ Deployed backend authentication failed:', deployedError.response?.data || deployedError.message);

      // Try with local backend
      try {
        console.log('🖥️ Testing with local backend: http://localhost:5000');
        const localResponse = await axios.get('http://localhost:5000/api/auth-test', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ Local backend authentication successful:', localResponse.data);
        return {
          success: true,
          message: 'Authentication successful with local backend',
          tokenInfo: localResponse.data.tokenInfo,
          user: localResponse.data.user,
          backend: 'local'
        };
      } catch (localError) {
        console.error('❌ Local backend authentication failed:', localError.response?.data || localError.message);

        return {
          success: false,
          message: 'Authentication failed with both backends',
          deployedError: deployedError.response?.data || deployedError.message,
          localError: localError.response?.data || localError.message
        };
      }
    }
  } catch (error) {
    console.error('❌ Authentication test failed with unexpected error:', error);
    return {
      success: false,
      message: 'Authentication test failed with unexpected error',
      error: error.message
    };
  }
};

/**
 * Tests a specific API endpoint with authentication
 * @param {string} endpoint - The API endpoint to test
 * @param {Function} getToken - Function to get the authentication token (optional)
 * @returns {Promise<Object>} - Promise resolving to the test result
 */
export const testApiEndpoint = async (endpoint, getToken) => {
  try {
    console.log(`🔍 Testing API endpoint: ${endpoint}`);

    // Get token using provided function or centralized token manager
    const tokenFn = getToken || getAuthToken;
    const token = await tokenFn();

    if (!token) {
      console.error('❌ No token available for API endpoint test');
      return {
        success: false,
        message: 'No token available',
        endpoint
      };
    }

    // Test with deployed backend
    try {
      const fullUrl = `${API_URLS.main}${endpoint}`;
      console.log(`🌐 Testing endpoint: ${fullUrl}`);

      const response = await axios.get(fullUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ API endpoint test successful: ${endpoint}`, response.data);
      return {
        success: true,
        message: `API endpoint test successful: ${endpoint}`,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error(`❌ API endpoint test failed: ${endpoint}`, error.response?.data || error.message);
      return {
        success: false,
        message: `API endpoint test failed: ${endpoint}`,
        error: error.response?.data || error.message,
        status: error.response?.status
      };
    }
  } catch (error) {
    console.error(`❌ Error testing API endpoint: ${endpoint}`, error);
    return {
      success: false,
      message: `Error testing API endpoint: ${endpoint}`,
      error: error.message
    };
  }
};

export default {
  testAuthentication,
  testApiEndpoint
};
