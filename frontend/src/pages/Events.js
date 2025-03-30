import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { Link } from "react-router-dom";
import config from "../config";
import "./Events.css";

const Events = () => {
  const { user, role, loading: authLoading } = useAuth();
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, upcoming, past
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

  const API_URL = process.env.REACT_APP_API_URL;

  // 🔄 Fetch Events from Backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/events`, { 
          method: "GET", 
          headers: { "Content-Type": "application/json" } 
        });

        if (!res.ok) throw new Error(`Failed to fetch events. Status: ${res.status}`);

        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Unexpected API response format.");

        // Sort events by date
        const sortedEvents = data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(sortedEvents);
      } catch (err) {
        setError("Failed to load events. Please try again.");
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [API_URL]);

  // 🎟 Handle Event Registration
  const handleRegister = async (eventId) => {
    if (!user || !user.uid) {
      alert("Please log in to register for events.");
      return;
    }

    try {
      // 🔹 Step 1: Register for the event with Firebase UID
      const response = await fetch(`${API_URL}/api/events/${eventId}/register`, {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          firebaseUID: user.uid
        })
      });

      const responseText = await response.text();
      let registrationData;

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message;
        } catch (e) {
          errorMessage = responseText;
        }
        throw new Error(errorMessage || "Registration failed");
      }

      try {
        registrationData = JSON.parse(responseText);
      } catch (e) {
        throw new Error("Invalid response from server");
      }

      // 🔹 Step 2: Update the events list
      setEvents(prev => prev.map(event => {
        if (event._id === eventId) {
          return registrationData.event || event;
        }
        return event;
      }));

      alert("✅ Successfully registered for the event!");
    } catch (error) {
      console.error("❌ Error registering for event:", error);
      alert(error.message || "Failed to register for the event. Please try again.");
    }
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
          {filteredEvents.map((event) => {
            const status = getEventStatus(event.date);
            const isRegistered = user && event.registeredUsers.some(r => r.userId === user.uid);
            
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
                      ) : (
                        <button 
                          className="action-btn register w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                          onClick={() => handleRegister(event._id)}
                        >
                          <span className="mr-2">🎟</span> Register Now
                        </button>
                      )}
                    </div>
                  )}
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
    </div>
  );
};

export default Events;
