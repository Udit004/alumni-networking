import React, { useState } from 'react';
import { testAuthentication, testApiEndpoint } from '../utils/authTester';
import { getAuthToken } from '../utils/tokenManager';

/**
 * Component for testing authentication and API endpoints
 */
const AuthTester = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [endpoint, setEndpoint] = useState('/api/auth-test');

  // Test authentication
  const handleTestAuth = async () => {
    setLoading(true);
    try {
      const result = await testAuthentication();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Error running authentication test',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Test specific API endpoint
  const handleTestEndpoint = async () => {
    setLoading(true);
    try {
      const result = await testApiEndpoint(endpoint);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error testing endpoint: ${endpoint}`,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Get and display token
  const handleShowToken = async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      setTestResult({
        success: !!token,
        message: token ? 'Token retrieved successfully' : 'Failed to get token',
        token: token ? {
          length: token.length,
          prefix: token.substring(0, 10) + '...',
          suffix: '...' + token.substring(token.length - 10),
          full: token
        } : null
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Error getting token',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Authentication Tester</h2>
      
      <div className="mb-4">
        <button
          onClick={handleTestAuth}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 mr-2"
        >
          {loading ? 'Testing...' : 'Test Authentication'}
        </button>
        
        <button
          onClick={handleShowToken}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Show Token'}
        </button>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          API Endpoint to Test:
        </label>
        <div className="flex">
          <input
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-l text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600"
            placeholder="/api/endpoint"
          />
          <button
            onClick={handleTestEndpoint}
            disabled={loading}
            className="px-4 py-2 bg-purple-500 text-white rounded-r hover:bg-purple-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Endpoint'}
          </button>
        </div>
      </div>
      
      {testResult && (
        <div className={`mt-4 p-4 rounded ${testResult.success ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
          <h3 className={`font-bold ${testResult.success ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`}>
            {testResult.success ? 'Success' : 'Error'}
          </h3>
          <p className="text-gray-800 dark:text-gray-300 mb-2">{testResult.message}</p>
          
          <div className="mt-2 overflow-auto max-h-96">
            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthTester;
