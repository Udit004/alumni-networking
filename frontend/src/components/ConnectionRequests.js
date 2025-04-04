import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './ConnectionRequests.css';

const ConnectionRequests = ({ onConnectionUpdate }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleRetry = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Call the onConnectionUpdate if provided
      if (onConnectionUpdate && typeof onConnectionUpdate === 'function') {
        onConnectionUpdate();
      }
    }, 1000);
  };

  // Call onConnectionUpdate when component mounts if provided
  useEffect(() => {
    if (onConnectionUpdate && typeof onConnectionUpdate === 'function') {
      onConnectionUpdate();
    }
  }, [onConnectionUpdate]);

  if (!currentUser) {
    return <div className="connection-requests-container">Please log in to view connection requests.</div>;
  }

  if (loading) {
    return (
      <div className="connection-requests-container">
        <div className="loading-spinner"></div>
        <p>Loading connection requests...</p>
      </div>
    );
  }

  return (
    <div className="connection-requests-container">
      <h2>Connection Requests</h2>
      <p>You have no pending connection requests.</p>
      <button 
        onClick={handleRetry}
        className="retry-btn"
      >
        Refresh
      </button>
    </div>
  );
};

export default ConnectionRequests; 