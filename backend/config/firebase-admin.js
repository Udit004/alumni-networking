const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create a more robust Firebase Admin initialization
let firebaseApp;
let isUsingMock = false;

// Define a mock admin object for development fallback
const createMockAdmin = () => {
  console.warn("Using mock Firebase Admin implementation for development");
  isUsingMock = true;

  return {
    auth: () => ({
      verifyIdToken: async (token) => ({
        uid: token ? token.substring(0, 20) : 'mock-user-id',
        email: 'mock@example.com',
        role: 'student'
      })
    }),
    firestore: () => ({
      collection: (collectionName) => ({
        doc: (docId) => ({
          get: async () => ({
            exists: false,
            id: docId,
            data: () => ({})
          }),
          set: async (data) => {
            console.log(`[MOCK] Setting document ${docId} in ${collectionName}:`, data);
            return {};
          },
          update: async (data) => {
            console.log(`[MOCK] Updating document ${docId} in ${collectionName}:`, data);
            return {};
          }
        }),
        add: async (data) => {
          const mockId = `mock-${Date.now()}`;
          console.log(`[MOCK] Adding document to ${collectionName}:`, data);
          return { id: mockId };
        },
        where: () => ({
          orderBy: () => ({
            limit: () => ({
              get: async () => ({
                empty: true,
                docs: [],
                forEach: (callback) => {}
              })
            })
          }),
          get: async () => ({
            empty: true,
            docs: [],
            forEach: (callback) => {}
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
};

// Try to initialize Firebase Admin
try {
  // Check if Firebase Admin is already initialized
  try {
    firebaseApp = admin.app();
    console.log("Using existing Firebase Admin app");
  } catch (appError) {
    console.log("No existing Firebase Admin app, initializing new one...");

    // Get the service account file path
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

    if (fs.existsSync(serviceAccountPath)) {
      try {
        // Load the service account file
        console.log("Using Firebase credentials from serviceAccountKey.json");
        const serviceAccount = require('./serviceAccountKey.json');

        // Initialize Firebase Admin with the service account and database URL
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
          storageBucket: `${serviceAccount.project_id}.appspot.com`
        });

        console.log("Firebase Admin SDK initialized successfully with service account");

        // Test Firestore connection with settings
        const db = admin.firestore();

        // Configure Firestore settings
        db.settings({
          ignoreUndefinedProperties: true,
          timestampsInSnapshots: true
        });

        console.log("Firestore instance created successfully with settings");
      } catch (certError) {
        console.error("Error initializing Firebase Admin with service account:", certError);

        // Try environment variables as fallback
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
          try {
            console.log("Using Firebase credentials from environment variables");

            // Initialize Firebase Admin with environment variables
            firebaseApp = admin.initializeApp({
              credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
              }),
              databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
              storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
            });

            console.log("Firebase Admin SDK initialized successfully with environment variables");
          } catch (envError) {
            console.error("Error initializing Firebase Admin with environment variables:", envError);

            // Use mock in development
            if (process.env.NODE_ENV === 'development') {
              console.warn("Falling back to mock Firebase Admin for development");
            } else {
              throw envError; // Re-throw in production
            }
          }
        } else {
          // Use mock in development
          if (process.env.NODE_ENV === 'development') {
            console.warn("No Firebase credentials found, using mock for development");
          } else {
            throw new Error("No Firebase credentials found. Please set environment variables or provide a service account file.");
          }
        }
      }
    } else {
      console.warn("No serviceAccountKey.json found");

      // Try environment variables
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        try {
          console.log("Using Firebase credentials from environment variables");

          // Initialize Firebase Admin with environment variables
          firebaseApp = admin.initializeApp({
            credential: admin.credential.cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            }),
            databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
            storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
          });

          console.log("Firebase Admin SDK initialized successfully with environment variables");
        } catch (envError) {
          console.error("Error initializing Firebase Admin with environment variables:", envError);

          // Use mock in development
          if (process.env.NODE_ENV === 'development') {
            console.warn("Falling back to mock Firebase Admin for development");
          } else {
            throw envError; // Re-throw in production
          }
        }
      } else {
        // Use mock in development
        if (process.env.NODE_ENV === 'development') {
          console.warn("No Firebase credentials found, using mock for development");
        } else {
          throw new Error("No Firebase credentials found. Please set environment variables or provide a service account file.");
        }
      }
    }
  }
} catch (error) {
  console.error("Error during Firebase Admin initialization:", error);

  // Use mock in development
  if (process.env.NODE_ENV === 'development') {
    console.warn("Error during Firebase Admin initialization, using mock for development");
  } else {
    throw error; // Re-throw in production
  }
}

// Export the appropriate admin object
if (!firebaseApp && process.env.NODE_ENV === 'development') {
  module.exports = createMockAdmin();
} else {
  // Add a helper method to check if we're using a mock
  admin.isMock = () => isUsingMock;
  module.exports = admin;
}