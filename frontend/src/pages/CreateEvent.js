import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../config.js";
import './CreateEvent.css';

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
        role: role || 'No role assigned'
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

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  // Check if user is allowed to create events (teacher or admin or alumni)
  const allowedRoles = ['teacher', 'admin', 'alumni'];
  
  // Check permissions and handle null role
  const canCreateEvents = currentUser && role && allowedRoles.includes(role.toLowerCase());

  // Format date as YYYY-MM-DD to ensure consistent format for MongoDB
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return original if invalid
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (err) {
      console.error('Date formatting error:', err);
      return dateString; // Return original if error
    }
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
      if (process.env.NODE_ENV === 'development') {
        console.log('Creating event with data: ', eventData);
        console.log('User: ', currentUser);
        console.log('Role: ', role);
      }
      
      // First, try to get the MongoDB user ID using Firebase UID
      let mongoUserId;
      try {
        const userResponse = await axios.get(`${config.endpoints.users}/firebase/${currentUser.uid}`);
        mongoUserId = userResponse.data._id;
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Found MongoDB user ID:', mongoUserId);
        }
      } catch (userErr) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Could not find MongoDB user. Creating a new user:', userErr);
        }
        
        // User doesn't exist in MongoDB, create them
        const createUserResponse = await axios.post(config.endpoints.users, {
          firebaseUID: currentUser.uid,
          name: currentUser.displayName || "User",
          email: currentUser.email || "user@example.com", 
          role: role
        });
        mongoUserId = createUserResponse.data._id;
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Created new MongoDB user:', mongoUserId);
        }
      }

      // Format date and validate
      const formattedDate = formatDate(eventData.date);
      
      // Format role to match the enum in Event schema (capitalize first letter)
      const formattedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
      
      // Prepare event payload with properly formatted data
      const eventPayload = {
        title: eventData.title.trim(),
        description: eventData.description.trim(),
        date: formattedDate,
        time: eventData.time,
        location: eventData.location.trim(),
        organizer: currentUser.displayName || "Unknown Organizer",
        userId: mongoUserId,
        firebaseUID: currentUser.uid
      };
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Event payload being sent:', eventPayload);
      }

      try {
        // Create the event with Firebase UID
        const response = await axios.post(config.endpoints.events, eventPayload);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Event created successfully: ', response.data);
        }
        setSuccess('Event created successfully!');
        
        // Redirect to events page after success
        setTimeout(() => {
          navigate('/events');
        }, 1500);
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Error creating event:', err);
          console.error('Error response data:', err.response?.data);
          console.error('Error response status:', err.response?.status);
          console.error('Error message:', err.message);
        }
        
        // Handle specific error cases
        if (err.response?.status === 404) {
          setError("Backend service is currently unavailable. Please try again later.");
        } else if (err.response?.status === 500) {
          setError("Internal server error. Please try again later or contact support.");
        } else if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Failed to create event. Please try again.');
        }
      }
    } catch (outerErr) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error in overall event creation process:', outerErr);
        console.error('Error details:', outerErr.response?.data);
        console.error('Error status:', outerErr.response?.status);
      }
      
      // Restore specific error handling
      if (outerErr.response?.status === 404) {
        setError("Backend service is currently unavailable. Please try again later.");
      } else if (outerErr.response?.status === 500) {
        setError("Internal server error. Please try again later or contact support.");
      } else if (outerErr.response?.data?.message) {
        setError(outerErr.response.data.message);
      } else {
        setError('An unexpected error occurred. Please try again later.');
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
