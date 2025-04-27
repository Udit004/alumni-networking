// Set the MongoDB URI environment variable before requiring the server
process.env.MONGO_URI = 'mongodb://localhost:27017/alumni';

// Start the server
require('./server.js'); 