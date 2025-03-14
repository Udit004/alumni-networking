const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "your_mongodb_connection_string";

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "❌ MongoDB connection error:"));
db.once("open", () => {
  console.log("✅ Connected to MongoDB Atlas");
  console.log("Mongoose Connection State:", mongoose.connection.readyState); // ✅ Debugging step
});

module.exports = db;
