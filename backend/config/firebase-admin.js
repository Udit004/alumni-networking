const admin = require('firebase-admin');
require('dotenv').config();

// Check if Firebase Admin is already initialized
let firebaseAdmin;

/**
 * Get the Firebase Admin instance, initializing it if necessary
 * @returns {admin.app.App} The Firebase Admin app instance
 */
function getFirebaseAdmin() {
  if (firebaseAdmin) {
    return firebaseAdmin;
  }

  try {
    // Check if Firebase Admin is already initialized
    try {
      firebaseAdmin = admin.app();
      console.log("✅ Using existing Firebase Admin app");
      return firebaseAdmin;
    } catch (appError) {
      // App doesn't exist yet, continue with initialization
      console.log("🔄 Firebase Admin app not initialized yet, creating new instance");
    }

    let firebaseConfig;

    // First, try to use environment variables (for production)
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      console.log("🔥 Initializing Firebase Admin with environment variables");
      console.log("🔑 Project ID:", process.env.FIREBASE_PROJECT_ID);
      console.log("📧 Client Email:", process.env.FIREBASE_CLIENT_EMAIL);
      console.log("🔐 Private Key available:", !!process.env.FIREBASE_PRIVATE_KEY);

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

        // Create a minimal config for development mode
        if (process.env.NODE_ENV === 'development') {
          console.log("⚠️ Development mode: Using minimal Firebase config");
          firebaseConfig = {
            projectId: 'alumni-networking-89f98'
          };
        } else {
          throw new Error("Failed to load Firebase credentials");
        }
      }
    }

    // Initialize the app with the configured credentials
    firebaseAdmin = admin.initializeApp(firebaseConfig);
    console.log("✅ Firebase Admin SDK initialized successfully");
    return firebaseAdmin;
  } catch (error) {
    console.error("❌ Error initializing Firebase Admin SDK:", error);
    console.error("💥 Stack trace:", error.stack);

    // In development mode, create a mock Firebase Admin
    if (process.env.NODE_ENV === 'development') {
      console.log("⚠️ Development mode: Creating mock Firebase Admin");
      return createMockFirebaseAdmin();
    }

    throw error;
  }
}

/**
 * Create a mock Firebase Admin for development
 * @returns {Object} A mock Firebase Admin object
 */
function createMockFirebaseAdmin() {
  console.log("🔧 Creating mock Firebase Admin for development");

  // Create a mock auth object
  const mockAuth = {
    verifyIdToken: async (token) => {
      console.log("🔑 Mock verifyIdToken called with token length:", token?.length || 0);

      // Return a mock decoded token
      return {
        uid: 'mock-user-id',
        email: 'mock@example.com',
        role: 'student',
        iss: 'https://securetoken.google.com/alumni-networking-89f98',
        aud: 'alumni-networking-89f98',
        auth_time: Math.floor(Date.now() / 1000),
        user_id: 'mock-user-id',
        sub: 'mock-user-id',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        email_verified: true,
        firebase: {
          identities: {
            email: ['mock@example.com']
          },
          sign_in_provider: 'password'
        }
      };
    }
  };

  // Return a mock Firebase Admin object
  return {
    auth: () => mockAuth
  };
}

// Export a proxy to ensure Firebase Admin is initialized when needed
module.exports = new Proxy({}, {
  get: function(target, prop) {
    const app = getFirebaseAdmin();

    // If the property is a function, bind it to the app
    if (typeof app[prop] === 'function') {
      return app[prop].bind(app);
    }

    // Otherwise, return the property
    return app[prop];
  }
});