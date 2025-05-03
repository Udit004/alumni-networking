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
    if (!currentUser) return null;
    try {
      // Get token with expiration info
      const tokenResult = await currentUser.getIdTokenResult();
      const expirationTime = new Date(tokenResult.expirationTime).getTime();
      const now = Date.now();

      // If token expires in less than 5 minutes, force refresh
      if (expirationTime - now < 5 * 60 * 1000) {
        console.log('🔄 Token close to expiration, refreshing...');
        return await currentUser.getIdToken(true); // Force refresh
      }

      console.log(`🔑 Using valid token (expires in ${Math.floor((expirationTime - now) / 60000)} minutes)`);
      return tokenResult.token;
    } catch (error) {
      console.error("❌ Error getting user token:", error);
      return null;
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