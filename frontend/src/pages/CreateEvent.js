import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import config from "../config.js";
import './CreateEvent.css';

// Create an axios instance with the correct base URL and headers
const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: config.requestTimeout
});

const EventCreate = ({ isEditing }) => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { currentUser, role } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);

  useEffect(() => {
    // Initial dark mode check
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    
    // Observer for dark mode changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth state in CreateEvent:', { 
        user: currentUser ? 'Logged in' : 'Not logged in',
        userId: currentUser?.uid,
        role: role || 'No role assigned',
        apiUrl: config.apiUrl,
        isEditing
      });
    }
    
    // Check backend availability when component mounts
    const checkBackend = async () => {
      const isAvailable = await config.checkBackendAvailability();
      setIsBackendAvailable(isAvailable);
      if (!isAvailable) {
        setError("Backend service is currently unavailable. Please try again later.");
      }
    };
    
    checkBackend();

    // If in edit mode, fetch the event data
    if (isEditing && eventId && isBackendAvailable) {
      fetchEventData();
    }
    
    return () => observer.disconnect();
  }, [currentUser, role, isEditing, eventId]);

  // Fetch event data for editing
  const fetchEventData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`${config.endpoints.events}/${eventId}`);
      
      if (response.data) {
        const event = response.data;
        setEventData({
          title: event.title || '',
          description: event.description || '',
          date: event.date ? formatDate(event.date) : '',
          time: event.time || '',
          location: event.location || '',
        });
        
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Event data fetched for editing:', event);
        }
      }
    } catch (err) {
      console.error('Error fetching event data:', err);
      setError('Failed to load event data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is allowed to create events (teacher or admin or alumni)
  const allowedRoles = ['teacher', 'admin', 'alumni'];
  const canCreateEvents = currentUser && role && allowedRoles.includes(role.toLowerCase());

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to create events.');
      return;
    }

    if (!role) {
      setError('Your account does not have a role assigned. Please contact an administrator.');
      return;
    }
    
    if (!canCreateEvents) {
      setError('You do not have permission to create events.');
      return;
    }

    if (!isBackendAvailable) {
      setError("Backend service is currently unavailable. Please try again later.");
      return;
    }

    if (!eventData.title || !eventData.description || !eventData.date || !eventData.time || !eventData.location) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Format role to match the enum in Event schema (capitalize first letter)
      const formattedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
      
      // Prepare event payload
      const eventPayload = {
        title: eventData.title.trim(),
        description: eventData.description.trim(),
        date: formatDate(eventData.date),
        time: eventData.time,
        location: eventData.location.trim(),
        createdByRole: formattedRole,
        firebaseUID: currentUser.uid,
        organizer: currentUser.displayName || "Unknown Organizer"
      };

      if (process.env.NODE_ENV === 'development') {
        console.log(`${isEditing ? 'Updating' : 'Creating'} event with payload:`, {
          ...eventPayload,
          currentUser: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email
          },
          role: role
        });
      }

      let response;
      
      if (isEditing) {
        // Update the event
        response = await api.put(`${config.endpoints.events}/${eventId}?firebaseUID=${currentUser.uid}&role=${role}`, eventPayload);
        setSuccess('Event updated successfully!');
      } else {
        // Create a new event
        response = await api.post(config.endpoints.events, eventPayload);
        setSuccess('Event created successfully!');
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Event ${isEditing ? 'updated' : 'created'} successfully:`, response.data);
      }
      
      // Redirect to events page after success
      setTimeout(() => {
        navigate('/events');
      }, 1500);
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} event:`, error);
      if (error.response) {
        console.error('Error response:', {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers
        });
        setError(error.response.data.message || error.response.data.error || `Failed to ${isEditing ? 'update' : 'create'} event`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        setError('No response received from the server. Please try again.');
      } else {
        console.error('Error setting up request:', error.message);
        setError('Error setting up the request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isBackendAvailable) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-gray-100 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 w-full max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">⚠️ Service Unavailable</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">The backend service is currently unavailable. Please try again later.</p>
          <button 
            onClick={() => navigate('/events')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-gray-100 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          {isEditing ? (
            <>
              <span className="text-blue-500 mr-2">✏️</span> Edit Event
            </>
          ) : (
            <>
              <span className="text-blue-500 mr-2">🎉</span> Create New Event
            </>
          )}
        </h2>
        
        {error && <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">{error}</div>}
        {success && <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 p-4 rounded-lg mb-6">{success}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Title */}
          <div>
            <label htmlFor="title" className="block text-gray-700 dark:text-gray-300 mb-2">Event Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={eventData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter event title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              id="description"
              name="description"
              value={eventData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter event description"
              required
              rows="4"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-gray-700 dark:text-gray-300 mb-2">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={eventData.date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-gray-700 dark:text-gray-300 mb-2">Time</label>
              <input
                type="time"
                id="time"
                name="time"
                value={eventData.time}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-gray-700 dark:text-gray-300 mb-2">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={eventData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter event location"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate('/events')}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span> 
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <span className="mr-2">{isEditing ? '✏️' : '➕'}</span>
                  {isEditing ? 'Update Event' : 'Create Event'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventCreate;
