import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { Link } from "react-router-dom";
import config from "../config";

const Events = () => {
  const { user, role, loading: authLoading } = useAuth();
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        setEvents(data);
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
            role: role.charAt(0).toUpperCase() + role.slice(1) // Capitalize role
          })
        });
        
        if (!createUserRes.ok) {
          throw new Error("Failed to create/fetch user");
        }
        
        const userData = await createUserRes.json();
        console.log("Created new user:", userData);
        return handleRegister(eventId); // Retry registration with new user
      }

      const userData = await userRes.json();
      console.log("Found existing user:", userData);

      // 🔹 Step 2: Register for the event using MongoDB User ID
      console.log("Attempting to register for event:", eventId, "with user:", userData._id);
      const response = await fetch(`${API_URL}/api/events/${eventId}/register`, {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          userId: userData._id,
          firebaseUID: user.uid // Send both IDs for verification
        })
      });

      console.log("Registration response status:", response.status);
      const responseText = await response.text();
      console.log("Registration response text:", responseText);

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

      let registrationData;
      try {
        registrationData = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse registration response:", e);
        throw new Error("Invalid response from server");
      }

      console.log("Registration successful:", registrationData);

      // 🔹 Step 3: Update the events list with the returned event data
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

  // 🔍 Filter events based on search input
  const filteredEvents = events.filter((event) =>
    event.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">📅 Upcoming Events</h2>

      {error && <p className="text-red-500">{error}</p>}

      <input
        type="text"
        placeholder="Search events..."
        className="w-full p-2 mb-4 border rounded"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {(role === "teacher" || role === "alumni") && (
        <Link to="/create-event">
          <button className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600">
            ➕ Create Event
          </button>
        </Link>
      )}

      {loading || authLoading ? (
        <p className="text-gray-500">Loading events...</p>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((event) => (
            <div key={event._id} className="p-4 border rounded shadow bg-white">
              <h3 className="text-xl font-semibold">{event.title}</h3>
              <p className="text-gray-600">{event.description}</p>
              <div className="mt-2">
                <p className="text-sm text-gray-500">📅 {new Date(event.date).toLocaleDateString()}</p>
                <p className="text-sm text-gray-500">⏰ {event.time}</p>
                <p className="text-sm text-gray-500">📍 {event.location}</p>
              </div>
              {user && role === "student" && (
                event.registeredUsers.some(r => r.userId === user.uid) ? (
                  <button className="bg-gray-500 text-white px-3 py-1 rounded mt-2 cursor-not-allowed">
                    ✅ Registered
                  </button>
                ) : (
                  <button 
                    className="bg-green-500 text-white px-3 py-1 rounded mt-2 hover:bg-green-600"
                    onClick={() => handleRegister(event._id)}
                  >
                    🎟 Register
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      ) : <p className="text-gray-500">No events available.</p>}
    </div>
  );
};

export default Events;
