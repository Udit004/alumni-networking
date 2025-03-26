import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../config";
import './CreateEvent.css';

const EventCreate = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
  });

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please log in to create an event");
      return;
    }

    try {
      // First, try to get the MongoDB user ID using Firebase UID
      let mongoUserId;
      try {
        const userResponse = await axios.get(`${config.endpoints.users}/${user.uid}`);
        mongoUserId = userResponse.data._id;
      } catch (error) {
        if (error.response?.status === 404) {
          // User doesn't exist in MongoDB, create them
          const createUserResponse = await axios.post(config.endpoints.users, {
            firebaseUID: user.uid,
            name: user.displayName || "User",
            email: user.email,
            role: role.charAt(0).toUpperCase() + role.slice(1)
          });
          mongoUserId = createUserResponse.data._id;
        } else {
          throw error;
        }
      }

      // Create the event with MongoDB user ID
      const response = await axios.post(config.endpoints.events, {
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        createdBy: mongoUserId,
        createdByRole: role.charAt(0).toUpperCase() + role.slice(1)
      });

      console.log("✅ Event created successfully:", response.data);
      alert("Event created successfully!");
      navigate("/events");
    } catch (error) {
      console.error("❌ Error creating event:", error);
      alert(error.response?.data?.message || "Failed to create event");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-gray-100 to-blue-50 p-6">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center flex items-center gap-2">
          📅 Create New Event
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Event Title */}
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Event Title</label>
            <input
              type="text"
              name="title"
              value={eventData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              required
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Description</label>
            <textarea
              name="description"
              value={eventData.description}
              onChange={handleChange}
              placeholder="Enter event description"
              required
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-800 font-semibold mb-2">Date</label>
              <input
                type="date"
                name="date"
                value={eventData.date}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-gray-800 font-semibold mb-2">Time</label>
              <input
                type="time"
                name="time"
                value={eventData.time}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={eventData.location}
              onChange={handleChange}
              placeholder="Enter event location"
              required
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
          >
            Create Event
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventCreate;
