const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import models before routes
require("./models/user");
require("./models/Event");

const eventRoutes = require("./routes/eventRoutes");
const userRoutes = require("./routes/userRoutes");
const contactRoutes = require('./routes/contactRoutes');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobs');
const mentorshipRoutes = require('./routes/mentorships');
const jobApplicationRoutes = require('./routes/jobApplicationRoutes');
const mentorshipApplicationRoutes = require('./routes/mentorshipApplicationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";
const MONGO_URI = process.env.MONGO_URI;

// CORS Configuration with all allowed origins
const allowedOrigins = [
    'http://localhost:3000',
    'https://alumni-networking.vercel.app',
    'https://alumni-networking-89f98.web.app',
    'https://alumni-networking-89f98.firebaseapp.com',
    'https://alumni-networking.onrender.com'
];

// CORS Configuration
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            console.log('Blocked origin:', origin); // Debug log
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Middleware
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Routes
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/mentorships', mentorshipRoutes);
app.use('/api/job-applications', jobApplicationRoutes);
app.use('/api/mentorship-applications', mentorshipApplicationRoutes);

// Direct test endpoint for mentorship applications
app.post('/api/test-mentorship-application/:mentorshipId', async (req, res) => {
    try {
        console.log('Direct test endpoint accessed in server.js');
        console.log('Request body:', req.body);
        
        // Get the MongoDB connection directly
        const db = mongoose.connection.db;
        const collection = db.collection('mentorshipapplications');
        
        // Create application data with all required fields
        const applicationData = {
            mentorshipId: req.body.mentorshipId || req.params.mentorshipId,
            userId: req.body.userId || 'test-user-id',
            name: req.body.name || "Test User",
            email: req.body.email || "test@example.com",
            phone: req.body.phone || "123-456-7890",
            currentYear: req.body.currentYear || "3rd Year",
            program: req.body.program || req.body.currentYear || "Computer Science",
            skills: Array.isArray(req.body.skills) ? req.body.skills : ["JavaScript", "React"],
            experience: req.body.experience || "Test experience",
            whyInterested: req.body.whyInterested || "Test interest reason",
            additionalInfo: req.body.additionalInfo || "",
            status: "pending",
            appliedAt: new Date()
        };
        
        console.log('Using application data:', applicationData);
        
        // Insert directly into MongoDB
        const result = await collection.insertOne(applicationData);
        console.log('Direct MongoDB insert result:', result);
        
        if (result.acknowledged) {
            return res.status(201).json({
                success: true,
                message: 'Test application submitted successfully via direct endpoint',
                data: {
                    _id: result.insertedId,
                    ...applicationData
                }
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Failed to insert test application into database'
            });
        }
    } catch (error) {
        console.error('Error in direct test endpoint:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to submit test application',
            error: error.message
        });
    }
});

// Special Firebase events route that avoids ObjectId casting issues
app.get("/api/events-firebase", async (req, res) => {
    try {
        const Event = mongoose.model('Event');
        const events = await Event.find().lean();
        
        // Add placeholder data for frontend compatibility
        const safeEvents = events.map(event => ({
            ...event,
            registeredUsers: event.registeredUsers || [],
            createdBy: event.createdBy || null,
            organizer: event.organizer || "Unknown"
        }));
        
        console.log(`Found ${safeEvents.length} events for Firebase endpoint`);
        res.status(200).json(safeEvents);
    } catch (error) {
        console.error("Error in Firebase events endpoint:", error);
        res.status(500).json({ 
            message: "Server error in Firebase events endpoint", 
            error: error.message 
        });
    }
});

// Default route
app.get("/", (req, res) => {
    res.send("🎉 Welcome to the Alumni Networking API!");
});

// Health check endpoints
app.get("/healthcheck", (req, res) => {
    res.status(200).json({ status: "ok", message: "Backend is running" });
});

app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Backend is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("✅ Connected to MongoDB Atlas");
        app.listen(PORT, HOST, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
            // Log available routes
            console.log("\n✅ Available Routes:");
            const expressListRoutes = require("express-list-routes");
            expressListRoutes(app);
        });
    })
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    });
