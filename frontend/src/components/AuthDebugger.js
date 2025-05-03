import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { testAuthentication } from '../utils/authTester';

/**
 * Component for debugging authentication issues
 */
const AuthDebugger = () => {
  const { currentUser, userRole, getUserToken } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDebugger, setShowDebugger] = useState(false);

  const runAuthTest = async () => {
    setLoading(true);
    try {
      const result = await testAuthentication(getUserToken);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Test failed with error',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  if (!showDebugger) {
    return (
      <button
        onClick={() => setShowDebugger(true)}
        className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md shadow-md text-sm"
      >
        Debug Auth
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-md w-full max-h-[80vh] overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Authentication Debugger</h3>
        <button
          onClick={() => setShowDebugger(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
        <h4 className="font-medium text-gray-800 dark:text-white mb-2">User Status</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <strong>Logged in:</strong> {currentUser ? 'Yes' : 'No'}
        </p>
        {currentUser && (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <strong>User ID:</strong> {currentUser.uid}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <strong>Email:</strong> {currentUser.email}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <strong>Role:</strong> {userRole || 'Not set'}
            </p>
          </>
        )}
      </div>

      <div className="mb-4">
        <button
          onClick={runAuthTest}
          disabled={loading || !currentUser}
          className={`w-full py-2 px-4 rounded-md ${
            loading || !currentUser
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {loading ? 'Testing...' : 'Test Authentication'}
        </button>
      </div>

      {testResult && (
        <div className={`p-3 rounded-md ${
          testResult.success ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
        }`}>
          <h4 className={`font-medium mb-2 ${
            testResult.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
          }`}>
            {testResult.success ? 'Authentication Successful' : 'Authentication Failed'}
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            {testResult.message}
          </p>

          {testResult.success && testResult.tokenInfo && (
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              <p><strong>Backend:</strong> {testResult.backend}</p>
              <p><strong>Expires in:</strong> {testResult.tokenInfo.expiresIn}</p>
              <p><strong>Issued at:</strong> {testResult.tokenInfo.issuedAt}</p>
              <p><strong>Expires at:</strong> {testResult.tokenInfo.expiresAt}</p>
            </div>
          )}
          {!testResult.success && testResult.deployedError && (
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              <p><strong>Deployed backend error:</strong></p>
              <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                {JSON.stringify(testResult.deployedError, null, 2)}
              </pre>
            </div>
          )}

          {!testResult.success && testResult.localError && (
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              <p><strong>Local backend error:</strong></p>
              <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                {JSON.stringify(testResult.localError, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>
          If authentication is failing, try:
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>Logging out and back in</li>
          <li>Checking if the backend is running</li>
          <li>Checking Firebase configuration</li>
          <li>Checking network connectivity</li>
        </ul>
      </div>
    </div>
  );
};

export default AuthDebugger;
