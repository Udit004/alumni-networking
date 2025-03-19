import React from "react";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
// import { useAuth } from "../AuthContext";
// import { signOut } from "firebase/auth";
// import { auth } from "../firebaseConfig";
// import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const [activeSection, setActiveSection] = useState("profile");

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="sidebar bg-dark text-white vh-100 p-3" style={{ width: "250px", position: "fixed" }}>
        <h4 className="text-center">Student Dashboard</h4>
        <nav className="nav flex-column">
          <button className={`nav-link text-white ${activeSection === "profile" ? "active bg-secondary" : ""}`} onClick={() => setActiveSection("profile")}>
            Profile
          </button>
          <button className={`nav-link text-white ${activeSection === "events" ? "active bg-secondary" : ""}`} onClick={() => setActiveSection("events")}>
            Enrolled Events
          </button>
          <button className={`nav-link text-white ${activeSection === "courses" ? "active bg-secondary" : ""}`} onClick={() => setActiveSection("courses")}>
            Course Materials
          </button>
          <button className={`nav-link text-white ${activeSection === "mentorship" ? "active bg-secondary" : ""}`} onClick={() => setActiveSection("mentorship")}>
            Mentorship Programs
          </button>
          <button className={`nav-link text-white ${activeSection === "jobs" ? "active bg-secondary" : ""}`} onClick={() => setActiveSection("jobs")}>
            Job & Internships
          </button>
          <button className={`nav-link text-white ${activeSection === "forum" ? "active bg-secondary" : ""}`} onClick={() => setActiveSection("forum")}>
            Networking & Forums
          </button>
          <button className={`nav-link text-white ${activeSection === "membership" ? "active bg-secondary" : ""}`} onClick={() => setActiveSection("membership")}>
            Membership Benefits
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="content p-4" style={{ marginLeft: "260px", width: "100%" }}>
        <h2>Welcome to Your Dashboard</h2>
        <p>Select a section from the sidebar to view details.</p>

        {activeSection === "profile" && (
          <div>
            <h3>Profile</h3>
            <div className=" container container-fluid col-md-2 col-sm-1 bg-dark">

            </div>
          </div>
        )}

        {activeSection === "events" && (
          <div>
            <h3>Enrolled Events</h3>
            <p>List of events you have registered for.</p>
          </div>
        )}

        {activeSection === "courses" && (
          <div>
            <h3>Course Materials</h3>
            <p>Access your study resources here.</p>
          </div>
        )}

        {activeSection === "mentorship" && (
          <div>
            <h3>Mentorship Programs</h3>
            <p>Connect with alumni mentors.</p>
          </div>
        )}

        {activeSection === "jobs" && (
          <div>
            <h3>Job & Internships</h3>
            <p>Find opportunities that suit you.</p>
          </div>
        )}

        {activeSection === "forum" && (
          <div>
            <h3>Networking & Forums</h3>
            <p>Engage in student discussions.</p>
          </div>
        )}

        {activeSection === "membership" && (
          <div>
            <h3>Membership Benefits</h3>
            <p>Exclusive features for premium members.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
