const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
require('dotenv').config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Debug log to verify config values
console.log("Firebase Config (keys only):", Object.keys(firebaseConfig));
console.log("Firebase Project ID:", firebaseConfig.projectId);
console.log("Firebase API Key Available:", !!firebaseConfig.apiKey);

// Initialize Firebase and Firestore
try {
  console.log("Initializing Firebase App and Firestore...");
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  console.log("Firebase and Firestore initialized successfully");
  
  module.exports = { app, db };
} catch (error) {
  console.error("Error initializing Firebase:", error);
  // Create a dummy db object to prevent crashes
  const dummyDb = {
    collection: () => ({
      doc: () => ({
        get: async () => ({}),
        set: async () => ({}),
        update: async () => ({})
      }),
      add: async () => ({})
    })
  };
  module.exports = { app: null, db: dummyDb };
} 