const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Check if Firebase Admin is already initialized
let firebaseApp;

try {
  // Try to get the existing app
  firebaseApp = admin.app();
  console.log("Using existing Firebase Admin app");
} catch (error) {
  // Initialize Firebase Admin SDK
  try {
    console.log("Initializing Firebase Admin SDK...");

    let credential;

    // First, try to use environment variables (for production)
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      console.log("Using Firebase credentials from environment variables");

      credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
      });
    }
    // Next, try to load from local service account file
    else {
      const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

      if (fs.existsSync(serviceAccountPath)) {
        console.log("Using Firebase credentials from serviceAccountKey.json");
        const serviceAccount = require('./serviceAccountKey.json');
        credential = admin.credential.cert(serviceAccount);
      }
      // Finally, try to load from firebase-admin-sdk.json as a fallback
      else {
        const adminSdkPath = path.join(__dirname, 'firebase-admin-sdk.json');

        if (fs.existsSync(adminSdkPath)) {
          console.log("Using Firebase credentials from firebase-admin-sdk.json");
          const serviceAccount = require('./firebase-admin-sdk.json');
          credential = admin.credential.cert(serviceAccount);
        } else {
          throw new Error("No Firebase credentials found. Please set environment variables or provide a service account file.");
        }
      }
    }

    // Initialize the app with the configured credentials
    firebaseApp = admin.initializeApp({
      credential: credential
    });

    console.log("Firebase Admin SDK initialized successfully");

    // Test Firestore connection
    const db = admin.firestore();
    console.log("Firestore instance created successfully");
  } catch (initError) {
    console.error("Error initializing Firebase Admin SDK:", initError);

    // Create a dummy app for development to prevent crashes
    if (process.env.NODE_ENV === 'development') {
      console.warn("Creating mock Firebase Admin for development");
      // We'll export a mock object below
    } else {
      // In production, we should fail loudly
      throw initError;
    }
  }
}

// If we're in development and Firebase failed to initialize, create mock objects
if (!firebaseApp && process.env.NODE_ENV === 'development') {
  console.warn("Using mock Firebase Admin implementation for development");

  // Create a mock admin object with the necessary methods
  const mockAdmin = {
    auth: () => ({
      verifyIdToken: async (token) => ({
        uid: 'mock-user-id',
        email: 'mock@example.com',
        role: 'student'
      })
    }),
    firestore: () => ({
      collection: () => ({
        doc: () => ({
          get: async () => ({
            exists: false,
            data: () => ({})
          }),
          set: async () => ({}),
          update: async () => ({})
        }),
        add: async () => ({ id: 'mock-doc-id' }),
        where: () => ({
          orderBy: () => ({
            limit: () => ({
              get: async () => ({
                empty: true,
                docs: [],
                forEach: () => {}
              })
            })
          }),
          get: async () => ({
            empty: true,
            docs: [],
            forEach: () => {}
          })
        })
      }),
      batch: () => ({
        update: () => {},
        commit: async () => {}
      })
    }),
    FieldValue: {
      serverTimestamp: () => new Date(),
      arrayUnion: (...items) => items,
      arrayRemove: (...items) => items
    }
  };

  module.exports = mockAdmin;
} else {
  module.exports = admin;
}