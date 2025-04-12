const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || 'mongodb+srv://uideveloperfolder:zDuDBXF4IlNLn0aT@cluster0.1fmupmt.mongodb.net/dev?retryWrites=true&w=majority';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    const db = mongoose.connection.db;
    
    // Query the jobapplications collection directly
    const jobApplications = await db.collection('jobapplications').find({}).toArray();
    console.log('Total job applications found:', jobApplications.length);
    
    // Print all job applications
    jobApplications.forEach((app, index) => {
      console.log(`\nJob Application ${index + 1}:`);
      console.log(`ID: ${app._id}`);
      console.log(`User ID: ${app.userId}`);
      console.log(`Job ID: ${app.jobId}`);
      console.log(`Name: ${app.name}`);
      console.log(`Status: ${app.status}`);
      console.log(`Applied At: ${app.appliedAt}`);
    });
    
    // Check for specific user ID
    const userId = '4EOWySj0hHfLOCWFxi3JeJYsqTj2';
    const userApps = await db.collection('jobapplications').find({ userId }).toArray();
    console.log(`\nApplications for user ${userId}: ${userApps.length}`);
    
    userApps.forEach((app, index) => {
      console.log(`\nUser Job Application ${index + 1}:`);
      console.log(`ID: ${app._id}`);
      console.log(`Job ID: ${app.jobId}`);
      console.log(`Skills: ${app.skills}`);
      console.log(`Status: ${app.status}`);
    });
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  }); 