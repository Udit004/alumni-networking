import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Create Auth Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);

      if (currentUser) {
        console.log("✅ AuthContext: User logged in:", currentUser);
        setUser(currentUser);

        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("✅ AuthContext: User role fetched:", userData.role);
            setRole(userData.role || null);
            localStorage.setItem("role", userData.role); // Store role for persistence
          } else {
            console.log("⚠️ AuthContext: No role found in Firestore");
            setRole(null);
            localStorage.removeItem("role");
          }
        } catch (error) {
          console.error("❌ AuthContext: Error fetching user role:", error);
          setRole(null);
        }
      } else {
        console.log("🔴 AuthContext: User logged out");
        setUser(null);
        setRole(null);
        localStorage.removeItem("role");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
