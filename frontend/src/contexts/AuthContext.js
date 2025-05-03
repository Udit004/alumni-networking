import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Create Auth Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);

      if (user) {
        console.log("✅ AuthContext: User logged in:", user);
        setCurrentUser(user);

        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("✅ AuthContext: User role fetched:", userData.role);
            setUserRole(userData.role || null);
            localStorage.setItem("userRole", userData.role); // Store role for persistence
          } else {
            console.log("⚠️ AuthContext: No role found in Firestore");
            setUserRole(null);
            localStorage.removeItem("userRole");
          }
        } catch (error) {
          console.error("❌ AuthContext: Error fetching user role:", error);
          setUserRole(null);
        }
      } else {
        console.log("🔴 AuthContext: User logged out");
        setCurrentUser(null);
        setUserRole(null);
        localStorage.removeItem("userRole");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
    userRole,
    loading,
    getUserToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
