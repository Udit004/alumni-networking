const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Connect to the in-memory database.
 */
module.exports.connect = async () => {
  try {
    // Always use in-memory MongoDB for development
    console.log('Using in-memory MongoDB for development');

    // Otherwise, use in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    console.log(`🧪 Using in-memory MongoDB at ${mongoUri}`);

    await mongoose.connect(mongoUri, {});
    console.log('✅ Connected to in-memory MongoDB');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    throw error;
  }
};

/**
 * Drop database, close the connection and stop mongod.
 */
module.exports.closeDatabase = async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('💤 MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
};

/**
 * Remove all data from collections but keep the collections.
 */
module.exports.clearDatabase = async () => {
  if (!mongoose.connection) {
    return;
  }

  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }

  console.log('🧹 Database cleared');
};
