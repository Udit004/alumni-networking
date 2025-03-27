import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import "./EnrolledEvents.css";

const EnrolledEvents = () => {
  const [enrolledEvents, setEnrolledEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEnrolledEvents = async () => {
      try {
        if (!user) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        // First get the MongoDB user ID
        const userRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/firebase/${user.uid}`);
        const mongoUser = userRes.data;

        if (!mongoUser || !mongoUser._id) {
          setError('User data not found');
          setLoading(false);
          return;
        }

        // Then fetch enrolled events
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/events`);
        const allEvents = response.data;
        
        // Filter events where user is registered
        const userEvents = allEvents.filter(event => {
          if (!event.registeredUsers || !Array.isArray(event.registeredUsers)) {
            return false;
          }
          return event.registeredUsers.some(ru => 
            ru && ru.userId && ru.userId._id === mongoUser._id
          );
        });
        
        setEnrolledEvents(userEvents);
      } catch (err) {
        console.error('Error fetching enrolled events:', err);
        setError(err.response?.data?.message || 'Failed to fetch enrolled events');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledEvents();
  }, [user]);

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  if (loading) {
    return (
      <div className="enrolled-events-loading">
        <div className="spinner"></div>
        <p>Loading your enrolled events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="enrolled-events-error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="enrolled-events-container">
      <div className="enrolled-events-header">
        <h2>📚 My Enrolled Events</h2>
        <p className="enrolled-count">
          {enrolledEvents.length} {enrolledEvents.length === 1 ? 'Event' : 'Events'} Enrolled
        </p>
      </div>

      {enrolledEvents.length === 0 ? (
        <div className="no-events-container">
          <div className="no-events-icon">🎯</div>
          <h3>No Events Yet</h3>
          <p>You haven't enrolled in any events. Check out available events and start participating!</p>
        </div>
      ) : (
        <div className="events-grid">
          {enrolledEvents.map((event) => (
            <div key={event._id} className="event-card">
              <div className="event-card-header">
                <h3>{event.title}</h3>
                <span className="event-badge">Enrolled</span>
              </div>
              
              <div className="event-card-body">
                <p className="event-description">{event.description}</p>
                
                <div className="event-details">
                  <div className="detail-item">
                    <span className="detail-icon">📅</span>
                    <div className="detail-text">
                      <span className="detail-label">Date</span>
                      <span className="detail-value">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <span className="detail-icon">⏰</span>
                    <div className="detail-text">
                      <span className="detail-label">Time</span>
                      <span className="detail-value">{event.time}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <span className="detail-icon">📍</span>
                    <div className="detail-text">
                      <span className="detail-label">Location</span>
                      <span className="detail-value">{event.location}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <span className="detail-icon">👤</span>
                    <div className="detail-text">
                      <span className="detail-label">Organizer</span>
                      <span className="detail-value">
                        {event.createdBy?.name || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="event-card-footer">
                <button 
                  className="view-details-btn"
                  onClick={() => handleViewDetails(event)}
                >
                  View Details
                </button>
                <div className="event-type-badge">
                  {event.createdByRole}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Details Modal */}
      {showModal && selectedEvent && (
        <div className="event-modal-overlay">
          <div className="event-modal">
            <div className="event-modal-header">
              <h2>{selectedEvent.title}</h2>
              <button className="close-modal-btn" onClick={handleCloseModal}>×</button>
            </div>
            
            <div className="event-modal-body">
              <div className="event-modal-section">
                <h3>📝 Description</h3>
                <p>{selectedEvent.description}</p>
              </div>

              <div className="event-modal-section">
                <h3>📅 Date & Time</h3>
                <p>
                  {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p>{selectedEvent.time}</p>
              </div>

              <div className="event-modal-section">
                <h3>📍 Location</h3>
                <p>{selectedEvent.location}</p>
              </div>

              <div className="event-modal-section">
                <h3>👥 Organizer</h3>
                <p>{selectedEvent.createdBy?.name || 'Unknown'}</p>
                <span className="organizer-role">{selectedEvent.createdByRole}</span>
              </div>

              <div className="event-modal-section">
                <h3>👥 Registered Participants</h3>
                <div className="participants-list">
                  {selectedEvent.registeredUsers?.map((ru, index) => (
                    <div key={index} className="participant-item">
                      <span className="participant-name">{ru.userId?.name || 'Unknown'}</span>
                      <span className="participant-role">{ru.userId?.role || 'Student'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="event-modal-footer">
              <button className="close-btn" onClick={handleCloseModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrolledEvents;
