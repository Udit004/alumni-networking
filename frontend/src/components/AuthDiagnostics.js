import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { checkApiConnection } from '../utils/apiConnectionChecker';
import { testAuthentication } from '../utils/authTester';

/**
 * Component for diagnosing authentication issues
 */
const AuthDiagnostics = () => {
  const { currentUser, getUserToken } = useAuth();
  const [apiStatus, setApiStatus] = useState(null);
  const [authStatus, setAuthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        setLoading(true);
        
        // Check API connection
        const connectionStatus = await checkApiConnection();
        setApiStatus(connectionStatus);
        
        // If user is logged in, test authentication
        if (currentUser) {
          const authResult = await testAuthentication(getUserToken);
          setAuthStatus(authResult);
        } else {
          setAuthStatus({ success: false, message: 'No user logged in' });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Diagnostics error:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    
    runDiagnostics();
  }, [currentUser, getUserToken]);
  
  if (loading) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Running Authentication Diagnostics...</h2>
        <p>Please wait while we check your connection and authentication status.</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Diagnostics Error</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Authentication Diagnostics</h2>
      
      {/* User Status */}
      <div className="mb-4">
        <h3 className="font-medium">User Status</h3>
        {currentUser ? (
          <div className="text-green-600">
            ✅ Logged in as {currentUser.email}
            <div className="text-xs text-gray-500 mt-1">
              User ID: {currentUser.uid}
            </div>
          </div>
        ) : (
          <div className="text-red-600">❌ Not logged in</div>
        )}
      </div>
      
      {/* API Connection Status */}
      {apiStatus && (
        <div className="mb-4">
          <h3 className="font-medium">API Connection</h3>
          <div className={apiStatus.success ? "text-green-600" : "text-red-600"}>
            {apiStatus.success ? "✅ API is available" : "❌ API is not available"}
          </div>
          
          <div className="mt-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <strong>Deployed API:</strong>
                <div className={apiStatus.results.deployed.available ? "text-green-600" : "text-red-600"}>
                  {apiStatus.results.deployed.available 
                    ? `✅ Available (${apiStatus.results.deployed.latency}ms)` 
                    : `❌ Not available: ${apiStatus.results.deployed.error}`}
                </div>
              </div>
              
              <div>
                <strong>Local API:</strong>
                <div className={apiStatus.results.local.available ? "text-green-600" : "text-red-600"}>
                  {apiStatus.results.local.available 
                    ? `✅ Available (${apiStatus.results.local.latency}ms)` 
                    : `❌ Not available: ${apiStatus.results.local.error}`}
                </div>
              </div>
            </div>
            
            <div className="mt-2">
              <strong>Environment:</strong> {apiStatus.environment}
            </div>
            
            {apiStatus.recommendedApiUrl && (
              <div className="mt-1">
                <strong>Recommended API URL:</strong> {apiStatus.recommendedApiUrl}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Authentication Status */}
      {authStatus && (
        <div className="mb-4">
          <h3 className="font-medium">Authentication Status</h3>
          <div className={authStatus.success ? "text-green-600" : "text-red-600"}>
            {authStatus.success ? "✅ Authentication successful" : "❌ Authentication failed"}
          </div>
          
          <div className="mt-1 text-sm">
            <strong>Message:</strong> {authStatus.message}
          </div>
          
          {authStatus.tokenInfo && (
            <div className="mt-1 text-sm">
              <strong>Token:</strong> Length: {authStatus.tokenInfo.length}, 
              Prefix: {authStatus.tokenInfo.prefix}
            </div>
          )}
          
          {authStatus.backend && (
            <div className="mt-1 text-sm">
              <strong>Backend:</strong> {authStatus.backend}
            </div>
          )}
          
          {authStatus.error && (
            <div className="mt-1 text-sm text-red-600">
              <strong>Error:</strong> {authStatus.error}
            </div>
          )}
        </div>
      )}
      
      {/* Recommendations */}
      <div className="mt-4 p-3 bg-blue-50 rounded">
        <h3 className="font-medium">Recommendations</h3>
        <ul className="list-disc pl-5 mt-2 text-sm">
          {!currentUser && (
            <li>Log in to test authentication</li>
          )}
          
          {apiStatus && !apiStatus.success && (
            <>
              <li>Check if the backend server is running</li>
              <li>Verify network connectivity</li>
              <li>Check if the API URL is correct in the configuration</li>
            </>
          )}
          
          {authStatus && !authStatus.success && currentUser && (
            <>
              <li>Try logging out and logging back in</li>
              <li>Check if the Firebase configuration is correct</li>
              <li>Verify that the backend is properly configured to verify Firebase tokens</li>
            </>
          )}
          
          {apiStatus && apiStatus.success && authStatus && authStatus.success && (
            <li className="text-green-600">All systems are working correctly! 🎉</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default AuthDiagnostics;
