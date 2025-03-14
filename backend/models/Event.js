const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: String,
  time: String,
  location: String,
  createdBy: String,
  createdByRole: String,
  registeredUsers: { type: Array, default: [] }
});

const Event = mongoose.model("events", eventSchema);  // Ensure "events" matches your collection name

module.exports = Event;
