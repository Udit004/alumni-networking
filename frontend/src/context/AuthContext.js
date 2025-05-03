import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        console.log("✅ AuthContext: User logged in:", user);
        try {
          // Get user data from Firestore
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role);
            setUserData(userData);
            console.log("✅ AuthContext: User role fetched:", userData.role);
          } else {
            console.log("⚠️ AuthContext: No user document found in Firestore");

            // In production, don't set a default role
            if (process.env.NODE_ENV === 'development') {
              console.log("⚠️ AuthContext: Setting default role for development environment only");
              setUserRole("alumni");
            } else {
              setUserRole(null);
            }
          }
        } catch (error) {
          console.error('❌ Error fetching user data:', error);

          // In production, don't set a default role
          if (process.env.NODE_ENV === 'development') {
            console.log("⚠️ AuthContext: Setting default role for development environment only");
            setUserRole("alumni");
          } else {
            setUserRole(null);
          }
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  // Function to get the user's ID token with refresh logic
  const getUserToken = async () => {
    if (!currentUser) {
      console.warn('❌ getUserToken: No current user available');
      return null;
    }

    try {
      console.log('🔄 getUserToken: Getting token for user:', currentUser.uid);

      // Get token with expiration info
      const tokenResult = await currentUser.getIdTokenResult();
      const expirationTime = new Date(tokenResult.expirationTime).getTime();
      const now = Date.now();
      const minutesRemaining = Math.floor((expirationTime - now) / 60000);

      // If token expires in less than 5 minutes, force refresh
      if (expirationTime - now < 5 * 60 * 1000) {
        console.log(`🔄 getUserToken: Token expires soon (${minutesRemaining} minutes), refreshing...`);
        const newToken = await currentUser.getIdToken(true); // Force refresh
        console.log(`✅ getUserToken: Token refreshed successfully, new length: ${newToken.length}`);
        return newToken;
      }

      console.log(`🔑 getUserToken: Using valid token (expires in ${minutesRemaining} minutes), length: ${tokenResult.token.length}`);
      return tokenResult.token;
    } catch (error) {
      console.error("❌ getUserToken Error:", error);
      console.error("❌ getUserToken Stack:", error.stack);

      // Try one more time with force refresh
      try {
        console.log('🔄 getUserToken: Attempting force refresh after error...');
        const forceToken = await currentUser.getIdToken(true);
        console.log(`✅ getUserToken: Force refresh successful, token length: ${forceToken.length}`);
        return forceToken;
      } catch (retryError) {
        console.error("❌ getUserToken Retry Error:", retryError);
        return null;
      }
    }
  };

  const value = {
    currentUser,
    role: userRole,
    userRole, // Add this for compatibility with both naming conventions
    userData,
    loading,
    login,
    signup,
    logout,
    getUserToken
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}