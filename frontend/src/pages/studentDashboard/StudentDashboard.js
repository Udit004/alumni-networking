import React, { useState } from "react";
import EnrolledEvents from "./EnrolledEvents"; // Import the EnrolledEvents component

// import { useState } from "react";
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
      <div
        className="sidebar bg-dark text-white vh-100 p-3"
        style={{
          width: "200px", // initial width
          position: "fixed",
          transition: "width 0.3s ease-in-out", // add transition effect
        }}
      ><button className="btn btn-secondary justify-content-center" onClick={() => {
          const sidebar = document.querySelector(".sidebar");
          if (sidebar.style.width === "250px") {
            sidebar.style.width = "50px";
          } else {
            sidebar.style.width = "250px";
          }
        }}>
          <i className="fas fa-bars" />
        </button>
        {/* rest of your sidebar content */}

        <h4 className="text-center">Student Dashboard</h4>
        <nav className="nav flex-column align-items-center">
          <button
            className={`nav-link text-white ${activeSection === "profile" ? "active bg-secondary" : ""}`}
            onClick={() => setActiveSection("profile")}
          >
            <i className="fas fa-user" /> Profile
          </button>
          <button
            className={`nav-link text-white ${activeSection === "events" ? "active bg-secondary" : ""}`}
            onClick={() => setActiveSection("events")}
          >
            <i className="fas fa-calendar" /> Enrolled Events
          </button>
          <button
            className={`nav-link text-white ${activeSection === "courses" ? "active bg-secondary" : ""}`}
            onClick={() => setActiveSection("courses")}
          >
            <i className="fas fa-book" /> Course Materials
          </button>
          <button
            className={`nav-link text-white ${activeSection === "mentorship" ? "active bg-secondary" : ""}`}
            onClick={() => setActiveSection("mentorship")}
          >
            <i className="fas fa-user-tie" /> Mentorship Programs
          </button>
          <button
            className={`nav-link text-white ${activeSection === "jobs" ? "active bg-secondary" : ""}`}
            onClick={() => setActiveSection("jobs")}
          >
            <i className="fas fa-briefcase" /> Job & Internships
          </button>
          <button
            className={`nav-link text-white ${activeSection === "forum" ? "active bg-secondary" : ""}`}
            onClick={() => setActiveSection("forum")}
          >
            <i className="fas fa-comments" /> Networking & Forums
          </button>
          <button
            className={`nav-link text-white ${activeSection === "membership" ? "active bg-secondary" : ""}`}
            onClick={() => setActiveSection("membership")}
          >
            <i className="fas fa-id-card" /> Membership Benefits
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="content p-4" style={{ marginLeft: "250px", width: "100%" }}>
        {activeSection === "profile" && (
          <div>
            <h3>Profile</h3>
            <div className="row">
              <div className="col-md-6">
                <div className="card">
                  <img src="path_to_photo" alt="Profile" className="card-img-top" />
                  <div className="card-body">
                    <h5 className="card-title">Name</h5>
                    <p className="card-text">College Name</p>
                    <a href="linkedin_profile_link" className="btn btn-primary">LinkedIn Profile</a>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card mt-3">
                  <div className="card-body">
                    <h5 className="card-title">Connection Number</h5>
                    <p className="card-text">100</p>

                    <p className="card-text">100</p>

                    <p className="card-text">100</p>

                    <p className="card-text">100</p>

                    <p className="card-text">100</p>
                    <h5 className="card-title">Department</h5>
                    <p className="card-text">Computer Science</p>

                    <p className="card-text">Computer Science</p>

                    <p className="card-text">Computer Science</p>

                    <p className="card-text">Computer Science</p>

                    <p className="card-text">Computer Science</p>
                    <h5 className="card-title">Skills</h5>
                    <p className="card-text">JavaScript, React</p>

                    <p className="card-text">JavaScript, React</p>

                    <p className="card-text">JavaScript, React</p>

                    <p className="card-text">JavaScript, React</p>

                    <p className="card-text">JavaScript, React</p>
                    <h5 className="card-title">Hobbies</h5>
                    <p className="card-text">Reading, Traveling</p>

                    <p className="card-text">Reading, Traveling</p>

                    <p className="card-text">Reading, Traveling</p>

                    <p className="card-text">Reading, Traveling</p>

                    <p className="card-text">Reading, Traveling</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "events" && <EnrolledEvents />}
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
