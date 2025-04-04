import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState({
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User'
  });
  const [loading, setLoading] = useState(false);

  const login = (email, password) => {
    console.log(`Mock login with ${email} and ${password}`);
    setCurrentUser({
      uid: 'test-user-id',
      email: email,
      displayName: 'Test User'
    });
    return Promise.resolve();
  };

  const signup = (email, password) => {
    console.log(`Mock signup with ${email} and ${password}`);
    setCurrentUser({
      uid: 'test-user-id',
      email: email,
      displayName: 'Test User'
    });
    return Promise.resolve();
  };

  const logout = () => {
    setCurrentUser(null);
    return Promise.resolve();
  };

  const value = {
    currentUser,
    role: 'user',
    userData: { name: 'Test User', role: 'user' },
    loading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext; 