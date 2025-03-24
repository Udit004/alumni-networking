import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { Link } from "react-router-dom";

const Events = () => {
  const { user, role, loading: authLoading } = useAuth();
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://192.168.43.177:5000/api/events'
    : 'https://alumni-networking.onrender.com/api/events';

  // 🔄 Fetch Events from Backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_URL, { method: "GET", headers: { "Content-Type": "application/json" } });

        if (!res.ok) throw new Error(`Failed to fetch events. Status: ${res.status}`);

        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Unexpected API response format.");

        setEvents(data);
      } catch (err) {
        setError("Failed to load events. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // 🎟 Handle Student Event Registration
  const handleRegister = async (eventId) => {
    if (!user || !user.uid) {
      console.error("❌ Error: User not logged in");
      return;
    }

    try {
      // 🔹 Step 1: Fetch MongoDB User ID using Firebase UID
      const userRes = await fetch(`http://192.168.43.177:5000/api/getUserByFirebaseUID/${user.uid}`);
      if (!userRes.ok) throw new Error("Failed to fetch user data");

      const userData = await userRes.json();

      // 🔹 Step 2: Register for the event using MongoDB User ID
      const response = await fetch(`http://192.168.43.177:5000/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userData._id }),
      });

      if (!response.ok) throw new Error("Registration failed");

      alert("✅ Registration successful!");
    } catch (error) {
      console.error("❌ Error registering for event:", error);
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
              {user && role === "student" && !event.registeredUsers.some((r) => r.userId === user.uid) && (
                <button className="bg-green-500 text-white px-3 py-1 rounded mt-2 hover:bg-green-600"
                  onClick={() => handleRegister(event._id)}>
                  🎟 Register
                </button>
              )}
            </div>
          ))}
        </div>
      ) : <p className="text-gray-500">No events available.</p>}
    </div>
  );
};

export default Events;
