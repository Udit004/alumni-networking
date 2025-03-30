const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const User = require("../models/user");
const mongoose = require("mongoose");

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

        // Validate and log received data
        console.log("📥 Received event creation request with data:", {
            title, description, date, time, location, 
            createdBy: typeof createdBy === 'object' ? 'Object' : createdBy, 
            createdByRole
        });

        // Validate required fields
        if (!title || !description || !date || !time || !location || !createdBy || !createdByRole) {
            console.error("❌ Validation failed. Missing fields:", {
                title: !title,
                description: !description,
                date: !date,
                time: !time,
                location: !location,
                createdBy: !createdBy,
                createdByRole: !createdByRole
            });
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if createdByRole is valid
        const validRoles = ["student", "teacher", "alumni", "Student", "Teacher", "Alumni"];
        if (!validRoles.includes(createdByRole)) {
            console.error("❌ Invalid role:", createdByRole);
            return res.status(400).json({ message: "Invalid role provided" });
        }

        // Format the role correctly (capitalize first letter)
        const formattedRole = createdByRole.charAt(0).toUpperCase() + createdByRole.slice(1).toLowerCase();
        
        // Handle different types of createdBy values
        let finalCreatedBy = createdBy;
        
        // If createdBy is a string but not a valid ObjectId, try to find the user by Firebase UID
        if (typeof createdBy === 'string' && !mongoose.Types.ObjectId.isValid(createdBy)) {
            try {
                console.log("🔍 Looking up user by Firebase UID:", createdBy);
                const user = await User.findOne({ firebaseUID: createdBy });
                if (user) {
                    console.log("✅ Found user by Firebase UID, using MongoDB ID instead:", user._id);
                    finalCreatedBy = user._id;
                } else {
                    console.log("⚠️ No user found with Firebase UID, using original value");
                }
            } catch (err) {
                console.error("❌ Error looking up user by Firebase UID:", err);
                // Continue with original value if lookup fails
            }
        }

        // Create new event
        const event = new Event({
            title,
            description,
            date,
            time,
            location,
            createdBy: finalCreatedBy,
            createdByRole: formattedRole
        });

        // Save event
        await event.save();

        console.log("✅ Event created successfully:", event);
        res.status(201).json(event);
    } catch (error) {
        console.error("❌ Error creating event:", error);
        
        // Provide more detailed error response
        if (error.name === 'ValidationError') {
            console.error("Validation error details:", error.errors);
            return res.status(400).json({ 
                message: "Validation error", 
                details: Object.values(error.errors).map(err => err.message) 
            });
        } else if (error.name === 'CastError') {
            console.error("Cast error details:", error);
            return res.status(400).json({ 
                message: "Invalid data format", 
                details: `${error.path}: ${error.value} is not a valid ${error.kind}` 
            });
        }
        
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 📌 Register a user for an event
router.post("/:eventId/register", async (req, res) => {
    try {
        const { userId, firebaseUID } = req.body;
        const { eventId } = req.params;

        console.log("📥 Registration Request:", {
            eventId,
            userId,
            firebaseUID
        });

        // 🔍 Step 1: Validate the event ID
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            console.error("❌ Invalid event ID format:", eventId);
            return res.status(400).json({ message: "Invalid event ID format" });
        }

        // 🔍 Step 2: Find the event
        const event = await Event.findById(eventId);
        if (!event) {
            console.error("❌ Event not found:", eventId);
            return res.status(404).json({ message: "Event not found" });
        }

        // 🔍 Step 3: Find and validate user
        let user;
        if (mongoose.Types.ObjectId.isValid(userId)) {
            user = await User.findById(userId);
        }
        
        if (!user && firebaseUID) {
            user = await User.findOne({ firebaseUID });
        }

        if (!user) {
            console.error("❌ User not found");
            return res.status(404).json({ message: "User not found" });
        }

        console.log("✅ Found User:", user);

        // 🔄 Step 4: Check if user is already registered
        const alreadyRegistered = event.registeredUsers.some(
            (r) => r.userId.toString() === user._id.toString()
        );

        if (alreadyRegistered) {
            console.log("⚠️ User already registered");
            return res.status(400).json({ message: "User already registered for this event" });
        }

        // 🎟 Step 5: Register the user
        event.registeredUsers.push({ userId: user._id });
        await event.save();

        // 🔄 Step 6: Get updated event with populated data
        const updatedEvent = await Event.findById(eventId)
            .populate("registeredUsers.userId", "name email")
            .populate("createdBy", "name email");

        console.log("✅ Registration successful for:", user.name);
        res.status(200).json({ 
            message: "Registration successful",
            event: updatedEvent
        });

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
