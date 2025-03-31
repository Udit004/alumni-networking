const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const User = require("../models/user");
const mongoose = require("mongoose");

// Verify User model is loaded correctly
console.log("📋 User model loaded:", {
    name: User.modelName,
    schema: User.schema.paths,
    collection: User.collection.name
});

// 📌 Get all events
router.get("/", async (req, res) => {
    try {
        // Check if we should skip population (for fallback mode)
        const skipPopulation = req.query.nopopulate === 'true';
        
        if (skipPopulation) {
            console.log("📝 Skip population requested, returning raw events");
            const rawEvents = await Event.find();
            return res.status(200).json(rawEvents);
        }
        
        // First fetch all events without population
        const events = await Event.find();
        
        // Then populate with special handling for different ID types
        const populatedEvents = await Promise.all(events.map(async (event) => {
            try {
                // Convert to plain object so we can modify it
                const eventObj = event.toObject();
                
                // Handle registered users population
                if (eventObj.registeredUsers && eventObj.registeredUsers.length > 0) {
                    const userIds = eventObj.registeredUsers
                        .map(reg => reg.userId)
                        .filter(id => mongoose.Types.ObjectId.isValid(id));
                    
                    if (userIds.length > 0) {
                        const users = await User.find({ _id: { $in: userIds } }).select("name email");
                        
                        eventObj.registeredUsers = eventObj.registeredUsers.map(reg => {
                            const user = users.find(u => u._id.toString() === reg.userId.toString());
                            return {
                                userId: user || reg.userId
                            };
                        });
                    }
                }
                
                // Handle createdBy population
                if (eventObj.createdBy) {
                    let creator = null;
                    
                    // Try to find by MongoDB ID
                    if (mongoose.Types.ObjectId.isValid(eventObj.createdBy)) {
                        creator = await User.findById(eventObj.createdBy).select("name email");
                    }
                    
                    // If not found and it's a string (likely Firebase UID), try to find by Firebase UID
                    if (!creator && typeof eventObj.createdBy === 'string') {
                        creator = await User.findOne({ firebaseUID: eventObj.createdBy }).select("name email");
                    }
                    
                    if (creator) {
                        eventObj.createdBy = creator;
                    }
                }
                
                return eventObj;
            } catch (err) {
                console.error(`❌ Error populating event ${event._id}:`, err);
                return event.toObject();
            }
        }));

        console.log(`📋 Found ${populatedEvents.length} events`);
        res.status(200).json(populatedEvents);
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

        // 🔍 Find the event without population
        const event = await Event.findById(id);

        if (!event) {
            console.error("❌ Event not found:", id);
            return res.status(404).json({ message: "Event not found" });
        }

        // Convert to plain object for manual population
        const eventObj = event.toObject();

        // Handle registered users population
        if (eventObj.registeredUsers && eventObj.registeredUsers.length > 0) {
            const userIds = eventObj.registeredUsers
                .map(reg => reg.userId)
                .filter(id => mongoose.Types.ObjectId.isValid(id));
            
            if (userIds.length > 0) {
                const users = await User.find({ _id: { $in: userIds } }).select("name email");
                
                eventObj.registeredUsers = eventObj.registeredUsers.map(reg => {
                    const user = users.find(u => u._id.toString() === reg.userId.toString());
                    return {
                        userId: user || reg.userId
                    };
                });
            }
        }
        
        // Handle createdBy population
        if (eventObj.createdBy) {
            let creator = null;
            
            // Try to find by MongoDB ID
            if (mongoose.Types.ObjectId.isValid(eventObj.createdBy)) {
                creator = await User.findById(eventObj.createdBy).select("name email");
            }
            
            // If not found and it's a string (likely Firebase UID), try to find by Firebase UID
            if (!creator && typeof eventObj.createdBy === 'string') {
                creator = await User.findOne({ firebaseUID: eventObj.createdBy }).select("name email");
            }
            
            if (creator) {
                eventObj.createdBy = creator;
            }
        }

        console.log("✅ Event found:", eventObj.title);
        res.status(200).json(eventObj);
    } catch (error) {
        console.error("❌ Error fetching event:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 📌 Create a new event
router.post("/", async (req, res) => {
    try {
        const { 
            title, 
            description, 
            date, 
            time,
            location, 
            organizer, 
            firebaseUID,
            createdByRole 
        } = req.body;
        const userIdFromBody = req.body.userId; // Renamed to avoid conflicts

        // 📝 Log the received data
        console.log("📝 Creating event with full payload:", JSON.stringify(req.body, null, 2));

        // 🔍 Validate required fields
        if (!title || !description || !date || !location) {
            console.error("❌ Missing required fields");
            return res.status(400).json({ 
                message: "Missing required fields",
                required: ["title", "description", "date", "location"],
                received: { title, description, date, location }
            });
        }

        console.log("🔍 Looking for user with firebaseUID:", firebaseUID);
        
        // 🔍 Step 1: Find the user who is creating the event
        let user;
        let createdById = null; // Changed variable name
        
        if (mongoose.Types.ObjectId.isValid(userIdFromBody)) {
            console.log("👤 Searching by userId:", userIdFromBody);
            try {
                user = await User.findById(userIdFromBody);
                console.log("👤 User found by ID:", user ? "Yes" : "No");
                if (user) createdById = user._id;
            } catch (findError) {
                console.error("❌ Error finding user by ID:", findError);
            }
        }
        
        if (!user && firebaseUID) {
            console.log("👤 Searching by firebaseUID:", firebaseUID);
            try {
                user = await User.findOne({ firebaseUID });
                console.log("👤 User found by firebaseUID:", user ? "Yes" : "No");
                if (user) createdById = user._id;
            } catch (findError) {
                console.error("❌ Error finding user by firebaseUID:", findError);
            }
            
            try {
                // DEBUG: Check all users in the database
                const allUsers = await User.find({});
                console.log("📋 All users in database:", JSON.stringify(allUsers.map(u => ({
                    _id: u._id,
                    firebaseUID: u.firebaseUID,
                    name: u.name,
                    email: u.email
                })), null, 2));
            } catch (error) {
                console.error("❌ Error listing users:", error);
            }
        }

        // Create a dummy user if none found
        if (!user && firebaseUID && organizer) {
            console.log("👤 Creating new user with Firebase UID:", firebaseUID);
            // Create a new user with the Firebase UID
            try {
                user = new User({
                    firebaseUID,
                    name: organizer || "Unknown User",
                    email: `${firebaseUID}@placeholder.com`, // Placeholder email
                    role: createdByRole?.toLowerCase() || "alumni" // Default to alumni
                });
                await user.save();
                console.log("✅ Created new user:", user);
            } catch (userError) {
                console.error("❌ Error creating user:", userError);
                return res.status(500).json({
                    message: "Error creating user",
                    error: userError.message
                });
            }
        }

        // FALLBACK: If we still don't have a valid user, create the event with a placeholder
        if (!user) {
            console.warn("⚠️ No user found - creating event with placeholder user reference");
            // Use a dummy ObjectId for the event creation
            createdById = new mongoose.Types.ObjectId();
        }

        // 📌 Step 2: Create the event
        const newEvent = new Event({
            title,
            description,
            date,
            time,
            location,
            organizer,
            createdBy: createdById || new mongoose.Types.ObjectId(), // Use placeholder if no user found
            createdAt: new Date(),
            registeredUsers: [],
            createdByRole: createdByRole || 'Alumni' // Default to Alumni if not specified
        });

        console.log("📄 Event to be saved:", JSON.stringify(newEvent, null, 2));

        // 💾 Step 3: Save the event
        await newEvent.save();
        console.log("✅ Event created:", newEvent._id);

        // 🔄 Step 4: Return the populated event
        const populatedEvent = await Event.findById(newEvent._id)
            .populate("registeredUsers.userId", "name email")
            .populate("createdBy", "name email");

        res.status(201).json({
            message: "Event created successfully",
            event: populatedEvent
        });

    } catch (error) {
        console.error("❌ Error creating event:", error);
        console.error("❌ Error stack:", error.stack);
        
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            console.error("❌ Validation error details:", JSON.stringify(error.errors, null, 2));
            return res.status(400).json({
                message: "Validation error",
                errors: Object.values(error.errors).map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        // Handle other types of errors
        res.status(500).json({ 
            message: "Server error", 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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
            (r) => r.userId && r.userId.toString() === user._id.toString()
        );

        if (alreadyRegistered) {
            console.log("⚠️ User already registered");
            return res.status(400).json({ message: "User already registered for this event" });
        }

        // 🎟 Step 5: Register the user
        event.registeredUsers.push({ userId: user._id });
        await event.save();

        // 🔄 Step 6: Get updated event and manually populate
        const updatedEvent = await Event.findById(eventId);
        const eventObj = updatedEvent.toObject();
        
        // Handle registered users population
        if (eventObj.registeredUsers && eventObj.registeredUsers.length > 0) {
            const userIds = eventObj.registeredUsers
                .map(reg => reg.userId)
                .filter(id => mongoose.Types.ObjectId.isValid(id));
            
            if (userIds.length > 0) {
                const users = await User.find({ _id: { $in: userIds } }).select("name email");
                
                eventObj.registeredUsers = eventObj.registeredUsers.map(reg => {
                    const user = users.find(u => u._id.toString() === reg.userId.toString());
                    return {
                        userId: user || reg.userId
                    };
                });
            }
        }
        
        // Handle createdBy population
        if (eventObj.createdBy) {
            let creator = null;
            
            // Try to find by MongoDB ID
            if (mongoose.Types.ObjectId.isValid(eventObj.createdBy)) {
                creator = await User.findById(eventObj.createdBy).select("name email");
            }
            
            // If not found and it's a string (likely Firebase UID), try to find by Firebase UID
            if (!creator && typeof eventObj.createdBy === 'string') {
                creator = await User.findOne({ firebaseUID: eventObj.createdBy }).select("name email");
            }
            
            if (creator) {
                eventObj.createdBy = creator;
            }
        }

        console.log("✅ Registration successful for:", user.name);
        res.status(200).json({ 
            message: "Registration successful",
            event: eventObj
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
        
        // Try to find the user by Firebase UID
        const user = await User.findOne({ firebaseUID: userId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find events without population
        const eventsRaw = await Event.find({
            "registeredUsers.userId": user._id
        });

        // Manually populate the events
        const populatedEvents = await Promise.all(eventsRaw.map(async (event) => {
            const eventObj = event.toObject();
            
            // Handle registered users population
            if (eventObj.registeredUsers && eventObj.registeredUsers.length > 0) {
                const userIds = eventObj.registeredUsers
                    .map(reg => reg.userId)
                    .filter(id => mongoose.Types.ObjectId.isValid(id));
                
                if (userIds.length > 0) {
                    const users = await User.find({ _id: { $in: userIds } }).select("name email");
                    
                    eventObj.registeredUsers = eventObj.registeredUsers.map(reg => {
                        const user = users.find(u => u._id.toString() === reg.userId.toString());
                        return {
                            userId: user || reg.userId
                        };
                    });
                }
            }
            
            // Handle createdBy population
            if (eventObj.createdBy) {
                let creator = null;
                
                // Try to find by MongoDB ID
                if (mongoose.Types.ObjectId.isValid(eventObj.createdBy)) {
                    creator = await User.findById(eventObj.createdBy).select("name email");
                }
                
                // If not found and it's a string (likely Firebase UID), try to find by Firebase UID
                if (!creator && typeof eventObj.createdBy === 'string') {
                    creator = await User.findOne({ firebaseUID: eventObj.createdBy }).select("name email");
                }
                
                if (creator) {
                    eventObj.createdBy = creator;
                }
            }
            
            return eventObj;
        }));

        console.log(`Found ${populatedEvents.length} enrolled events for user`);
        res.json(populatedEvents);
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
        const createdEventsRaw = await Event.find({ createdBy: user._id });
        const registeredEventsRaw = await Event.find({ "registeredUsers.userId": user._id });

        // Manually populate the events
        const populateEvent = async (event) => {
            const eventObj = event.toObject();
            
            // Handle registered users population
            if (eventObj.registeredUsers && eventObj.registeredUsers.length > 0) {
                const userIds = eventObj.registeredUsers
                    .map(reg => reg.userId)
                    .filter(id => mongoose.Types.ObjectId.isValid(id));
                
                if (userIds.length > 0) {
                    const users = await User.find({ _id: { $in: userIds } }).select("name email");
                    
                    eventObj.registeredUsers = eventObj.registeredUsers.map(reg => {
                        const user = users.find(u => u._id.toString() === reg.userId.toString());
                        return {
                            userId: user || reg.userId
                        };
                    });
                }
            }
            
            // Handle createdBy population
            if (eventObj.createdBy) {
                let creator = null;
                
                // Try to find by MongoDB ID
                if (mongoose.Types.ObjectId.isValid(eventObj.createdBy)) {
                    creator = await User.findById(eventObj.createdBy).select("name email");
                }
                
                // If not found and it's a string (likely Firebase UID), try to find by Firebase UID
                if (!creator && typeof eventObj.createdBy === 'string') {
                    creator = await User.findOne({ firebaseUID: eventObj.createdBy }).select("name email");
                }
                
                if (creator) {
                    eventObj.createdBy = creator;
                }
            }
            
            return eventObj;
        };

        // Process all events with population
        const createdEvents = await Promise.all(createdEventsRaw.map(populateEvent));
        const registeredEvents = await Promise.all(registeredEventsRaw.map(populateEvent));

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

// 📌 Special endpoint for Firebase users that completely avoids ObjectId casting issues
router.get("/firebase", async (req, res) => {
    try {
        console.log("📱 Firebase-specific events endpoint called");
        
        // Simply return raw events with minimal processing
        const events = await Event.find().lean();
        
        // Add placeholder data for frontend compatibility
        const safeEvents = events.map(event => ({
            ...event,
            // Ensure these fields exist even if null/undefined
            registeredUsers: event.registeredUsers || [],
            createdBy: event.createdBy || null,
            organizer: event.organizer || "Unknown"
        }));
        
        console.log(`📋 Found ${safeEvents.length} events for Firebase endpoint`);
        res.status(200).json(safeEvents);
    } catch (error) {
        console.error("❌ Error in Firebase events endpoint:", error);
        res.status(500).json({ 
            message: "Server error in Firebase events endpoint", 
            error: error.message 
        });
    }
});

// 📌 Delete an event (for teachers and alumni only)
router.delete("/:eventId", async (req, res) => {
    try {
        const { eventId } = req.params;
        const { firebaseUID, role } = req.query;

        console.log("🗑️ Delete event request:", { eventId, firebaseUID, role });

        // Validate event ID format
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            console.error("❌ Invalid event ID format:", eventId);
            return res.status(400).json({ message: "Invalid event ID format" });
        }

        // Find the event
        const event = await Event.findById(eventId);
        if (!event) {
            console.error("❌ Event not found:", eventId);
            return res.status(404).json({ message: "Event not found" });
        }

        // Find the user
        let user = null;
        if (firebaseUID) {
            user = await User.findOne({ firebaseUID });
        }

        if (!user) {
            console.error("❌ User not found for delete request");
            return res.status(403).json({ message: "Unauthorized: User not found" });
        }

        // Check if user role is allowed to delete events
        const allowedRoles = ["teacher", "alumni", "admin"];
        if (!allowedRoles.includes(role?.toLowerCase())) {
            console.error("❌ Unauthorized role for delete:", role);
            return res.status(403).json({ message: "Unauthorized: Only teachers and alumni can delete events" });
        }

        // Check if user created this event or is an admin
        const isAdmin = role?.toLowerCase() === "admin";
        const isCreator = event.createdBy && 
                         ((user._id.toString() === event.createdBy.toString()) || 
                          (user.firebaseUID === event.createdBy));
                          
        if (!isCreator && !isAdmin) {
            console.error("❌ User did not create this event:", { userId: user._id, eventCreator: event.createdBy });
            return res.status(403).json({ message: "Unauthorized: You can only delete events you created" });
        }

        // Delete the event
        await Event.findByIdAndDelete(eventId);
        console.log("✅ Event deleted successfully:", eventId);
        
        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting event:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
