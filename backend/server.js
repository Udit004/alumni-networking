const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const eventRoutes = require("./routes/eventRoutes");

const app = express();  
const PORT = 5000;
const HOST = "0.0.0.0";

// ✅ Allow CORS from all origins
app.use(cors());
app.use(express.json()); 

const MONGO_URI = process.env.MONGO_URI;

// ✅ Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Use event routes
app.use("/api/events", eventRoutes);

// 🏠 Default route
app.get("/", (req, res) => {
    res.send("🎉 Welcome to the Alumni Networking API!");
});

// ✅ Listen on 0.0.0.0 to allow external access
app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`🌍 Access it from other devices via: http://YOUR_LOCAL_IP:${PORT}`);
});

// ✅ MongoDB connection event
mongoose.connection.on("connected", () => {
    console.log("✅ Connected to MongoDB Atlas:", mongoose.connection.name);
});

// const cors = require("cors");

app.use(cors({
    origin: "*", // Allow all origins (for testing)
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

