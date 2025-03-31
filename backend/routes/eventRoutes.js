const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const User = require("../models/user");
const mongoose = require("mongoose");

// 📌 Get all events
router.get("/", async (req, res) => {
    try {
        const events = await Event.find()
            .populate({
                path: "registeredUsers.userId",
                select: "name email",
                model: "User"
            })
            .populate({
                path: "createdBy",
                select: "name email",
                model: "User"
            });

        console.log(`📋 Found ${events.length} events`);
        res.status(200).json(events);
    } catch (error) {
        console.error("❌ Error fetching events:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 📌 Get a specific event by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // 🔍 Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.error("❌ Invalid event ID format:", id);
            return res.status(400).json({ message: "Invalid event ID format" });
        }

        // 🔍 Find the event
        const event = await Event.findById(id)
            .populate("registeredUsers.userId", "name email")
            .populate("createdBy", "name email");

        if (!event) {
            console.error("❌ Event not found:", id);
            return res.status(404).json({ message: "Event not found" });
        }

        console.log("✅ Event found:", event.title);
        res.status(200).json(event);
    } catch (error) {
        console.error("❌ Error fetching event:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 📌 Create a new event
router.post("/", async (req, res) => {
    try {
        const { title, description, date, location, organizer, userId, firebaseUID } = req.body;

        console.log("📝 Creating event:", { title, organizer, userId, firebaseUID });

        // 🔍 Step 1: Find the user who is creating the event
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

        // 📌 Step 2: Create the event
        const newEvent = new Event({
            title,
            description,
            date,
            location,
            organizer,
            createdBy: user._id,
            createdAt: new Date(),
            registeredUsers: []
        });

        // 💾 Step 3: Save the event
        await newEvent.save();
        console.log("✅ Event created:", newEvent._id);

        res.status(201).json({
            message: "Event created successfully",
            event: newEvent
        });

    } catch (error) {
        console.error("❌ Error creating event:", error);
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
            .populate({
                path: "createdBy",
                select: "name email",
                match: (doc) => {
                    if (mongoose.Types.ObjectId.isValid(doc.createdBy)) {
                        return { _id: doc.createdBy };
                    }
                    return { firebaseUID: doc.createdBy };
                }
            });

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

// 📌 Get events created by or registered by a specific user
router.get("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const { firebaseUID } = req.query;

        console.log("🔍 Looking for events by user:", { userId, firebaseUID });

        // 🔍 Find the user by firebaseUID first, then fallback to MongoDB _id
        let user;
        if (firebaseUID) {
            user = await User.findOne({ firebaseUID });
        } else if (mongoose.Types.ObjectId.isValid(userId)) {
            user = await User.findById(userId);
        }

        if (!user) {
            console.error("❌ User not found");
            return res.status(404).json({ message: "User not found" });
        }

        console.log("✅ Found user:", user.name);

        // 🔍 Find events created by the user
        const createdEvents = await Event.find({ createdBy: user._id })
            .populate({
                path: "registeredUsers.userId",
                select: "name email",
                model: "User"
            })
            .populate({
                path: "createdBy",
                select: "name email",
                model: "User"
            });

        // 🔍 Find events the user has registered for
        const registeredEvents = await Event.find({ "registeredUsers.userId": user._id })
            .populate({
                path: "registeredUsers.userId",
                select: "name email",
                model: "User"
            })
            .populate({
                path: "createdBy",
                select: "name email",
                model: "User"
            });

        console.log(`📋 Found ${createdEvents.length} created events and ${registeredEvents.length} registered events`);
        
        res.status(200).json({
            createdEvents,
            registeredEvents
        });
    } catch (error) {
        console.error("❌ Error fetching user events:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
