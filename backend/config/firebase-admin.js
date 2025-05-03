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

    // Check if we're in a deployed environment (Render.com)
    const isDeployed = process.env.RENDER === 'true' || process.env.NODE_ENV === 'production';
    console.log(`🌐 Environment: ${isDeployed ? 'Production/Deployed' : 'Development/Local'}`);

    // Log all available environment variables for debugging (without values)
    console.log('📋 Available environment variables:');
    Object.keys(process.env).forEach(key => {
      if (key.includes('FIREBASE')) {
        console.log(`  - ${key}: ${key.includes('KEY') ? '[HIDDEN]' : 'Available'}`);
      }
    });

    // First, try to use environment variables (for production)
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      console.log("🔥 Initializing Firebase Admin with environment variables");
      console.log("🔑 Project ID:", process.env.FIREBASE_PROJECT_ID);
      console.log("📧 Client Email:", process.env.FIREBASE_CLIENT_EMAIL);
      console.log("🔐 Private Key available:", !!process.env.FIREBASE_PRIVATE_KEY);

      try {
        // Make sure private key is properly formatted
        // Handle different formats of the private key in environment variables
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;

        // If the key is a JSON string (common in some deployment platforms)
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
          privateKey = JSON.parse(privateKey);
        }

        // Replace literal \n with actual newlines
        privateKey = privateKey.replace(/\\n/g, '\n');

        console.log("🔑 Private Key format processed");

        // Create the credential
        const credential = admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: privateKey,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL
        });

        firebaseConfig = { credential };
        console.log("✅ Firebase Admin credential created successfully");
      } catch (certError) {
        console.error("❌ Error creating Firebase Admin credential:", certError);
        throw certError; // Re-throw to be caught by the outer try-catch
      }
    }
    // If no environment variables, try to load from local file (for development)
    else if (!isDeployed) {
      console.log("🔥 Initializing Firebase Admin with service account file");
      try {
        const serviceAccount = require('./serviceAccountKey.json');
        console.log("✅ Service account file loaded successfully");
        firebaseConfig = {
          credential: admin.credential.cert(serviceAccount)
        };
      } catch (fileError) {
        console.error("❌ Error loading service account file:", fileError.message);

        // Create a mock Firebase Admin for development
        console.log("⚠️ Development mode: Creating mock Firebase Admin");
        return createMockFirebaseAdmin();
      }
    }
    // If we're in production but don't have credentials, this is an error
    else {
      console.error("❌ No Firebase credentials available in production environment");
      console.log("⚠️ Creating mock Firebase Admin as fallback");
      return createMockFirebaseAdmin();
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
 * Create a mock Firebase Admin for development or as a fallback
 * @returns {Object} A mock Firebase Admin object
 */
function createMockFirebaseAdmin() {
  console.log("🔧 Creating mock Firebase Admin");

  // Create a mock auth object with more functionality
  const mockAuth = {
    verifyIdToken: async (token) => {
      console.log("🔑 Mock verifyIdToken called with token length:", token?.length || 0);

      // Extract user info from token if possible
      let uid = 'mock-user-id';
      let email = 'mock@example.com';
      let role = 'student';

      // If we have a real token, try to extract some basic info from it
      if (token && token.length > 100) {
        try {
          // JWT tokens have 3 parts separated by dots
          const parts = token.split('.');
          if (parts.length === 3) {
            // The middle part is the payload, base64 encoded
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

            // Extract user info if available
            uid = payload.user_id || payload.sub || payload.uid || uid;
            email = payload.email || email;
            role = payload.role || role;

            console.log(`🔍 Extracted info from token: uid=${uid}, email=${email}, role=${role}`);
          }
        } catch (error) {
          console.log("⚠️ Could not extract info from token:", error.message);
        }
      }

      // If we have a real token, try to extract the actual UID from it
      // This is a more reliable approach than using the first 10 characters
      if (token && token.length > 100) {
        try {
          // Try to extract the actual UID from the token
          // For Firebase tokens, the UID is often in the 'sub' or 'user_id' field
          // We'll try to extract it from the token payload

          // First, try to decode the token payload (middle part)
          const parts = token.split('.');
          if (parts.length === 3) {
            // The middle part is the payload, base64 encoded
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

            // Extract user info if available
            if (payload.user_id) {
              uid = payload.user_id;
              console.log(`🔑 Successfully extracted actual UID from token: ${uid}`);
            } else if (payload.sub) {
              uid = payload.sub;
              console.log(`🔑 Successfully extracted actual UID from token: ${uid}`);
            } else if (payload.uid) {
              uid = payload.uid;
              console.log(`🔑 Successfully extracted actual UID from token: ${uid}`);
            }
          }
        } catch (error) {
          console.log("⚠️ Could not extract UID from token:", error.message);

          // Fallback to using the first 10 characters as a mock UID
          if (token.startsWith('eyJ')) {
            uid = token.substring(0, 10);
            console.log(`⚠️ Using first 10 characters as mock UID: ${uid}`);
          }
        }
      }

      // Return a mock decoded token
      return {
        uid: uid,
        email: email,
        role: role,
        iss: 'https://securetoken.google.com/alumni-networking-89f98',
        aud: 'alumni-networking-89f98',
        auth_time: Math.floor(Date.now() / 1000),
        user_id: uid,
        sub: uid,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        email_verified: true,
        firebase: {
          identities: {
            email: [email]
          },
          sign_in_provider: 'password'
        }
      };
    },

    // Add more mock methods as needed
    getUser: async (uid) => {
      console.log("🔍 Mock getUser called with uid:", uid);
      return {
        uid: uid,
        email: `${uid}@example.com`,
        emailVerified: true,
        displayName: `User ${uid}`,
        photoURL: null,
        phoneNumber: null,
        disabled: false,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString()
        },
        customClaims: {
          role: 'student'
        },
        providerData: [
          {
            uid: `${uid}@example.com`,
            displayName: `User ${uid}`,
            email: `${uid}@example.com`,
            photoURL: null,
            providerId: 'password',
            phoneNumber: null
          }
        ],
        toJSON: () => ({
          uid: uid,
          email: `${uid}@example.com`,
          emailVerified: true,
          displayName: `User ${uid}`,
          photoURL: null,
          phoneNumber: null,
          disabled: false
        })
      };
    }
  };

  // Return a mock Firebase Admin object with more functionality
  return {
    auth: () => mockAuth,

    // Add more mock services as needed
    firestore: () => ({
      collection: (name) => ({
        doc: (id) => ({
          get: async () => ({
            exists: true,
            id: id,
            data: () => ({
              id: id,
              name: `Mock ${name} ${id}`,
              createdAt: new Date().toISOString()
            })
          }),
          set: async (data) => ({
            writeTime: new Date().toISOString()
          }),
          update: async (data) => ({
            writeTime: new Date().toISOString()
          }),
          delete: async () => ({
            writeTime: new Date().toISOString()
          })
        }),
        add: async (data) => ({
          id: `mock-${Date.now()}`,
          get: async () => ({
            exists: true,
            id: `mock-${Date.now()}`,
            data: () => data
          })
        })
      })
    })
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