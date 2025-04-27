// Override MongoDB connection to use local MongoDB
process.env.MONGO_URI = 'mongodb://localhost:27017/alumni';

// Load the server
require('./server'); 