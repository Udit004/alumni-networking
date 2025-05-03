/**
 * Utility for checking API connection status
 */
import axios from 'axios';
import config from '../config';

/**
 * Checks if the API is available
 * @returns {Promise<Object>} - Promise resolving to the connection status
 */
export const checkApiConnection = async () => {
  const results = {
    deployed: { available: false, error: null, latency: null },
    local: { available: false, error: null, latency: null }
  };
  
  // Check deployed API
  try {
    console.log(`🔍 Checking deployed API at ${config.apiUrl}...`);
    const startTime = Date.now();
    const response = await axios.get(`${config.apiUrl}/api/health`, {
      timeout: 5000
    });
    const latency = Date.now() - startTime;
    
    results.deployed = {
      available: response.status === 200,
      data: response.data,
      latency,
      error: null
    };
    
    console.log(`✅ Deployed API check successful (${latency}ms):`, response.data);
  } catch (error) {
    console.error('❌ Deployed API check failed:', error.message);
    results.deployed = {
      available: false,
      error: error.message,
      latency: null
    };
  }
  
  // Check local API
  try {
    console.log('🔍 Checking local API at http://localhost:5000...');
    const startTime = Date.now();
    const response = await axios.get('http://localhost:5000/api/health', {
      timeout: 3000
    });
    const latency = Date.now() - startTime;
    
    results.local = {
      available: response.status === 200,
      data: response.data,
      latency,
      error: null
    };
    
    console.log(`✅ Local API check successful (${latency}ms):`, response.data);
  } catch (error) {
    console.error('❌ Local API check failed:', error.message);
    results.local = {
      available: false,
      error: error.message,
      latency: null
    };
  }
  
  // Determine overall status
  const anyAvailable = results.deployed.available || results.local.available;
  const preferredAvailable = process.env.NODE_ENV === 'production' 
    ? results.deployed.available 
    : results.local.available;
  
  return {
    success: anyAvailable,
    preferredAvailable,
    results,
    environment: process.env.NODE_ENV,
    recommendedApiUrl: preferredAvailable 
      ? (process.env.NODE_ENV === 'production' ? config.apiUrl : 'http://localhost:5000')
      : (results.deployed.available ? config.apiUrl : (results.local.available ? 'http://localhost:5000' : null))
  };
};

export default {
  checkApiConnection
};
