import React from "react";
import { useAuth } from "../AuthContext";
// import { signOut } from "firebase/auth";
// import { auth } from "../firebaseConfig";
// import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const { user } = useAuth();
  // const navigate = useNavigate();

  // const handleLogout = async () => {
  //   await signOut(auth);
  //   navigate("/login");
  // };

  return (
    <div>
      <h2>Welcome, {user?.email}!</h2>
      <h3>📚 Student Dashboard</h3>
      <p>Access courses, connect with alumni, and grow your career.</p>
      {/* <button onClick={handleLogout}>Logout</button> */}
    </div>
  );
};

export default StudentDashboard;
