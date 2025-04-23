// Use Firebase Admin SDK instead of client SDK
const admin = require('firebase-admin');
require('dotenv').config();

// Check if Firebase Admin is already initialized
let app;
let db;

try {
  // Try to get the existing app
  app = admin.app();
  console.log("Using existing Firebase Admin app");
} catch (error) {
  // Initialize Firebase Admin SDK
  try {
    console.log("Initializing Firebase Admin SDK...");

    // Check if we have service account credentials
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // Use service account credentials from environment variable
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      // Use application default credentials
      app = admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID
      });
    }

    console.log("Firebase Admin SDK initialized successfully");
  } catch (initError) {
    console.error("Error initializing Firebase Admin SDK:", initError);
    // Create a dummy app
    app = null;
  }
}

// Get Firestore instance
if (app) {
  try {
    db = admin.firestore();
    console.log("Firestore initialized successfully");
  } catch (dbError) {
    console.error("Error initializing Firestore:", dbError);
    db = null;
  }
}

// If db is null, create a dummy db object to prevent crashes
if (!db) {
  console.warn("Using dummy Firestore implementation");
  db = {
    collection: () => ({
      doc: () => ({
        get: async () => ({ exists: () => false, data: () => ({}) }),
        set: async () => ({}),
        update: async () => ({})
      }),
      add: async () => ({}),
      where: () => ({
        get: async () => ({ docs: [] })
      })
    })
  };
}

module.exports = { app, db };