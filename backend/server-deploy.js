const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Set NODE_ENV if not already set
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
console.log(`🌍 Running in ${process.env.NODE_ENV} mode`);

// Import Firebase Admin after setting NODE_ENV
const admin = require('./config/firebase-admin');
const path = require('path');

// Import models before routes
require("./models/user");
require("./models/Event");
require("./models/Job");
require("./models/Mentorship");
require("./models/JobApplication");
require("./models/MentorshipApplication");
require("./models/EventRegistration");
require("./models/Course");
require("./models/CourseApplication");
require("./models/Announcement");
require("./models/Activity");

const eventRoutes = require("./routes/eventRoutes");
const userRoutes = require("./routes/userRoutes");
const contactRoutes = require('./routes/contactRoutes');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobs');
const mentorshipRoutes = require('./routes/mentorships');
const jobApplicationRoutes = require('./routes/jobApplicationRoutes');
const mentorshipApplicationRoutes = require('./routes/mentorshipApplicationRoutes');
const courseRoutes = require('./routes/coursesNew');
const courseApplicationRoutes = require('./routes/courseApplications');
const firestoreNotificationRoutes = require('./routes/firestoreNotifications');
const announcementRoutes = require('./routes/announcementRoutes');
const activityRoutes = require('./routes/activityRoutes');
const materialsRoutes = require('./routes/materialsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/alumni-networking";

// CORS Configuration with all allowed origins
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://alumni-networking.vercel.app',
    'https://alumni-networking-89f98.web.app',
    'https://alumni-networking-89f98.firebaseapp.com',
    'https://alumni-networking.onrender.com',
    'https://alumni-networking-frontend.vercel.app'
];

// CORS Configuration
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps, curl requests, or requests from the same origin)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        
        // For debugging - log blocked origins
        console.log('Blocked origin:', origin);
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use('/api/courses', courseRoutes);
app.use('/api/course-applications', courseApplicationRoutes);
app.use('/api/notifications', firestoreNotificationRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/', announcementRoutes);

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

// Test CORS endpoint
app.get("/api/test-cors", (req, res) => {
    res.status(200).json({ 
        status: "ok", 
        message: "CORS test successful!", 
        timestamp: new Date().toISOString(),
        origin: req.headers.origin || 'No origin header'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("✅ Connected to MongoDB at:", MONGO_URI);
        app.listen(PORT, HOST, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
        console.log("💡 TIP: Make sure you have MongoDB installed locally or provide a valid MONGO_URI in .env file");
        process.exit(1);
    });
