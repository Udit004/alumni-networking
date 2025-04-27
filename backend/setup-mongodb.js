const { exec } = require('child_process');
const mongoose = require('mongoose');

// Function to check if MongoDB is running
function checkMongoDBRunning() {
  return new Promise((resolve, reject) => {
    console.log('Checking if MongoDB is running locally...');
    
    // Try to connect to local MongoDB
    mongoose.connect('mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    })
    .then(() => {
      console.log('✅ Local MongoDB is running!');
      mongoose.disconnect();
      resolve(true);
    })
    .catch(err => {
      console.log('❌ Failed to connect to local MongoDB');
      resolve(false);
    });
  });
}

// Function to check if MongoDB is installed
function checkMongoDBInstalled() {
  return new Promise((resolve, reject) => {
    console.log('Checking if MongoDB is installed...');
    
    exec('mongod --version', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ MongoDB is not installed or not in PATH');
        resolve(false);
        return;
      }
      
      console.log('✅ MongoDB is installed:');
      console.log(stdout.split('\n')[0]); // Just show the first line with version info
      resolve(true);
    });
  });
}

// Main function
async function main() {
  console.log('=== MongoDB Setup Check ===');
  
  const isMongoDBRunning = await checkMongoDBRunning();
  
  if (isMongoDBRunning) {
    console.log('\n✅ Your backend can now connect to the local MongoDB instance');
    console.log('🚀 Run "node server.js" to start your backend server');
    return;
  }
  
  const isMongoDBInstalled = await checkMongoDBInstalled();
  
  if (!isMongoDBInstalled) {
    console.log('\n📋 MongoDB Installation Instructions:');
    console.log('1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community');
    console.log('2. Follow the installation instructions for your operating system');
    console.log('3. Make sure to add MongoDB to your system PATH');
    console.log('\nAlternatively, you can use MongoDB Atlas:');
    console.log('1. Create a free account at https://www.mongodb.com/cloud/atlas/register');
    console.log('2. Set up a cluster and get your connection string');
    console.log('3. Create a .env file in the backend directory with:');
    console.log('   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/alumni-networking?retryWrites=true&w=majority');
  } else {
    console.log('\n📋 Start MongoDB Instructions:');
    console.log('1. Start MongoDB service by running:');
    console.log('   Windows: net start MongoDB (Run as Administrator)');
    console.log('   macOS/Linux: sudo systemctl start mongod');
    console.log('2. If that doesn\'t work, try:');
    console.log('   mongod --dbpath="C:\\data\\db" (Adjust path as needed)');
  }
  
  console.log('\n💡 After setting up MongoDB, run this script again to verify the connection');
}

main(); 