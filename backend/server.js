const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// ✅ Import models before routes
require("./models/user");
require("./models/Event");

const eventRoutes = require("./routes/eventRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 5000; // Use the port from environment variables or default to 5000
console.log(`Server will run on port: ${PORT}`);

const HOST = "0.0.0.0";
const MONGO_URI = process.env.MONGO_URI;

// ✅ CORS Configuration
app.use((req, res, next) => {
    const allowedOrigins = [
        'http://localhost:3000',
        'https://alumni-networking.vercel.app',
        'https://alumni-networking-89f98.web.app',
        'https://alumni-networking-89f98.firebaseapp.com'
    ];

    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    next();
});

app.use(express.json());

// ✅ Connect to MongoDB
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

// ✅ Import & Use Routes
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);

// 🏠 Default route
app.get("/", (req, res) => {
    res.send("🎉 Welcome to the Alumni Networking API!");
});

// ✅ Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// ✅ List Available Routes
const expressListRoutes = require("express-list-routes");
console.log("\n✅ Available Routes:");
expressListRoutes(app);
