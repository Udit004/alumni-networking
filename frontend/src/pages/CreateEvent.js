import React, { useState } from "react";
import './CreateEvent.css';

const EventCreate = () => {
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
    console.log("Creating Event:", eventData);
    // Implement API call here
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
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-2 rounded-lg transition duration-300 flex justify-center items-center gap-2"
          >
            🚀 Create Event
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventCreate;
