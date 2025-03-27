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
      // 🔹 Step 1: Get user from MongoDB
      const userRes = await fetch(`${API_URL}/api/users/firebase/${user.uid}`);
      if (!userRes.ok) {
        // If user doesn't exist, create them
        const createUserRes = await fetch(`${API_URL}/api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firebaseUID: user.uid,
            name: user.displayName || 'User',
            email: user.email,
            role: role.charAt(0).toUpperCase() + role.slice(1)
          })
        });
        
        if (!createUserRes.ok) {
          throw new Error("Failed to create/fetch user");
        }
        
        const userData = await createUserRes.json();
        return handleRegister(eventId);
      }

      const userData = await userRes.json();

      // 🔹 Step 2: Register for the event
      const response = await fetch(`${API_URL}/api/events/${eventId}/register`, {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          userId: userData._id,
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

      // 🔹 Step 3: Update the events list
      const updatedEvents = events.map(event => {
        if (event._id === eventId) {
          return registrationData.event || {
            ...event,
            registeredUsers: [...event.registeredUsers, { userId: userData._id }]
          };
        }
        return event;
      });
      setEvents(updatedEvents);

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
    <div className="events-container">
      <div className="events-header">
        <h2 className="events-title">📅 Events</h2>
        <div className="events-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All Events
            </button>
            <button 
              className={`filter-btn ${filter === "upcoming" ? "active" : ""}`}
              onClick={() => setFilter("upcoming")}
            >
              Upcoming
            </button>
            <button 
              className={`filter-btn ${filter === "past" ? "active" : ""}`}
              onClick={() => setFilter("past")}
            >
              Past
            </button>
          </div>
        </div>
      </div>

      {(role === "teacher" || role === "alumni") && (
        <Link to="/create-event" className="create-event-btn">
          <span className="btn-icon">➕</span>
          Create New Event
        </Link>
      )}

      {error && <div className="error-message">{error}</div>}

      {loading || authLoading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading events...</p>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="events-grid">
          {filteredEvents.map((event) => {
            const status = getEventStatus(event.date);
            const isRegistered = user && event.registeredUsers.some(r => r.userId === user.uid);
            
            return (
              <div key={event._id} className={`event-card ${status}`}>
                <div className="event-status-badge">
                  {status === "upcoming" ? "Upcoming" : status === "today" ? "Today" : "Past"}
                </div>
                <div className="event-content">
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-description">{event.description}</p>
                  <div className="event-details">
                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">⏰</span>
                      <span>{event.time}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">📍</span>
                      <span>{event.location}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">👥</span>
                      <span>{event.registeredUsers?.length || 0} Registered</span>
                    </div>
                  </div>
                  {user && role === "student" && (
                    <div className="event-actions">
                      {isRegistered ? (
                        <button className="action-btn registered" disabled>
                          ✅ Registered
                        </button>
                      ) : (
                        <button 
                          className="action-btn register"
                          onClick={() => handleRegister(event._id)}
                        >
                          🎟 Register Now
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
        <div className="no-events">
          <p>No events found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Events;
