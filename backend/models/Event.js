const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ Reference to User
  createdByRole: { type: String, enum: ["Student", "Teacher", "Alumni"], required: true },
  registeredUsers: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // ✅ Store ObjectId reference
      isVerified: { type: Boolean, default: false },
    }
  ]
});

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
