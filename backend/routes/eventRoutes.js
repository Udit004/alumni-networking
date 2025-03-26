const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const User = require("../models/user");

// ✅ GET ALL EVENTS
router.get("/", async (req, res) => {
    try {
        const events = await Event.find({})
            .populate("createdBy", "name email")
            .populate("registeredUsers.userId", "name email");

        console.log("✅ Fetched Events:", events);
        res.json(events);
    } catch (error) {
        console.error("❌ Error fetching events:", error);
        console.log("🔍 Error details:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 📌 Create a new event
router.post("/", async (req, res) => {
    try {
        const { title, description, date, time, location, createdBy, createdByRole } = req.body;

        // Validate required fields
        if (!title || !description || !date || !time || !location || !createdBy || !createdByRole) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Create new event
        const event = new Event({
            title,
            description,
            date,
            time,
            location,
            createdBy,
            createdByRole
        });

        // Save event
        await event.save();

        console.log("✅ Event created successfully:", event);
        res.status(201).json(event);
    } catch (error) {
        console.error("❌ Error creating event:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 📌 Register a user for an event
router.post("/:eventId/register", async (req, res) => {
    try {
        const { userId } = req.body; // This is the Firebase UID coming from the frontend
        const { eventId } = req.params;

        console.log("📥 Received Registration Request for Event:", eventId);
        console.log("🔹 Firebase User ID:", userId);

        // 🔍 Step 1: Find user in MongoDB by their Firebase UID
        const user = await User.findOne({ firebaseUID: userId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("✅ Found User in MongoDB:", user);

        // 🔍 Step 2: Find the event
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // 🔄 Step 3: Check if the user is already registered
        const alreadyRegistered = event.registeredUsers.some(
            (r) => r.userId.toString() === user._id.toString()
        );

        if (alreadyRegistered) {
            return res.status(400).json({ message: "User already registered for this event" });
        }

        // 🎟 Step 4: Register the user with their MongoDB ObjectId
        event.registeredUsers.push({ userId: user._id });

        // 💾 Step 5: Save the updated event
        await event.save();

        console.log("✅ Registration successful for:", user.name);
        res.status(200).json({ message: "Registration successful" });

    } catch (error) {
        console.error("❌ Error in registration:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 📌 Get events for a specific user
router.get("/enrolled/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findOne({ firebaseUID: userId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const events = await Event.find({
            "registeredUsers.userId": user._id
        }).populate("createdBy", "name email");

        res.json(events);
    } catch (error) {
        console.error("❌ Error fetching enrolled events:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
