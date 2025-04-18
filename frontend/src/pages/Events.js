import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { Link } from "react-router-dom";
import config from "../config";
import axios from "axios";
import "./Events.css";

// Create an axios instance with the correct base URL and headers
const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: config.requestTimeout
});

// Function to safely handle event objects and prevent errors
const safeEventObject = (event) => {
  if (!event) return {};

  return {
    _id: event._id || 'unknown',
    title: event.title || 'Untitled Event',
    description: event.description || 'No description available',
    date: event.date || new Date().toISOString().split('T')[0],
    time: event.time || '12:00',
    location: event.location || 'TBD',
    organizer: event.organizer || 'Unknown Organizer',
    createdBy: event.createdBy || {},
    registeredUsers: Array.isArray(event.registeredUsers) ? event.registeredUsers : [],
    createdAt: event.createdAt || new Date().toISOString()
  };
};

const Events = () => {
  const { user, role, loading: authLoading } = useAuth();
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("upcoming"); // all, upcoming, past
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  // Registration form state
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentYear: '',
    program: '',
    whyInterested: '',
    additionalInfo: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // 🔄 Fetch Events from Backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError("");

        // First try: Firebase-specific endpoint that completely avoids ObjectId casting
        try {
          console.log('Trying Firebase-specific endpoint:', config.endpoints.eventsFirebase);
          const response = await api.get(config.endpoints.eventsFirebase);

          if (response && response.data && Array.isArray(response.data)) {
            const validEvents = response.data.filter(event => event && event.date);

            // Sort events by date
            const sortedEvents = validEvents.sort((a, b) => {
              try {
                return new Date(a.date) - new Date(b.date);
              } catch (err) {
                return 0;
              }
            });

            setEvents(sortedEvents);
            console.log('✅ Fetched events successfully from Firebase endpoint:', sortedEvents.length);
            setLoading(false);
            return;
          }
        } catch (firebaseErr) {
          console.log("⚠️ Firebase endpoint failed, trying standard endpoint:", firebaseErr);
        }

        // Second try: Standard endpoint with population
        try {
          console.log('Trying standard endpoint:', config.endpoints.events);
          const response = await api.get(config.endpoints.events);

          // Better response validation
          if (!response || !response.data) {
            throw new Error("Empty response received from API");
          }

          if (!Array.isArray(response.data)) {
            console.error("Unexpected API response format:", response.data);
            throw new Error("Unexpected API response format");
          }

          // Add defensive checks for sorting
          const validEvents = response.data.filter(event => event && event.date);

          // Sort events by date
          const sortedEvents = validEvents.sort((a, b) => {
            try {
              return new Date(a.date) - new Date(b.date);
            } catch (err) {
              console.error("Error sorting events:", err);
              return 0;
            }
          });

          setEvents(sortedEvents);
          console.log('✅ Fetched events successfully from standard endpoint:', sortedEvents.length);
          setLoading(false);
          return;
        } catch (standardErr) {
          // Check if it's the specific ObjectId casting error
          if (standardErr.response &&
              standardErr.response.data &&
              standardErr.response.data.error &&
              standardErr.response.data.error.includes("Cast to ObjectId failed")) {

            console.log("⚠️ ObjectId casting error detected, trying no-populate endpoint");

            // Third try: No-populate endpoint
            try {
              console.log('Trying no-populate endpoint:', config.endpoints.eventsNoPopulate);
              const fallbackResponse = await api.get(config.endpoints.eventsNoPopulate);

              if (fallbackResponse && fallbackResponse.data && Array.isArray(fallbackResponse.data)) {
                const validEvents = fallbackResponse.data.filter(event => event && event.date);

                // Sort events by date
                const sortedEvents = validEvents.sort((a, b) => {
                  try {
                    return new Date(a.date) - new Date(b.date);
                  } catch (err) {
                    return 0;
                  }
                });

                setEvents(sortedEvents);
                console.log('✅ Fetched events successfully from no-populate endpoint:', sortedEvents.length);
                setLoading(false);
                return;
              }
            } catch (fallbackErr) {
              console.error("Fallback endpoint also failed:", fallbackErr);
            }
          }

          throw standardErr; // Re-throw if it's not the specific error we're handling
        }
      } catch (err) {
        console.error("All endpoints failed:", err);

        // Final fallback: Show a dummy event
        console.log("⚠️ All endpoints failed, using local fallback event");
        const fallbackEvents = [
          {
            _id: "local-event-1",
            title: "Default Event (Backend Connection Issue)",
            description: "This is a fallback event shown because there was an issue connecting to the backend. Please try refreshing or contact support.",
            date: new Date().toISOString().split('T')[0],
            time: "12:00 PM",
            location: "Online",
            organizer: "System",
            registeredUsers: [],
            createdByRole: "Alumni"
          }
        ];

        setEvents(fallbackEvents);
        setError("⚠️ Backend connection issue. Some features may be limited. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Open registration form
  const openRegistrationForm = (event) => {
    if (!user || !user.uid) {
      alert("Please log in to register for events.");
      return;
    }

    // Pre-fill form with user data if available
    setFormData({
      name: user.displayName || '',
      email: user.email || '',
      phone: '',
      currentYear: '',
      program: '',
      whyInterested: '',
      additionalInfo: ''
    });

    setSelectedEvent(event);
    setShowRegistrationForm(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    if (!formData.currentYear.trim()) errors.currentYear = "Current year is required";
    if (!formData.program.trim()) errors.program = "Program is required";
    if (!formData.whyInterested.trim()) errors.whyInterested = "This field is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit registration form
  const handleSubmitRegistration = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user || !user.uid || !selectedEvent) {
      alert("Something went wrong. Please try again.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (process.env.NODE_ENV === 'development') {
        console.log('Submitting registration for event:', selectedEvent._id);
      }

      // Use the regular registration endpoint since the form endpoint is not working
      const registerEndpoint = `${config.apiUrl}/api/events/${selectedEvent._id}/register`;
      console.log('Using registration endpoint:', registerEndpoint);

      // Store the form data in localStorage for future reference
      localStorage.setItem(`event_registration_${selectedEvent._id}_${user.uid}`, JSON.stringify(formData));

      // Use the regular registration endpoint but include the form data
      const response = await api.post(registerEndpoint, {
        firebaseUID: user.uid,
        // Include form data as additional fields
        formData: formData
      });

      console.log('Registration response:', response.data);

      // Update the events list with the returned event data
      setEvents(prev => prev.map(event => {
        if (event._id === selectedEvent._id) {
          return response.data.event;
        }
        return event;
      }));

      // Close the form and show success message
      setShowRegistrationForm(false);
      alert("✅ Successfully registered for the event!");
    } catch (error) {
      console.error("❌ Error registering for event:", error);
      if (error.response) {
        alert(error.response.data.message || "Failed to register for the event");
      } else if (error.request) {
        alert("Unable to reach the server. Please check your connection.");
      } else {
        alert("An error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Legacy registration function (direct registration without form)
  const handleRegister = async (eventId) => {
    if (!user || !user.uid) {
      alert("Please log in to register for events.");
      return;
    }

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Registering for event:', eventId);
      }

      const response = await api.post(`${config.endpoints.events}/${eventId}/register`, {
        firebaseUID: user.uid
      });

      // Update the events list with the returned event data
      setEvents(prev => prev.map(event => {
        if (event._id === eventId) {
          return response.data.event;
        }
        return event;
      }));

      alert("✅ Successfully registered for the event!");
    } catch (error) {
      console.error("❌ Error registering for event:", error);
      if (error.response) {
        alert(error.response.data.message || "Failed to register for the event");
      } else if (error.request) {
        alert("Unable to reach the server. Please check your connection.");
      } else {
        alert("An error occurred. Please try again.");
      }
    }
  };

  // Helper function to safely get organizer name
  const getOrganizerName = (event) => {
    if (!event) return "Unknown";

    // If the event has an organizer field directly
    if (event.organizer) return event.organizer;

    // If createdBy is populated as an object with name
    if (event.createdBy && typeof event.createdBy === 'object' && event.createdBy.name) {
      return event.createdBy.name;
    }

    // If createdBy is populated as an object with email
    if (event.createdBy && typeof event.createdBy === 'object' && event.createdBy.email) {
      return event.createdBy.email.split('@')[0]; // Use first part of email
    }

    // Fallback
    return "Unknown Organizer";
  };

  // 🔍 Filter events based on search input and date filter
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title?.toLowerCase().includes(search.toLowerCase());
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let matchesDateFilter = true;
    if (filter === "upcoming") {
      matchesDateFilter = eventDate >= today;
    } else if (filter === "past") {
      matchesDateFilter = eventDate < today;
    }

    return matchesSearch && matchesDateFilter;
  });

  // Check if a user is registered for an event
// Check if a user is registered for an event
const isUserRegistered = (event) => {
  if (!user || !event) return false;

  // Check in registeredUsers array if it exists
  if (Array.isArray(event.registeredUsers)) {
    // Handle different ways the userId might be structured based on manual population
    return event.registeredUsers.some(registration => {
      // Check if registration is a populated object with firebaseUID
      if (registration.userId && registration.userId.firebaseUID) {
        return registration.userId.firebaseUID === user.uid;
      }

      // Check if userId is an object with _id that might match the user's MongoDB ID
      if (registration.userId && registration.userId._id) {
        return registration.userId._id === user.uid;
      }

      // Check if registration is directly a user object
      if (registration.firebaseUID) {
        return registration.firebaseUID === user.uid;
      }

      // Direct comparison for string IDs
      return registration.userId === user.uid || registration === user.uid;
    });
  }

  // Check in registrations array if it exists (as seen in the UI code)
  if (Array.isArray(event.registrations)) {
    return event.registrations.some(registration => {
      // If registration is an object
      if (typeof registration === 'object' && registration !== null) {
        return registration.userId === user.uid;
      }
      // If registration is just the user ID
      return registration === user.uid;
    });
  }

  // If neither array exists, the user is not registered
  return false;
};

  // Check if the current user created this event
  const isEventCreator = (event) => {
    if (!user || !event) return false;

    // Check different ways the createdBy field might be structured
    if (event.createdBy && typeof event.createdBy === 'object' && event.createdBy.firebaseUID) {
      return event.createdBy.firebaseUID === user.uid;
    }

    // Direct comparison if createdBy is the Firebase UID
    if (typeof event.createdBy === 'string') {
      return event.createdBy === user.uid;
    }

    return false;
  };

  // Handle event deletion with confirmation
  const handleDeleteEvent = async (eventId, eventTitle) => {
    if (!user || !role || !['teacher', 'alumni', 'admin'].includes(role.toLowerCase())) {
      alert("You don't have permission to delete events");
      return;
    }

    // Confirm before deleting
    if (!window.confirm(`Are you sure you want to delete the event "${eventTitle}"? This cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);

      if (process.env.NODE_ENV === 'development') {
        console.log('Deleting event:', eventId);
      }

      await api.delete(`${config.endpoints.events}/${eventId}?firebaseUID=${user.uid}&role=${role}`);

      // Remove the event from state
      setEvents(prevEvents => prevEvents.filter(e => e._id !== eventId));

      alert("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
      let errorMessage = "Failed to delete event";

      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getEventStatus = (eventDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const event = new Date(eventDate);
    event.setHours(0, 0, 0, 0);

    if (event < today) return "past";
    if (event.getTime() === today.getTime()) return "today";
    return "upcoming";
  };

  return (
    <div className="events-container bg-white dark:bg-gray-900 min-h-screen py-8">
      <div className="events-header px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="events-title text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="text-blue-500 mr-2">📅</span> Events
        </h2>
        <div className="events-filters mb-8">
          <div className="search-box relative mb-4">
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-3 px-12 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              style={{ backgroundColor: isDarkMode ? '#1f2937' : 'white' }}
            />
            {/* <span className="search-icon absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300">
              🔍
            </span> */}
          </div>
          <div className="filter-buttons flex flex-wrap gap-2">
            <button
              className={`filter-btn px-4 py-2 rounded-md transition-colors ${
                filter === "all"
                  ? "bg-blue-500 text-white dark:text-white font-medium active"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
              onClick={() => setFilter("all")}
              style={{
                color: filter === "all" ? "white" : (isDarkMode ? "white" : "#374151")
              }}
            >
              All Events
            </button>
            <button
              className={`filter-btn px-4 py-2 rounded-md transition-colors ${
                filter === "upcoming"
                  ? "bg-blue-500 text-white dark:text-white font-medium active"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
              onClick={() => setFilter("upcoming")}
              style={{
                color: filter === "upcoming" ? "white" : (isDarkMode ? "white" : "#374151")
              }}
            >
              Upcoming
            </button>
            <button
              className={`filter-btn px-4 py-2 rounded-md transition-colors ${
                filter === "past"
                  ? "bg-blue-500 text-white dark:text-white font-medium active"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
              onClick={() => setFilter("past")}
              style={{
                color: filter === "past" ? "white" : (isDarkMode ? "white" : "#374151")
              }}
            >
              Past
            </button>
          </div>
        </div>
      </div>

      {(role === "teacher" || role === "alumni") && (
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-8">
          <Link to="/create-event" className="create-event-btn inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
            <span className="btn-icon mr-2">➕</span>
            Create New Event
          </Link>
        </div>
      )}

      {error && <div className="error-message bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-lg max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">{error}</div>}

      {loading || authLoading ? (
        <div className="loading-state flex flex-col items-center justify-center py-12">
          <div className="loading-spinner w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading events...</p>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="events-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {filteredEvents.map((eventData) => {
            // Apply the safe event object pattern to prevent errors
            const event = safeEventObject(eventData);
            const status = getEventStatus(event.date);
            const isRegistered = isUserRegistered(event);

            return (
              <div
                key={event._id}
                className={`event-card bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200 dark:border-gray-700`}
                style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}
              >
                <div className={`event-status-badge text-xs font-semibold px-3 py-1 rounded-br-lg inline-block
                  ${status === "upcoming"
                    ? "bg-green-500 text-white"
                    : status === "today"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-500 text-white"}`}
                >
                  {status === "upcoming" ? "Upcoming" : status === "today" ? "Today" : "Past"}
                </div>
                <div className="event-content p-5">
                  <h3 className="event-title text-xl font-bold text-gray-900 dark:text-white mb-2">{event.title}</h3>
                  <p className="event-description text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{event.description}</p>
                  <div className="event-details space-y-2 mb-4">
                    <div className="detail-item flex items-center text-gray-700 dark:text-gray-300">
                      <span className="detail-icon mr-2">📅</span>
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item flex items-center text-gray-700 dark:text-gray-300">
                      <span className="detail-icon mr-2">⏰</span>
                      <span>{event.time}</span>
                    </div>
                    <div className="detail-item flex items-center text-gray-700 dark:text-gray-300">
                      <span className="detail-icon mr-2">📍</span>
                      <span>{event.location}</span>
                    </div>
                    <div className="detail-item flex items-center text-gray-700 dark:text-gray-300">
                      <span className="detail-icon mr-2">👤</span>
                      <span>Organized by: {getOrganizerName(event)}</span>
                    </div>
                    <div className="detail-item flex items-center text-gray-700 dark:text-gray-300">
                      <span className="detail-icon mr-2">👥</span>
                      <span>{event.registeredUsers?.length || 0} Registered</span>
                    </div>
                  </div>

                  {user && role === "student" && (
                    <div className="event-actions mt-4">
                      {isRegistered ? (
                        <button className="action-btn registered w-full py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-medium rounded-lg flex items-center justify-center" disabled>
                          <span className="mr-2">✅</span> Registered
                        </button>
                      ) : status === "past" ? (
                        <button className="action-btn past w-full py-2 bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium rounded-lg flex items-center justify-center" disabled>
                          <span className="mr-2">⏰</span> Event Ended
                        </button>
                      ) : (
                        <button
                          className="action-btn register w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                          onClick={() => openRegistrationForm(event)}
                        >
                          <span className="mr-2">🎟</span> Register Now
                        </button>
                      )}
                    </div>
                  )}

                  {/* Delete button for event creators (teachers/alumni)
                  {user && (role === "teacher" || role === "alumni" || role === "admin") && isEventCreator(event) && (
                    <div className="event-actions mt-4">
                      <button
                        className="action-btn delete w-full py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                        onClick={() => handleDeleteEvent(event._id, event.title)}
                      >
                        <span className="mr-2">🗑️</span> Delete Event
                      </button>
                    </div>
                  )} */}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-events flex flex-col items-center justify-center py-12 text-gray-600 dark:text-gray-300">
          <p className="text-xl mb-2">No events found matching your criteria.</p>
          <p>Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Registration Form Modal */}
      {showRegistrationForm && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Register for Event</h2>
              <button
                onClick={() => setShowRegistrationForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{selectedEvent.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{new Date(selectedEvent.date).toLocaleDateString()} at {selectedEvent.time}</p>
              <p className="text-gray-600 dark:text-gray-400">Location: {selectedEvent.location}</p>
            </div>

            <form onSubmit={handleSubmitRegistration} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  required
                />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  required
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number*</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  required
                />
                {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Year*</label>
                  <select
                    name="currentYear"
                    value={formData.currentYear}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="5th Year">5th Year</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                  {formErrors.currentYear && <p className="text-red-500 text-xs mt-1">{formErrors.currentYear}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program/Major*</label>
                  <input
                    type="text"
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    required
                  />
                  {formErrors.program && <p className="text-red-500 text-xs mt-1">{formErrors.program}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Why are you interested in this event?*</label>
                <textarea
                  name="whyInterested"
                  value={formData.whyInterested}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  required
                ></textarea>
                {formErrors.whyInterested && <p className="text-red-500 text-xs mt-1">{formErrors.whyInterested}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Additional Information (Optional)</label>
                <textarea
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowRegistrationForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
