import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getConnectionRequests, acceptConnectionRequest, rejectConnectionRequest } from '../services/connectionService';
import './ConnectionRequests.css';

const ConnectionRequests = ({ onConnectionUpdate }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const userRequests = await getConnectionRequests(currentUser.uid);
      setRequests(userRequests);
    } catch (err) {
      setError('Failed to load connection requests. Please try again.');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      setLoading(true);
      await acceptConnectionRequest(requestId);
      await fetchRequests();
      if (onConnectionUpdate) {
        onConnectionUpdate();
      }
    } catch (err) {
      setError('Failed to accept request. Please try again.');
      console.error('Error accepting request:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setLoading(true);
      await rejectConnectionRequest(requestId);
      await fetchRequests();
    } catch (err) {
      setError('Failed to reject request. Please try again.');
      console.error('Error rejecting request:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchRequests();
    }
  }, [currentUser]);

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
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="requests-section">
        <h3>Incoming Requests</h3>
        {requests.incoming.length === 0 ? (
          <p>No incoming connection requests</p>
        ) : (
          <div className="requests-list">
            {requests.incoming.map((request) => (
              <div key={request.id} className="request-item">
                <div className="request-info">
                  <img 
                    src={request.sender.photoURL || '/default-avatar.png'} 
                    alt={request.sender.name} 
                    className="request-avatar"
                  />
                  <div className="request-details">
                    <h4>{request.sender.name}</h4>
                    <p>{request.sender.role || 'Alumni'}</p>
                  </div>
                </div>
                <div className="request-actions">
                  <button 
                    onClick={() => handleAccept(request.id)}
                    className="accept-btn"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => handleReject(request.id)}
                    className="reject-btn"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="requests-section">
        <h3>Outgoing Requests</h3>
        {requests.outgoing.length === 0 ? (
          <p>No outgoing connection requests</p>
        ) : (
          <div className="requests-list">
            {requests.outgoing.map((request) => (
              <div key={request.id} className="request-item">
                <div className="request-info">
                  <img 
                    src={request.recipient.photoURL || '/default-avatar.png'} 
                    alt={request.recipient.name} 
                    className="request-avatar"
                  />
                  <div className="request-details">
                    <h4>{request.recipient.name}</h4>
                    <p>{request.recipient.role || 'Alumni'}</p>
                    <p className="request-status">Pending</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button 
        onClick={fetchRequests}
        className="retry-btn"
      >
        Refresh
      </button>
    </div>
  );
};

export default ConnectionRequests;