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
    'https://your-production-domain.com' // Add your production domain here
];

// CORS Configuration
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
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

// Routes
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);

// Default route
app.get("/", (req, res) => {
    res.send("🎉 Welcome to the Alumni Networking API!");
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
        });
    })
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    });

// ✅ List Available Routes
const expressListRoutes = require("express-list-routes");
console.log("\n✅ Available Routes:");
expressListRoutes(app);
