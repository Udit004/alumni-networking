const admin = require('firebase-admin');
require('dotenv').config();

let firebaseConfig;

try {
  // First, try to use environment variables (for production)
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    console.log("🔥 Initializing Firebase Admin with environment variables");
    console.log("🔑 Project ID:", process.env.FIREBASE_PROJECT_ID);
    console.log("📧 Client Email:", process.env.FIREBASE_CLIENT_EMAIL);
    console.log("🔐 Private Key length:", process.env.FIREBASE_PRIVATE_KEY.length);

    // Make sure private key is properly formatted
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

    firebaseConfig = {
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: privateKey,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
      })
    };
  }
  // If no environment variables, try to load from local file (for development)
  else {
    console.log("🔥 Initializing Firebase Admin with service account file");
    try {
      const serviceAccount = require('./serviceAccountKey.json');
      console.log("✅ Service account file loaded successfully");
      firebaseConfig = {
        credential: admin.credential.cert(serviceAccount)
      };
    } catch (fileError) {
      console.error("❌ Error loading service account file:", fileError.message);
      throw new Error("Failed to load Firebase credentials from file");
    }
  }

  // Initialize the app with the configured credentials
  admin.initializeApp(firebaseConfig);
  console.log("✅ Firebase Admin SDK initialized successfully");
} catch (error) {
  console.error("❌ Error initializing Firebase Admin SDK:", error);
  console.error("💥 Stack trace:", error.stack);
}

module.exports = admin;