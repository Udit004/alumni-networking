const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true, index: true },
    time: { type: String, required: false, default: "12:00" }, // Optional with default
    location: { type: String, required: true },
    createdBy: {
        type: mongoose.Schema.Types.Mixed, // Mixed type to support both ObjectId and String
        required: true,
        ref: "User",
        index: true
    },
    createdByRole: { type: String, enum: ["Student", "Teacher", "Alumni", "student", "teacher", "alumni"], required: true, index: true },
    registeredUsers: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" } }],
    createdAt: { type: Date, default: Date.now, index: true }
});

// Add compound indexes for common query patterns
EventSchema.index({ date: 1, createdAt: -1 }); // For sorting events by date
EventSchema.index({ createdBy: 1, createdAt: -1 }); // For getting events by creator sorted by date

module.exports = mongoose.model("Event", EventSchema);
