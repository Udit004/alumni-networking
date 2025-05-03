import React from 'react';
import AuthDiagnostics from '../components/AuthDiagnostics';
import { useAuth } from '../context/AuthContext';

const DiagnosticsPage = () => {
  const { currentUser, role } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">System Diagnostics</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">User Information</h2>
        <div className="bg-white p-4 rounded-lg shadow">
          {currentUser ? (
            <div>
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p><strong>User ID:</strong> {currentUser.uid}</p>
              <p><strong>Role:</strong> {role || 'Not set'}</p>
              <p><strong>Authentication Status:</strong> <span className="text-green-600">Logged In</span></p>
            </div>
          ) : (
            <p className="text-red-600">Not logged in</p>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Environment Information</h2>
        <div className="bg-white p-4 rounded-lg shadow">
          <p><strong>Node Environment:</strong> {process.env.NODE_ENV}</p>
          <p><strong>API URL:</strong> {process.env.REACT_APP_API_URL || 'Not set (using default)'}</p>
          <p><strong>Firebase Project:</strong> {process.env.REACT_APP_FIREBASE_PROJECT_ID || 'Using default configuration'}</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Authentication Diagnostics</h2>
        <AuthDiagnostics />
      </div>
      
      <div className="mt-8 text-sm text-gray-500">
        <p>This page helps diagnose issues with authentication and API connectivity.</p>
        <p>If you're experiencing problems, the information on this page can help identify the cause.</p>
      </div>
    </div>
  );
};

export default DiagnosticsPage;
