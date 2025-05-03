const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const admin = require('./config/firebase-admin'); // Import Firebase Admin

// Import models before routes
require("./models/user");
require("./models/Event");
require("./models/Job");
require("./models/Mentorship");
require("./models/JobApplication");
require("./models/MentorshipApplication");
require("./models/EventRegistration");
// Message model removed
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
// Chat routes removed
const courseRoutes = require('./routes/coursesNew');
const courseApplicationRoutes = require('./routes/courseApplications');
// Firebase notification routes removed
const announcementRoutes = require('./routes/announcementRoutes');
const activityRoutes = require('./routes/activityRoutes');
const materialsRoutes = require('./routes/materialsRoutes');

const app = express();
const PORT = 5000; // Use port 5000 explicitly
const HOST = "0.0.0.0";
const MONGO_URI = process.env.MONGO_URI;

// CORS Configuration with all allowed origins
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',  // Added for development on alternate port
    'http://localhost:3002',  // Added for potential future port changes
    'https://alumni-networking.vercel.app',
    'https://alumni-networking-89f98.web.app',
    'https://alumni-networking-89f98.firebaseapp.com',
    'https://alumni-networking.onrender.com',
    'https://alumni-networking-frontend.vercel.app'
];

// CORS Configuration with more detailed logging
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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Accept'],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400 // 24 hours
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add a redirect for old file URLs to the new API endpoint
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  console.log(`Redirecting old file URL: /uploads/${filename} to API endpoint`);

  // Extract the fileId from the filename if possible
  const fileIdMatch = filename.match(/(\d+)-\d+\.\w+$/);
  if (fileIdMatch && fileIdMatch[1]) {
    const possibleFileId = fileIdMatch[1];
    res.redirect(`/api/materials/file/${possibleFileId}`);
  } else {
    // If we can't extract a fileId, just return a 404 with helpful message
    res.status(404).json({
      success: false,
      message: 'File not found. Files are now stored in the database and must be accessed through the API.',
      suggestedEndpoint: '/api/materials/file/:fileId'
    });
  }
});

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
// Chat routes removed
app.use('/api/courses', courseRoutes);
app.use('/api/course-applications', courseApplicationRoutes);
// Firebase notification routes removed
app.use('/api/activities', activityRoutes);
app.use('/api/materials', materialsRoutes);
// Register announcement routes
app.use('/', announcementRoutes);
// Log the registered routes
console.log('Registered announcement routes:');
announcementRoutes.stack.forEach(r => {
  if (r.route && r.route.path) {
    console.log(`${Object.keys(r.route.methods)[0].toUpperCase()} ${r.route.path}`);
  }
});

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

// Test CORS endpoint with detailed headers
app.get("/api/test-cors", (req, res) => {
    // Log all request headers for debugging
    console.log('🔍 CORS Test - Request headers:', req.headers);

    // Set explicit CORS headers for this endpoint
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');

    // Return detailed information about the request
    res.status(200).json({
        status: "ok",
        message: "CORS test successful!",
        timestamp: new Date().toISOString(),
        requestInfo: {
            origin: req.headers.origin || 'No origin header',
            referer: req.headers.referer || 'No referer header',
            userAgent: req.headers['user-agent'] || 'No user-agent header'
        },
        corsInfo: {
            allowedOrigins: allowedOrigins,
            responseHeaders: {
                'Access-Control-Allow-Origin': res.getHeader('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Credentials': res.getHeader('Access-Control-Allow-Credentials'),
                'Access-Control-Allow-Methods': res.getHeader('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': res.getHeader('Access-Control-Allow-Headers')
            }
        }
    });
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
