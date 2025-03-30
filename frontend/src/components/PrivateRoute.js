import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // Redirect to login if user is not authenticated
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Render the protected component if authenticated
  return children;
};

export default PrivateRoute; 