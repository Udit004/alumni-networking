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
  const [activeTab, setActiveTab] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    // Check initial dark mode state
    setIsDarkMode(document.documentElement.classList.contains('dark'));

    // Monitor for dark mode changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchEnrolledEvents = async () => {
      try {
        if (!user) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        // First get the MongoDB user ID
        const userRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/firebase/${user.uid}`);
        const mongoUser = userRes.data;

        if (!mongoUser || !mongoUser._id) {
          setError('User data not found');
          setLoading(false);
          return;
        }

        // Then fetch enrolled events
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/events`);
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

  const filteredEvents = enrolledEvents.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

    if (activeTab === "all") return true;
    if (activeTab === "upcoming") return eventDate >= today;
    if (activeTab === "past") return eventDate < today;
    return true;
  });

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

      <div className="flex space-x-2 mb-4">
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setActiveTab('all')}
        >
          All Events
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'upcoming'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'past'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setActiveTab('past')}
        >
          Past Events
        </button>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="no-events-container">
          <div className="no-events-icon">🎯</div>
          <h3>No Events Yet</h3>
          <p>You haven't enrolled in any events. Check out available events and start participating!</p>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <div
              key={event._id}
              className={`event-card bg-white dark:bg-gray-800 rounded-xl shadow-md transition-all overflow-hidden border border-gray-200 dark:border-gray-700`}
              style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}
            >
              <div
                className={`event-status text-xs font-semibold px-3 py-1 inline-block absolute right-0 top-0 rounded-bl-lg ${
                  new Date(event.date) >= new Date().setHours(0, 0, 0, 0)
                    ? "bg-green-500 text-white"
                    : "bg-gray-500 text-white"
                }`}
              >
                {new Date(event.date) >= new Date().setHours(0, 0, 0, 0) ? "Upcoming" : "Past"}
              </div>

              <div className="event-content p-5">
                <h3 className="event-title text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {event.title}
                </h3>
                <p className="event-description text-gray-600 dark:text-gray-300 mb-4">
                  {event.description}
                </p>
                <div className="event-details space-y-2">
                  <div className="detail-item flex items-center text-gray-700 dark:text-gray-300">
                    <span className="detail-icon mr-2">📅</span>
                    <span>{new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                  <div className="detail-item flex items-center text-gray-700 dark:text-gray-300">
                    <span className="detail-icon mr-2">⏰</span>
                    <span>{event.time}</span>
                  </div>
                  <div className="detail-item flex items-center text-gray-700 dark:text-gray-300">
                    <span className="detail-icon mr-2">📍</span>
                    <span>{event.location}</span>
                  </div>
                </div>
                <div className="event-actions mt-4">
                  {new Date(event.date) >= new Date().setHours(0, 0, 0, 0) ? (
                    <div className="flex space-x-2">
                      <button
                        className="view-details-btn flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                        onClick={() => handleViewDetails(event)}
                      >
                        View Details
                      </button>
                      <button className="calendar-btn p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-white rounded-lg transition-colors">
                        🗓️
                      </button>
                    </div>
                  ) : (
                    <button className="view-certificate-btn w-full py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors">
                      View Certificate
                    </button>
                  )}
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
