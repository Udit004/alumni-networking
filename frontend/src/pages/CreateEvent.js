import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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

const EventCreate = () => {
  const navigate = useNavigate();
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
        apiUrl: config.apiUrl
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
    
    return () => observer.disconnect();
  }, [currentUser, role]);

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
        console.log('Creating event with payload:', {
          ...eventPayload,
          currentUser: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email
          },
          role: role
        });
      }

      // Create the event
      const response = await api.post(config.endpoints.events, eventPayload);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Event created successfully:', response.data);
      }
      
      setSuccess('Event created successfully!');
      
      // Redirect to events page after success
      setTimeout(() => {
        navigate('/events');
      }, 1500);
    } catch (error) {
      console.error('Error creating event:', error);
      if (error.response) {
        console.error('Error response:', {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers
        });
        setError(error.response.data.message || error.response.data.error || 'Failed to create event');
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
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center flex items-center justify-center gap-2">
          📅 Create New Event
        </h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Event Title */}
          <div>
            <label className="block text-gray-800 dark:text-gray-200 font-semibold mb-2">Event Title</label>
            <input
              type="text"
              name="title"
              value={eventData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              required
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-800 dark:text-gray-200 font-semibold mb-2">Description</label>
            <textarea
              name="description"
              value={eventData.description}
              onChange={handleChange}
              placeholder="Enter event description"
              required
              rows="4"
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-800 dark:text-gray-200 font-semibold mb-2">Date</label>
              <input
                type="date"
                name="date"
                value={eventData.date}
                onChange={handleChange}
                required
                className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-gray-800 dark:text-gray-200 font-semibold mb-2">Time</label>
              <input
                type="time"
                name="time"
                value={eventData.time}
                onChange={handleChange}
                required
                className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-gray-800 dark:text-gray-200 font-semibold mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={eventData.location}
              onChange={handleChange}
              placeholder="Enter event location"
              required
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !canCreateEvents}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors duration-300 flex justify-center items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              "Create Event"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventCreate;
