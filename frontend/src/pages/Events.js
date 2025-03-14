import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";

const Events = () => {
  const { user, role } = useAuth();
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = "http://192.168.221.177:5000/api/events"; // ✅ Use local network IP

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        console.log("📡 Fetching events...");
        
        const res = await fetch(API_URL, { 
          method: "GET", 
          headers: { "Content-Type": "application/json" } 
        });
  
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
  
        const data = await res.json();
        console.log("✅ Events received:", data);
        setEvents(data);
      } catch (err) {
        console.error("❌ Error fetching events:", err);
        setError("Failed to load events. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchEvents();
  }, []);
  

  // 🔎 Filter events based on search input
  const filteredEvents = events.filter((event) =>
    event.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">📅 Upcoming Events</h2>

      {/* 🔍 Search Bar */}
      <input
        type="text"
        placeholder="Search events..."
        className="w-full p-2 mb-4 border rounded"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ➕ Create Event Button (Only for Teachers & Alumni) */}
      {(role === "teacher" || role === "alumni") && (
        <button className="bg-blue-500 text-white px-4 py-2 rounded mb-4">
          ➕ Create Event
        </button>
      )}

      {/* 🛑 Show Error Message */}
      {error && <p className="text-red-500">{error}</p>}

      {/* 🔄 Show Loading State */}
      {loading ? (
        <p className="text-gray-500">Loading events...</p>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((event) => (
            <div key={event._id} className="p-4 border rounded shadow">
              <h3 className="text-xl font-semibold">{event.title}</h3>
              <p className="text-gray-600">{event.description}</p>
              <p className="text-sm text-gray-500">
                📍 {event.location} | 📅 {new Date(event.date).toLocaleDateString()} | ⏰ {event.time}
              </p>

              {/* 🎟 Register Button (Only for Students) */}
              {user && role === "student" && (
                <button className="bg-green-500 text-white px-3 py-1 rounded mt-2">
                  🎟 Register
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No events available.</p>
      )}
    </div>
  );
};

export default Events;
