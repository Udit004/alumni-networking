import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


const ProtectedRoute = ({ element, allowedRoles }) => {
  const { currentUser, role, loading } = useAuth();

  if (loading) return <p>Loading...</p>; // Prevent blank screen while fetching role

  if (!currentUser) {
    console.log("Redirecting: No user found");
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(role)) {
    console.log(`Access Denied: User role ${role} not allowed`);
    return <Navigate to="/login" />;
  }

  return element;
};

export default ProtectedRoute;
