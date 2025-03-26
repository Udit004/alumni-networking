import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const TeacherDashboard = () => {
  const [activeSection, setActiveSection] = useState("profile");

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div
        className="sidebar bg-dark text-white vh-100 p-3"
        style={{
          width: "250px",
          position: "fixed",
          transition: "width 0.3s ease-in-out",
        }}
      >
        <button
          className="btn btn-secondary justify-content-center"
          onClick={() => {
            const sidebar = document.querySelector(".sidebar");
            if (sidebar.style.width === "250px") {
              sidebar.style.width = "50px";
            } else {
              sidebar.style.width = "250px";
            }
          }}
        >
          <i className="fas fa-bars" />
        </button>

        <h4 className="text-center">Teacher Dashboard</h4>
        <nav className="nav flex-column align-items-center">
          <button
            className={`nav-link text-white ${
              activeSection === "profile" ? "active bg-secondary" : ""
            }`}
            onClick={() => setActiveSection("profile")}
          >
            <i className="fas fa-user" /> Profile
          </button>
          <button
            className={`nav-link text-white ${
              activeSection === "events" ? "active bg-secondary" : ""
            }`}
            onClick={() => setActiveSection("events")}
          >
            <i className="fas fa-calendar" /> Manage Events
          </button>
          <button
            className={`nav-link text-white ${
              activeSection === "students" ? "active bg-secondary" : ""
            }`}
            onClick={() => setActiveSection("students")}
          >
            <i className="fas fa-users" /> Student Management
          </button>
          <button
            className={`nav-link text-white ${
              activeSection === "courses" ? "active bg-secondary" : ""
            }`}
            onClick={() => setActiveSection("courses")}
          >
            <i className="fas fa-book" /> Course Management
          </button>
          <button
            className={`nav-link text-white ${
              activeSection === "mentorship" ? "active bg-secondary" : ""
            }`}
            onClick={() => setActiveSection("mentorship")}
          >
            <i className="fas fa-user-tie" /> Mentorship Programs
          </button>
          <button
            className={`nav-link text-white ${
              activeSection === "analytics" ? "active bg-secondary" : ""
            }`}
            onClick={() => setActiveSection("analytics")}
          >
            <i className="fas fa-chart-bar" /> Analytics
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="content p-4" style={{ marginLeft: "250px", width: "100%" }}>
        {activeSection === "profile" && (
          <div>
            <h3>Teacher Profile</h3>
            <div className="row">
              <div className="col-md-6">
                <div className="card">
                  <img src="path_to_photo" alt="Profile" className="card-img-top" />
                  <div className="card-body">
                    <h5 className="card-title">Name</h5>
                    <p className="card-text">Department</p>
                    <a href="linkedin_profile_link" className="btn btn-primary">
                      LinkedIn Profile
                    </a>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card mt-3">
                  <div className="card-body">
                    <h5 className="card-title">Department</h5>
                    <p className="card-text">Computer Science</p>
                    <h5 className="card-title">Courses Teaching</h5>
                    <p className="card-text">Data Structures, Algorithms</p>
                    <h5 className="card-title">Expertise</h5>
                    <p className="card-text">Machine Learning, AI</p>
                    <h5 className="card-title">Research Areas</h5>
                    <p className="card-text">Deep Learning, Computer Vision</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "events" && (
          <div>
            <h3>Manage Events</h3>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Create New Event</h5>
                <form>
                  <div className="mb-3">
                    <label className="form-label">Event Title</label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows="3"></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Time</label>
                    <input type="time" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Location</label>
                    <input type="text" className="form-control" />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Create Event
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeSection === "students" && (
          <div>
            <h3>Student Management</h3>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Enrolled Students</h5>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>John Doe</td>
                        <td>john@example.com</td>
                        <td>Computer Science</td>
                        <td>
                          <button className="btn btn-sm btn-primary">View</button>
                          <button className="btn btn-sm btn-danger">Remove</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "courses" && (
          <div>
            <h3>Course Management</h3>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Your Courses</h5>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">Data Structures</h5>
                        <p className="card-text">CS101</p>
                        <button className="btn btn-primary">Manage</button>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">Algorithms</h5>
                        <p className="card-text">CS102</p>
                        <button className="btn btn-primary">Manage</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "mentorship" && (
          <div>
            <h3>Mentorship Programs</h3>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Active Mentees</h5>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Department</th>
                        <th>Progress</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Jane Smith</td>
                        <td>Computer Science</td>
                        <td>In Progress</td>
                        <td>
                          <button className="btn btn-sm btn-primary">View Progress</button>
                          <button className="btn btn-sm btn-success">Schedule Meeting</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "analytics" && (
          <div>
            <h3>Analytics Dashboard</h3>
            <div className="row">
              <div className="col-md-4 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Total Students</h5>
                    <h2 className="card-text">150</h2>
                    <p className="text-success">↑ 10% from last month</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Active Events</h5>
                    <h2 className="card-text">5</h2>
                    <p className="text-success">↑ 2 new this month</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Mentorship Rate</h5>
                    <h2 className="card-text">85%</h2>
                    <p className="text-success">↑ 5% from last month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard; 