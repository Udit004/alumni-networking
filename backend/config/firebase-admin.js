const admin = require('firebase-admin');
require('dotenv').config();

let firebaseConfig;

try {
  // First, try to use environment variables (for production)
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    console.log("Initializing Firebase Admin with environment variables");
    
    firebaseConfig = {
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
      })
    };
  } 
  // If no environment variables, try to load from local file (for development)
  else {
    console.log("Initializing Firebase Admin with service account file");
    const serviceAccount = require('./serviceAccountKey.json');
    firebaseConfig = {
      credential: admin.credential.cert(serviceAccount)
    };
  }

  // Initialize the app with the configured credentials
  admin.initializeApp(firebaseConfig);
  console.log("Firebase Admin SDK initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error);
}

module.exports = admin; 