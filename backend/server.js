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

// ✅ Middleware
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
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

// ✅ List Available Routes
const expressListRoutes = require("express-list-routes");
console.log("\n✅ Available Routes:");
expressListRoutes(app);
