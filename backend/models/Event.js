const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: false, default: "12:00" }, // Optional with default
    location: { type: String, required: true },
    createdBy: { 
        type: mongoose.Schema.Types.Mixed, // Mixed type to support both ObjectId and String
        required: true,
        ref: "User" 
    },
    createdByRole: { type: String, enum: ["Student", "Teacher", "Alumni", "student", "teacher", "alumni"], required: true },
    registeredUsers: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" } }],
    createdAt: { type: Date, default: Date.now }
});

// Remove the pre-find middleware that's causing issues
// We're handling population manually in routes now

module.exports = mongoose.model("Event", EventSchema);
