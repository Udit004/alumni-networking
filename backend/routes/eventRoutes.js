const express = require("express");
const Event = require("../models/Event");  // Import Event model
const router = express.Router();

// 🔹 Create a new event
router.post("/", async (req, res) => {
    try {
        const event = new Event(req.body);
        const savedEvent = await event.save();
        res.json(savedEvent);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔹 Register a user for an event
router.post("/:id/register", async (req, res) => {
    const { userId } = req.body;
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: "Event not found" });

        event.registeredUsers.push(userId);
        await event.save();
        res.json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔹 Get all events
router.get("/", async (req, res) => {
    try {
        const events = await Event.find({});
        console.log("Fetched events from DB:", events);  // ✅ Debugging step
        res.json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;  // ✅ Export router only once
