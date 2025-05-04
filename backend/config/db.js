const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "your_mongodb_connection_string";

// Optimized MongoDB connection options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // Connection pool size
  maxPoolSize: 10,
  // Keep connections alive
  keepAlive: true,
  keepAliveInitialDelay: 300000, // 5 minutes
  // Connection timeout
  connectTimeoutMS: 10000, // 10 seconds
  // Socket timeout
  socketTimeoutMS: 45000, // 45 seconds
  // Server selection timeout
  serverSelectionTimeoutMS: 30000, // 30 seconds
  // Heartbeat frequency
  heartbeatFrequencyMS: 10000, // 10 seconds
  // Retry connection
  retryWrites: true,
  // Read preference
  readPreference: "primaryPreferred"
};

// Connect to MongoDB with optimized options
mongoose.connect(MONGO_URI, mongooseOptions);

const db = mongoose.connection;

// Error handling
db.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
  // Try to reconnect
  setTimeout(() => {
    console.log("🔄 Attempting to reconnect to MongoDB...");
    mongoose.connect(MONGO_URI, mongooseOptions);
  }, 5000); // Wait 5 seconds before reconnecting
});

// Connection success
db.once("open", () => {
  console.log("✅ Connected to MongoDB Atlas");
  console.log("Mongoose Connection State:", mongoose.connection.readyState);
  console.log("MongoDB Connection Pool Size:", mongooseOptions.maxPoolSize);
});

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

module.exports = db;
