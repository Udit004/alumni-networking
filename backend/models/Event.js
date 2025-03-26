const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdByRole: { type: String, enum: ["Student", "Teacher", "Alumni"], required: true },
    registeredUsers: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" } }] // ✅ Added this
});

module.exports = mongoose.model("Event", EventSchema);
