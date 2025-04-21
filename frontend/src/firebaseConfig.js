import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Hardcoded failover config values from .env in case environment variables aren't loading properly
const API_KEY = process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyACs1oe68Hi_KhBKxQRzEpYUUCKqZqQJvE';
const AUTH_DOMAIN = process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'alumni-networking-89f98.firebaseapp.com';
const PROJECT_ID = process.env.REACT_APP_FIREBASE_PROJECT_ID || 'alumni-networking-89f98';
const STORAGE_BUCKET = process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'alumni-networking-89f98.firebasestorage.app';
const MESSAGING_SENDER_ID = process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '396019340055';
const APP_ID = process.env.REACT_APP_FIREBASE_APP_ID || '1:396019340055:web:d21b4852bc8bd78c57dd52';

// Use the values from above to ensure we always have values
const firebaseConfig = {
    apiKey: API_KEY,
    authDomain: AUTH_DOMAIN,
    projectId: PROJECT_ID,
    storageBucket: STORAGE_BUCKET,
    messagingSenderId: MESSAGING_SENDER_ID,
    appId: APP_ID,
};

console.log("Firebase Frontend Config:", {
    projectId: firebaseConfig.projectId,
    hasApiKey: !!firebaseConfig.apiKey,
    hasAuthDomain: !!firebaseConfig.authDomain
});

// Initialize Firebase
let app, auth, db;

try {
    console.log("Initializing Firebase in frontend...");
    app = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully in frontend");
    
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Detect if we're in development
    if (process.env.NODE_ENV === 'development' && window.location.hostname === 'localhost') {
        console.log('Running in development mode');
    }
} catch (error) {
    console.error("Error initializing Firebase in frontend:", error);
    // Create dummy objects to prevent crashes
    app = {};
    auth = { 
        currentUser: null,
        onAuthStateChanged: () => {},
        signInWithEmailAndPassword: () => Promise.reject(new Error("Firebase not initialized")),
        createUserWithEmailAndPassword: () => Promise.reject(new Error("Firebase not initialized")),
        signOut: () => Promise.reject(new Error("Firebase not initialized"))
    };
    db = {
        collection: () => ({})
    };
}

// Export the configured instances
export { auth, db };
export default app;
