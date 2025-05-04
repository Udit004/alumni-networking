const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { corsPreflightHandler } = require('./middleware/corsMiddleware');
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
    'http://localhost:3001',  // Added for development on alternate port
    'http://localhost:3002',  // Added for potential future port changes
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',  // Added for development on alternate port
    'http://127.0.0.1:3002',  // Added for potential future port changes
    'https://alumni-networking.vercel.app',
    'https://alumni-networking-89f98.web.app',
    'https://alumni-networking-89f98.firebaseapp.com',
    'https://alumni-networking.onrender.com',
    'https://alumni-networking-frontend.vercel.app'
];

// CORS Configuration with more detailed logging and improved headers
app.use(cors({
    origin: function(origin, callback) {
        console.log('🔍 Request origin:', origin || 'No origin');

        // Allow requests with no origin (like mobile apps, curl requests, or requests from the same origin)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            console.log('✅ Origin allowed:', origin || 'No origin');
            return callback(null, true);
        }

        // For debugging - log blocked origins
        console.log('❌ Blocked origin:', origin);
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Cache-Control',
        'Accept',
        'Origin',
        'Accept-Encoding',
        'Accept-Language',
        'Access-Control-Request-Headers',
        'Access-Control-Request-Method'
    ],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400 // 24 hours
}));

// Middleware
app.use(corsPreflightHandler); // Add CORS preflight handler
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

// Authentication test endpoint
app.get("/api/auth-test", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        console.log('🔍 Auth Test: Authorization header present:', !!authHeader);

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided',
                authHeader: authHeader ? 'Present but invalid format' : 'Missing'
            });
        }

        const token = authHeader.split(' ')[1];
        console.log('🔍 Auth Test: Token length:', token.length);
        console.log('🔍 Auth Test: Token first 10 chars:', token.substring(0, 10) + '...');

        try {
            // Verify the token
            const admin = require('./config/firebase-admin');
            const decodedToken = await admin.auth().verifyIdToken(token);

            return res.status(200).json({
                success: true,
                message: 'Token verified successfully',
                user: {
                    uid: decodedToken.uid,
                    email: decodedToken.email,
                    role: decodedToken.role || 'Not specified in token'
                },
                tokenInfo: {
                    issuer: decodedToken.iss,
                    audience: decodedToken.aud,
                    expiresAt: new Date(decodedToken.exp * 1000).toISOString(),
                    issuedAt: new Date(decodedToken.iat * 1000).toISOString(),
                    expiresIn: Math.floor((decodedToken.exp * 1000 - Date.now()) / 1000) + ' seconds'
                }
            });
        } catch (verifyError) {
            console.error('❌ Auth Test: Token verification failed:', verifyError.message);

            return res.status(401).json({
                success: false,
                message: 'Token verification failed',
                error: verifyError.message,
                tokenInfo: {
                    length: token.length,
                    firstChars: token.substring(0, 10) + '...'
                }
            });
        }
    } catch (error) {
        console.error('❌ Auth Test: Unexpected error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error in auth test',
            error: error.message
        });
    }
});

// Test CORS endpoint with detailed headers
app.get("/api/test-cors", (req, res) => {
    // Log all request headers for debugging
    console.log('🔍 CORS Test - Request headers:', req.headers);

    // Set explicit CORS headers for this endpoint
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Accept-Encoding, Accept-Language');

    // Return detailed information about the request
    res.status(200).json({
        status: "ok",
        message: "CORS test successful!",
        timestamp: new Date().toISOString(),
        requestInfo: {
            origin: req.headers.origin || 'No origin header',
            referer: req.headers.referer || 'No referer header',
            userAgent: req.headers['user-agent'] || 'No user-agent header',
            host: req.headers.host || 'No host header',
            method: req.method
        },
        corsInfo: {
            allowedOrigins: allowedOrigins,
            responseHeaders: {
                'Access-Control-Allow-Origin': res.getHeader('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Credentials': res.getHeader('Access-Control-Allow-Credentials'),
                'Access-Control-Allow-Methods': res.getHeader('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': res.getHeader('Access-Control-Allow-Headers')
            }
        },
        environment: {
            nodeEnv: process.env.NODE_ENV,
            isProduction: process.env.NODE_ENV === 'production',
            isRender: !!process.env.RENDER
        }
    });
});

// Simple CORS test endpoint that returns minimal data
app.get("/api/cors-check", (req, res) => {
    res.status(200).json({
        success: true,
        message: "CORS is working correctly",
        origin: req.headers.origin || 'No origin'
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
