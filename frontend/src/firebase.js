// Firebase configuration
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Get Firebase config from environment variables with fallbacks
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyACs1oe68Hi_KhBKxQRzEpYUUCKqZqQJvE",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "alumni-networking-89f98.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "alumni-networking-89f98",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "alumni-networking-89f98.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "396019340055",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:396019340055:web:d21b4852bc8bd78c57dd52"
};

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };