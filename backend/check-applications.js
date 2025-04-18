const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/alumni-networking';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Get the MongoDB connection directly
      const db = mongoose.connection.db;
      
      // Check for job applications
      const jobApplications = await db.collection('jobapplications').find({}).toArray();
      console.log(`Found ${jobApplications.length} job applications`);
      
      // Print details of each application
      jobApplications.forEach((app, index) => {
        console.log(`\nApplication ${index + 1}:`);
        console.log(`ID: ${app._id}`);
        console.log(`Job ID: ${app.jobId}`);
        console.log(`User ID: ${app.userId}`);
        console.log(`Name: ${app.name}`);
        console.log(`Email: ${app.email}`);
        console.log(`Status: ${app.status}`);
        console.log(`Applied At: ${app.appliedAt}`);
      });
      
      // Check for specific job ID
      const specificJobId = '67f7c12800974b02743f6da3'; // The Python job at Google
      console.log(`\nLooking for applications for job ID: ${specificJobId}`);
      
      // Try different formats of the job ID
      const jobIdAsString = specificJobId;
      const jobIdAsObjectId = new mongoose.Types.ObjectId(specificJobId);
      
      // Check with string format
      const appsByStringId = await db.collection('jobapplications').find({ jobId: jobIdAsString }).toArray();
      console.log(`Found ${appsByStringId.length} applications with jobId as string`);
      
      // Check with ObjectId format
      const appsByObjectId = await db.collection('jobapplications').find({ jobId: jobIdAsObjectId }).toArray();
      console.log(`Found ${appsByObjectId.length} applications with jobId as ObjectId`);
      
      // Check for applications by specific user
      const userId = 'e9AMLzvvdjhL28f534BsWqCixnN2';
      console.log(`\nLooking for applications by user ID: ${userId}`);
      const appsByUser = await db.collection('jobapplications').find({ userId }).toArray();
      console.log(`Found ${appsByUser.length} applications by user ${userId}`);
      
      // Close the connection
      mongoose.connection.close();
    } catch (error) {
      console.error('Error:', error);
      mongoose.connection.close();
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
