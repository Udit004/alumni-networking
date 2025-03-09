import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext"; // Import Auth context
import { auth, db } from "../firebaseConfig"; 
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Navbar.css';

function Navbar() {
  const { user } = useAuth(); // Get logged-in user
  const [userData, setUserData] = useState(null);
  const { role } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data()); // Store user data
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login"; // Redirect after logout
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <h2 className="navbar-brand">ALUMNI NETWORKING</h2>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="nav-list collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><Link className="nav-link active" to="/">Home</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/about">About</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/events">Events</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/contact">Contact</Link></li>

            {/* Show Login if user is NOT logged in */}
            {!user && <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>}

            {/* Show Profile Dropdown if user is logged in */}
            {user && userData && (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  {userData.name || "Profile"}
                </a>
                <ul className="dropdown-menu">
                  <li>
                    {/* Show Dashboard only after login */}
                    {user && (
                      <>
                        {role === "student" && <li className="dropdown-item"><Link className="nav-link" to="/student-dashboard">Dashboard</Link></li>}
                        {role === "teacher" && <li className="dropdown-item"><Link className="nav-link" to="/teacher-dashboard">Dashboard</Link></li>}
                        {role === "alumni" && <li className="dropdown-item"><Link className="nav-link" to="/alumni-dashboard">Dashboard</Link></li>}
                        
                        {/* <li className="nav-item">
                          <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
                        </li> */}
                      </>
                    )}
                    </li>
                  <li><Link className="dropdown-item" to="/profile">View Profile</Link></li>
                  <li><button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button></li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
