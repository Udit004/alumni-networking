import React from "react";
import { useAuth } from "../AuthContext";
// import { signOut } from "firebase/auth";
// import { auth } from "../firebaseConfig";
// import { useNavigate } from "react-router-dom";

const TeacherDashboard = () => {
  const { user } = useAuth();
  // const navigate = useNavigate();

  // const handleLogout = async () => {
  //   await signOut(auth);
  //   navigate("/login");
  // };

  return (
    <div>
      <h2>Welcome, {user?.email}!</h2>
      <h3>🎓 Teacher Dashboard</h3>
      <p>Manage students, mentor alumni, and share knowledge.</p>
      {/* <button onClick={handleLogout}>Logout</button> */}
    </div>
  );
};

export default TeacherDashboard;
