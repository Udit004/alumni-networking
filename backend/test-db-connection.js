require('dotenv').config();
const mongoose = require('mongoose');

async function testMongoConnection() {
  console.log('=== MongoDB Connection Test ===');
  console.log('MongoDB URI:', process.env.MONGO_URI ? 'URI exists (hidden)' : 'URI not found');
  
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB successfully!');
    
    // Get connection and test a collection
    const db = mongoose.connection.db;
    
    try {
      // List all collections
      const collections = await db.listCollections().toArray();
      console.log('Collections in the database:');
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
      
      // Test direct insert into a test collection
      const testCollection = db.collection('test_collection');
      
      const testDoc = {
        name: 'Test User',
        timestamp: new Date(),
        message: 'This is a test document to verify direct MongoDB access'
      };
      
      const insertResult = await testCollection.insertOne(testDoc);
      console.log('✅ Test document inserted with ID:', insertResult.insertedId);
      console.log('Insert result:', insertResult);
      
      // Clean up by removing the test document
      const deleteResult = await testCollection.deleteOne({ _id: insertResult.insertedId });
      console.log('✅ Test document deleted, result:', deleteResult);
      
      // Test direct insert into mentorshipapplications
      const mentorshipAppCollection = db.collection('mentorshipapplications');
      
      const testApplication = {
        mentorshipId: 'test-mentorship-id',
        userId: 'test-user-id',
        name: 'Test User Direct',
        email: 'test@example.com',
        phone: '123-456-7890',
        currentYear: '3rd Year',
        program: 'Computer Science',
        skills: ['JavaScript', 'React'],
        experience: 'Test experience',
        whyInterested: 'Test interest reason',
        additionalInfo: 'Test additional info',
        status: 'pending',
        appliedAt: new Date()
      };
      
      // Try inserting the test application
      const appInsertResult = await mentorshipAppCollection.insertOne(testApplication);
      console.log('✅ Test mentorship application inserted with ID:', appInsertResult.insertedId);
      console.log('Insert result:', appInsertResult);
      
      // Clean up
      const appDeleteResult = await mentorshipAppCollection.deleteOne({ _id: appInsertResult.insertedId });
      console.log('✅ Test mentorship application deleted, result:', appDeleteResult);
      
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError);
    } finally {
      // Close the connection
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
    }
  } catch (connectionError) {
    console.error('❌ MongoDB connection failed:', connectionError);
  }
}

// Run the test
testMongoConnection().catch(console.error); 