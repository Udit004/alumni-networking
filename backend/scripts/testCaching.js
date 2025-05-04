/**
 * Script to test the caching service
 * Run with: node scripts/testCaching.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const cacheManager = require('../utils/cacheManager');
const { getCachedData, getCachedDocument } = require('../services/cachedDataService');

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/alumni-networking';

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10
}).then(() => {
  console.log('✅ Connected to MongoDB');
  runTests();
}).catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

// Function to run tests
async function runTests() {
  try {
    console.log('🧪 Testing caching service...');
    
    // Test 1: Basic cache operations
    console.log('\n📋 Test 1: Basic cache operations');
    
    // Set a value in cache
    cacheManager.set('test-key', { message: 'Hello, world!' });
    console.log('✅ Set value in cache');
    
    // Get the value from cache
    const cachedValue = cacheManager.get('test-key');
    console.log('📤 Retrieved value from cache:', cachedValue);
    
    // Invalidate the cache
    cacheManager.invalidate('test-key');
    console.log('🗑️ Invalidated cache');
    
    // Try to get the value again
    const invalidatedValue = cacheManager.get('test-key');
    console.log('📤 Retrieved value after invalidation:', invalidatedValue);
    
    // Test 2: Cache with MongoDB data
    console.log('\n📋 Test 2: Cache with MongoDB data');
    
    // Load a model
    require('../models/Job');
    const Job = mongoose.model('Job');
    
    // First query without cache
    console.time('Without cache');
    const jobsWithoutCache = await Job.find().limit(10).lean();
    console.timeEnd('Without cache');
    console.log(`📊 Found ${jobsWithoutCache.length} jobs without cache`);
    
    // Query with cache
    console.time('With cache - first call');
    const jobsWithCache1 = await getCachedData('Job', {}, { limit: 10 });
    console.timeEnd('With cache - first call');
    console.log(`📊 Found ${jobsWithCache1.length} jobs with cache (first call)`);
    
    // Query with cache again
    console.time('With cache - second call');
    const jobsWithCache2 = await getCachedData('Job', {}, { limit: 10 });
    console.timeEnd('With cache - second call');
    console.log(`📊 Found ${jobsWithCache2.length} jobs with cache (second call)`);
    
    // Test 3: Get a single document with cache
    console.log('\n📋 Test 3: Get a single document with cache');
    
    if (jobsWithoutCache.length > 0) {
      const jobId = jobsWithoutCache[0]._id;
      
      // First query without cache
      console.time('Get document without cache');
      const jobWithoutCache = await Job.findById(jobId).lean();
      console.timeEnd('Get document without cache');
      console.log('📄 Found job without cache:', jobWithoutCache ? jobWithoutCache.title : 'Not found');
      
      // Query with cache
      console.time('Get document with cache - first call');
      const jobWithCache1 = await getCachedDocument('Job', jobId);
      console.timeEnd('Get document with cache - first call');
      console.log('📄 Found job with cache (first call):', jobWithCache1 ? jobWithCache1.title : 'Not found');
      
      // Query with cache again
      console.time('Get document with cache - second call');
      const jobWithCache2 = await getCachedDocument('Job', jobId);
      console.timeEnd('Get document with cache - second call');
      console.log('📄 Found job with cache (second call):', jobWithCache2 ? jobWithCache2.title : 'Not found');
    }
    
    // Test 4: Cache stats
    console.log('\n📋 Test 4: Cache stats');
    const stats = cacheManager.getStats();
    console.log('📊 Cache stats:', stats);
    
    console.log('\n✅ All tests completed successfully');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('👋 MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error running tests:', err);
    process.exit(1);
  }
}
